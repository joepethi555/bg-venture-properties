import express from 'express';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { allProperties, liveDetail, search, facets, ADMIN_API } from './store.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');
const INQUIRIES_FILE = join(root, '..', 'data', 'inquiries.json');

// The site currently sets no cookies or sessions. Any future cookie/session
// must use these hardened defaults — pass them to every res.cookie() call.
export const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INQUIRY_TYPES = ['buy', 'rent', 'sell', 'lease', 'management', 'general'];

// Serialize writes so concurrent submissions cannot corrupt the JSON file.
// A failed write must not poison the queue — recover and keep accepting.
let writeQueue = Promise.resolve();
function saveInquiry(record) {
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    let list = [];
    try { list = JSON.parse(await readFile(INQUIRIES_FILE, 'utf8')); } catch { /* first write */ }
    list.push(record);
    await mkdir(dirname(INQUIRIES_FILE), { recursive: true });
    await writeFile(INQUIRIES_FILE, JSON.stringify(list, null, 1));
  });
  return writeQueue;
}

function validateInquiry(body, requireConsent) {
  const { name, email, phone, type, message, consent } = body ?? {};
  const errors = [];
  if (typeof name !== 'string' || !name.trim()) errors.push('name');
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.push('email');
  if (!INQUIRY_TYPES.includes(type)) errors.push('type');
  if (typeof message !== 'string' || !message.trim()) errors.push('message');
  if (phone != null && String(phone).length > 40) errors.push('phone');
  if (requireConsent && consent !== true) errors.push('consent');
  return errors;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: ${ADMIN_API}; connect-src 'self' ${ADMIN_API}; frame-src https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`,
    );
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'bg-venture-properties' }));

  // ----- properties -----
  app.get('/api/meta', async (_req, res) => {
    const list = await allProperties();
    const f = facets(list);
    res.json({
      total: list.length,
      live: list.filter((p) => !p.sample).length,
      locations: f.locations,
      categories: f.categories,
    });
  });

  app.get('/api/properties', async (req, res) => {
    const list = await allProperties();
    const results = search(list, req.query);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 12));
    const start = (page - 1) * limit;
    res.json({
      total: results.length,
      page,
      pages: Math.max(1, Math.ceil(results.length / limit)),
      properties: results.slice(start, start + limit),
    });
  });

  app.get('/api/properties/:id', async (req, res) => {
    const id = req.params.id;
    const list = await allProperties();
    const hit = list.find((p) => p.slug === id || p.ref === id);
    if (!hit) return res.status(404).json({ error: 'Property not found' });
    if (hit.source === 'live') {
      const full = await liveDetail(hit.live_id).catch(() => null);
      return res.json({ property: full || hit });
    }
    return res.json({ property: hit });
  });

  // ----- inquiries -----
  app.post('/api/inquiries', async (req, res) => {
    const errors = validateInquiry(req.body, true);
    if (errors.length) return res.status(400).json({ error: `Invalid or missing fields: ${errors.join(', ')}` });
    const { name, email, phone, type, message, property_ref } = req.body;
    const record = {
      id: randomUUID(),
      received_at: new Date().toISOString(),
      type, name: String(name).trim().slice(0, 120),
      email: String(email).trim().slice(0, 254),
      phone: phone ? String(phone).trim().slice(0, 40) : null,
      property_ref: property_ref ? String(property_ref).slice(0, 64) : null,
      message: String(message).trim().slice(0, 2000),
      status: 'new',
    };
    try {
      await saveInquiry(record);
    } catch {
      return res.status(500).json({ error: 'Inquiry could not be stored — please email admin@bgventureproperties.ae' });
    }
    return res.status(202).json({ received: true, id: record.id });
  });

  // Staff retrieval — requires ADMIN_TOKEN env var (Authorization: Bearer <token>).
  app.get('/api/inquiries', async (req, res) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token) return res.status(403).json({ error: 'Inquiry admin endpoint disabled — set ADMIN_TOKEN' });
    if (req.headers.authorization !== `Bearer ${token}`) return res.status(401).json({ error: 'Unauthorized' });
    let list = [];
    try { list = JSON.parse(await readFile(INQUIRIES_FILE, 'utf8')); } catch { /* none yet */ }
    res.json({ total: list.length, inquiries: list.slice().reverse() });
  });

  // Legacy general-enquiry endpoint — validates and now also persists.
  app.post('/api/enquiry', async (req, res) => {
    const { name, email, service, message } = req.body ?? {};
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, service, message' });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    try {
      await saveInquiry({
        id: randomUUID(), received_at: new Date().toISOString(), type: 'general',
        name: String(name).trim().slice(0, 120), email: String(email).trim().slice(0, 254),
        phone: req.body.phone ? String(req.body.phone).trim().slice(0, 40) : null,
        property_ref: null, service: String(service).slice(0, 120),
        message: String(message).trim().slice(0, 2000), status: 'new',
      });
    } catch {
      return res.status(500).json({ error: 'Enquiry could not be stored' });
    }
    return res.status(202).json({ received: true, note: 'Enquiry logged for follow-up by the BG Venture Properties team.' });
  });

  if (existsSync(dist)) {
    app.use(express.static(dist, {
      maxAge: '1h', index: 'index.html',
      // index.html must always revalidate — hashed assets can cache for an
      // hour, but the HTML shell must fetch fresh or users see stale builds.
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
      },
    }));
    app.get('*', (_req, res) => res.sendFile(join(dist, 'index.html')));
  } else {
    app.get('*', (_req, res) => res.status(503).send('Frontend not built yet. Run: npm run build'));
  }
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  createApp().listen(port, host, () => console.log(`BG Venture Properties running at http://${host}:${port}`));
}
