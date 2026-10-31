// Unified property store: the sample inventory (data/properties.json) merged
// with live published listings from the BG Venture admin API. Live listings are
// cached briefly; if the admin API is unreachable the site still serves the
// sample inventory. Real listings are never flagged as samples.
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADMIN_API, normalizeLive, search, facets } from './store-core.mjs';

export { ADMIN_API, normalizeLive, search, facets };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = join(root, 'data', 'properties.json');

const LIVE_TTL = 5 * 60 * 1000;
let samples = [];
let live = [];
let liveFetchedAt = 0;

export async function loadSamples() {
  try {
    samples = JSON.parse(await readFile(DATA_FILE, 'utf8')).map((p) => ({ ...p, source: 'sample' }));
  } catch {
    samples = [];
  }
  return samples;
}

async function refreshLive() {
  try {
    const res = await fetch(`${ADMIN_API}/api/public/properties`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    live = (data.properties || []).map(normalizeLive);
  } catch {
    if (!liveFetchedAt) live = []; // keep serving stale cache on failure
  }
  liveFetchedAt = Date.now();
  return live;
}

export async function allProperties() {
  if (!samples.length) await loadSamples();
  if (Date.now() - liveFetchedAt > LIVE_TTL) await refreshLive();
  return [...live, ...samples];
}

export async function liveDetail(liveId) {
  const res = await fetch(`${ADMIN_API}/api/public/properties/${liveId}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const d = await res.json();
  const p = normalizeLive(d.property);
  p.images = (d.images || []).map((im) => `${ADMIN_API}/api/public/properties/${d.property.id}/media/${im.id}`);
  p.amenities = d.details?.amenities || [];
  p.nearby = d.details?.nearby_places || [];
  p.map_url = d.details?.map_url || null;
  return p;
}
