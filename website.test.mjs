import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { createApp } from './server/server.mjs';

const distIndex = join(dirname(fileURLToPath(import.meta.url)), 'dist', 'index.html');
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

test('security headers are present', async () => {
  const res = await fetch(`${origin}/api/health`);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.match(res.headers.get('content-security-policy') ?? '', /default-src 'self'/);
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('React source contains required content and translations', () => {
  const app = readFileSync(new URL('./src/App.tsx', import.meta.url), 'utf8');
  for (const text of ['BG Venture Properties', 'Regal Tower', 'admin@bgventureproperties.ae', '+971 52 154 3487', 'Returns are not guaranteed', 'Leasing property brokerage', 'Management supervision', '200', '5,000']) {
    assert.ok(app.includes(text), `Missing in App.tsx: ${text}`);
  }
  const i18n = readFileSync(new URL('./src/i18n.ts', import.meta.url), 'utf8');
  for (const key of ['hero.eyebrow', 'mission.text', 'vision.text', 'svc1.h']) {
    assert.ok(i18n.includes(`'${key}'`), `Missing Arabic translation key: ${key}`);
  }
});

test('built frontend exists and serves the app when dist is present', { skip: !existsSync(distIndex) }, async () => {
  const res = await fetch(origin);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('BG Venture Properties'));
});
