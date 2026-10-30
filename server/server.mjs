import express from 'express';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');

// The site currently sets no cookies or sessions. Any future cookie/session
// must use these hardened defaults — pass them to every res.cookie() call.
export const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };

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
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'bg-venture-properties' }));

  app.post('/api/enquiry', (req, res) => {
    const { name, email, service, message } = req.body ?? {};
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, service, message' });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    return res.status(202).json({ received: true, note: 'Enquiry logged for follow-up by the BG Venture Properties team.' });
  });

  if (existsSync(dist)) {
    app.use(express.static(dist, { maxAge: '1h', index: 'index.html' }));
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
