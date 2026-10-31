import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { createApp } from './server/server.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const distIndex = join(root, 'dist', 'index.html');
let server;
let origin;
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
});

test('health endpoint responds with service info', async () => {
  const res = await fetch(`${origin}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'bg-venture-properties');
});

test('enquiry API validates required fields and email', async () => {
  const missing = await fetch(`${origin}/api/enquiry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test' }) });
  assert.equal(missing.status, 400);
  const badEmail = await fetch(`${origin}/api/enquiry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'T', email: 'not-an-email', service: 'Office leasing', message: 'Hi' }) });
  assert.equal(badEmail.status, 400);
  const ok = await fetch(`${origin}/api/enquiry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'T', email: 't@example.com', service: 'Office leasing', message: 'Hi' }) });
  assert.equal(ok.status, 202);
  assert.equal((await ok.json()).received, true);
});

test('inquiries API validates, requires consent, and persists', async () => {
  const noConsent = await fetch(`${origin}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'T', email: 't@example.com', type: 'buy', message: 'Hi', consent: false }) });
  assert.equal(noConsent.status, 400);
  const ok = await fetch(`${origin}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'T', email: 't@example.com', phone: '+971501234567', type: 'rent', message: 'Interested in BGVS-0001', consent: true, property_ref: 'BGVS-0001' }) });
  assert.equal(ok.status, 202);
  const body = await ok.json();
  assert.equal(body.received, true);
  assert.ok(body.id);
});

test('properties API returns searchable inventory', async () => {
  const res = await fetch(`${origin}/api/properties?purpose=sale&category=villa&limit=5`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.total > 0, 'expected villa results');
  assert.ok(body.properties.length <= 5);
  for (const p of body.properties) {
    assert.equal(p.purpose, 'sale');
    assert.equal(p.category, 'villa');
  }
});

test('property detail resolves by slug and ref, 404s on unknown', async () => {
  const list = await (await fetch(`${origin}/api/properties?limit=1`)).json();
  const p = list.properties[0];
  const bySlug = await fetch(`${origin}/api/properties/${p.slug}`);
  assert.equal(bySlug.status, 200);
  assert.equal((await bySlug.json()).property.ref, p.ref);
  const missing = await fetch(`${origin}/api/properties/does-not-exist`);
  assert.equal(missing.status, 404);
});

test('meta endpoint returns locations and categories', async () => {
  const res = await fetch(`${origin}/api/meta`);
  const body = await res.json();
  assert.ok(body.total > 500);
  assert.ok(body.locations.includes('Dubai Marina'));
  assert.ok(body.categories.apartment > 0);
});

test('inquiry admin endpoint is protected', async () => {
  const res = await fetch(`${origin}/api/inquiries`);
  assert.ok([401, 403].includes(res.status));
});

test('security headers are present', async () => {
  const res = await fetch(`${origin}/api/health`);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.match(res.headers.get('content-security-policy') ?? '', /default-src 'self'/);
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('frontend source contains required brand and compliance content', () => {
  const app = readFileSync(new URL('./src/pages/Home.tsx', import.meta.url), 'utf8');
  for (const text of ['200+', '5,000', 'Landlords supported']) {
    assert.ok(app.includes(text), `Missing in Home.tsx: ${text}`);
  }
  const about = readFileSync(new URL('./src/pages/About.tsx', import.meta.url), 'utf8');
  for (const text of ['BG Venture Properties', 'Returns are not guaranteed', 'Leasing property brokerage', 'management supervision']) {
    assert.ok(about.includes(text), `Missing in About.tsx: ${text}`);
  }
  const content = readFileSync(new URL('./src/lib/content.ts', import.meta.url), 'utf8');
  for (const text of ['admin@bgventureproperties.ae', '+971 52 154 3487', 'Regal Tower']) {
    assert.ok(content.includes(text), `Missing in content.ts: ${text}`);
  }
  const i18n = readFileSync(new URL('./src/i18n.ts', import.meta.url), 'utf8');
  for (const key of ['hero.eyebrow', 'mission.text', 'vision.text', 'svc1.h']) {
    assert.ok(i18n.includes(`'${key}'`), `Missing Arabic translation key: ${key}`);
  }
});

test('sample inventory exists and is flagged', () => {
  const props = JSON.parse(readFileSync(new URL('./data/properties.json', import.meta.url), 'utf8'));
  assert.ok(props.length >= 540, `expected 540+ sample properties, got ${props.length}`);
  assert.ok(props.every((p) => p.sample === true), 'all generated records must be flagged sample');
  assert.ok(props.every((p) => p.images.length >= 3), 'each property needs gallery images');
});

test('built frontend exists and serves the app when dist is present', { skip: !existsSync(distIndex) }, async () => {
  const res = await fetch(origin);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('BG Venture Properties'));
});
