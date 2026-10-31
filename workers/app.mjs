// Cloudflare Worker: serves the built frontend (dist) plus the /api surface —
// same endpoints as server/server.mjs, without node:fs. Sample inventory is
// bundled from data/properties.json at deploy time. Live listings are merged
// from the admin API with a short cache.
import { ADMIN_API, normalizeLive, search, facets } from '../server/store-core.mjs';
import SAMPLES from '../data/properties.json' with { type: 'json' };

const samples = SAMPLES.map((p) => ({ ...p, source: 'sample' }));
const LIVE_TTL = 5 * 60 * 1000;
let live = [];
let liveFetchedAt = 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INQUIRY_TYPES = ['buy', 'rent', 'sell', 'lease', 'management', 'general'];

async function allProperties(env) {
  if (Date.now() - liveFetchedAt > LIVE_TTL) {
    try {
      const res = await (env?.ADMIN ?? { fetch: globalThis.fetch }).fetch(`${ADMIN_API}/api/public/properties`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) live = ((await res.json()).properties || []).map(normalizeLive);
    } catch { /* keep stale/empty */ }
    liveFetchedAt = Date.now();
  }
  return [...live, ...samples];
}

const API_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: API_HEADERS });

const csp = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: ${ADMIN_API}; connect-src 'self' ${ADMIN_API}; frame-src https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const q = Object.fromEntries(url.searchParams);

    if (path === '/api/health') return json({ status: 'ok', service: 'bg-venture-properties', runtime: 'worker' });

    if (path === '/api/meta') {
      const list = await allProperties(env);
      const f = facets(list);
      return json({ total: list.length, live: list.filter((p) => !p.sample).length, locations: f.locations, categories: f.categories });
    }

    if (path === '/api/properties') {
      const list = await allProperties(env);
      const results = search(list, q);
      const page = Math.max(1, Number(q.page) || 1);
      const limit = Math.min(60, Math.max(1, Number(q.limit) || 12));
      return json({ total: results.length, page, pages: Math.max(1, Math.ceil(results.length / limit)), properties: results.slice((page - 1) * limit, page * limit) });
    }

    if (path.startsWith('/api/properties/')) {
      const id = decodeURIComponent(path.slice('/api/properties/'.length));
      const hit = (await allProperties(env)).find((p) => p.slug === id || p.ref === id);
      if (!hit) return json({ error: 'Property not found' }, 404);
      if (hit.source === 'live') {
        try {
          const r = await (env?.ADMIN ?? { fetch: globalThis.fetch }).fetch(`${ADMIN_API}/api/public/properties/${hit.live_id}`, { signal: AbortSignal.timeout(8000) });
          if (r.ok) {
            const d = await r.json();
            const p = normalizeLive(d.property);
            p.images = (d.images || []).map((im) => `${ADMIN_API}/api/public/properties/${d.property.id}/media/${im.id}`);
            p.amenities = d.details?.amenities || [];
            p.nearby = d.details?.nearby_places || [];
            p.map_url = d.details?.map_url || null;
            return json({ property: p });
          }
        } catch { /* fall through to list record */ }
      }
      return json({ property: hit });
    }

    if (path === '/api/inquiries' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      const { name, email, phone, type, message, consent, property_ref } = body ?? {};
      const errors = [];
      if (typeof name !== 'string' || !name.trim()) errors.push('name');
      if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.push('email');
      if (!INQUIRY_TYPES.includes(type)) errors.push('type');
      if (typeof message !== 'string' || !message.trim()) errors.push('message');
      if (consent !== true) errors.push('consent');
      if (errors.length) return json({ error: `Invalid or missing fields: ${errors.join(', ')}` }, 400);
      // Durable storage needs a KV/D1 binding (env.INQUIRIES). Mailto remains
      // the primary delivery channel; log to Workers observability meanwhile.
      console.log('inquiry', JSON.stringify({ name, email, phone, type, property_ref, at: new Date().toISOString() }));
      if (env.INQUIRIES) await env.INQUIRIES.put(`inq:${crypto.randomUUID()}`, JSON.stringify({ name, email, phone, type, message, property_ref, at: new Date().toISOString() }));
      return json({ received: true }, 202);
    }

    if (path === '/api/inquiries') return json({ error: 'Inquiry admin endpoint disabled — set ADMIN_TOKEN' }, 403);

    if (path === '/api/enquiry' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
      const { name, email, service, message } = body ?? {};
      if (!name || !email || !service || !message) return json({ error: 'Missing required fields: name, email, service, message' }, 400);
      if (!EMAIL_RE.test(email)) return json({ error: 'Invalid email address' }, 400);
      console.log('enquiry', JSON.stringify({ name, email, service, at: new Date().toISOString() }));
      return json({ received: true }, 202);
    }

    // Everything else: static assets (SPA fallback handled by assets config).
    const resp = await env.ASSETS.fetch(request);
    const h = new Headers(resp.headers);
    h.set('x-content-type-options', 'nosniff');
    h.set('x-frame-options', 'DENY');
    h.set('referrer-policy', 'strict-origin-when-cross-origin');
    h.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
    h.set('cross-origin-opener-policy', 'same-origin');
    h.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    h.set('content-security-policy', csp);
    const isHtml = (h.get('content-type') || '').includes('text/html');
    h.set('cache-control', isHtml ? 'no-cache' : 'public, max-age=3600');
    return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: h });
  },
};
