// Unified property store: the sample inventory (data/properties.json) merged
// with live published listings from the BG Venture admin API. Live listings are
// cached briefly; if the admin API is unreachable the site still serves the
// sample inventory. Real listings are never flagged as samples.
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = join(root, 'data', 'properties.json');
export const ADMIN_API = process.env.ADMIN_API || 'https://bgv-admin.joepethj.workers.dev';

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

const CATEGORY_MAP = {
  apartment: 'apartment', flat: 'apartment', penthouse: 'apartment',
  villa: 'villa', townhouse: 'villa',
  office: 'office', 'office space': 'office',
  warehouse: 'warehouse', 'industrial unit': 'warehouse', factory: 'warehouse', labourcamp: 'warehouse',
  shop: 'shop', retail: 'shop', 'retail unit': 'shop', 'commercial unit': 'shop', showroom: 'shop', restaurant: 'shop',
  'commercial building': 'commercial-building', 'office building': 'commercial-building', building: 'commercial-building',
  'residential building': 'residential-building', 'apartment building': 'residential-building',
};

function liveCategory(p) {
  const t = String(p.property_type || '').toLowerCase();
  if (CATEGORY_MAP[t]) return CATEGORY_MAP[t];
  return String(p.category || '').toLowerCase() === 'residential' ? 'apartment' : 'office';
}

export function normalizeLive(p) {
  const rent = p.listing_type === 'rent';
  return {
    ref: p.ref || `BGV-${p.id}`,
    slug: p.slug || `property-${p.id}`,
    title: p.title || 'Untitled property',
    purpose: rent ? 'rent' : 'sale',
    off_plan: p.listing_type === 'off_plan',
    category: liveCategory(p),
    type_label: p.property_type || 'Property',
    price: (rent ? (p.annual_rent || p.monthly_rent) : p.sale_price) || null,
    currency: p.currency || 'AED',
    rent_period: rent ? (p.annual_rent ? 'yr' : p.monthly_rent ? 'mo' : null) : null,
    location: p.community || p.subcommunity || p.city || 'Dubai',
    building: p.building || null,
    city: p.city || 'Dubai',
    bedrooms: p.bedrooms == null || p.bedrooms === '' ? null : String(p.bedrooms).toLowerCase() === 'studio' ? 'studio' : Number(p.bedrooms) || null,
    bathrooms: p.bathrooms != null && p.bathrooms !== '' ? Number(p.bathrooms) || null : null,
    size_sqft: p.area_sqft || null,
    units: null,
    furnishing: p.furnishing || null,
    parking: p.parking || null,
    description: p.description || '',
    amenities: [],
    images: p.cover_image_id ? [`${ADMIN_API}/api/public/properties/${p.id}/media/${p.cover_image_id}`] : [],
    featured: !!p.featured,
    availability: 'Available',
    date_added: '',
    agent: { name: 'BG Venture Properties', phone: '+971 4 580 9629', email: 'admin@bgventureproperties.ae' },
    sample: false,
    source: 'live',
    live_id: p.id,
  };
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

// ---------- search / filter / sort ----------
const NUM = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function search(list, q) {
  let out = list;
  if (q.purpose === 'sale' || q.purpose === 'rent') out = out.filter((p) => p.purpose === q.purpose);
  if (q.category) out = out.filter((p) => p.category === q.category);
  if (q.location) out = out.filter((p) => p.location === q.location);
  if (q.furnishing) out = out.filter((p) => p.furnishing === q.furnishing);
  if (q.availability) out = out.filter((p) => p.availability === q.availability);
  if (q.featured === '1') out = out.filter((p) => p.featured);
  const minP = NUM(q.min_price), maxP = NUM(q.max_price);
  const minS = NUM(q.min_size), maxS = NUM(q.max_size);
  const beds = NUM(q.beds), baths = NUM(q.baths);
  if (minP != null) out = out.filter((p) => p.price != null && p.price >= minP);
  if (maxP != null) out = out.filter((p) => p.price != null && p.price <= maxP);
  if (minS != null) out = out.filter((p) => p.size_sqft != null && p.size_sqft >= minS);
  if (maxS != null) out = out.filter((p) => p.size_sqft != null && p.size_sqft <= maxS);
  if (beds != null) out = out.filter((p) => {
    if (p.bedrooms == null) return false;
    if (beds === 0) return p.bedrooms === 'studio';
    return Number(p.bedrooms) >= beds;
  });
  if (baths != null) out = out.filter((p) => p.bathrooms != null && Number(p.bathrooms) >= baths);
  if (q.q) {
    const needle = String(q.q).toLowerCase();
    out = out.filter((p) => [p.title, p.location, p.building, p.ref, p.type_label].filter(Boolean).some((s) => String(s).toLowerCase().includes(needle)));
  }
  const by = {
    newest: (a, b) => String(b.date_added).localeCompare(String(a.date_added)),
    price_asc: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    price_desc: (a, b) => (b.price ?? -1) - (a.price ?? -1),
    size_desc: (a, b) => (b.size_sqft ?? 0) - (a.size_sqft ?? 0),
  }[q.sort || 'newest'] || ((a, b) => String(b.date_added).localeCompare(String(a.date_added)));
  // Live listings first within equal sort positions.
  return [...out].sort((a, b) => (a.sample === b.sample ? by(a, b) : a.sample ? 1 : -1));
}

export function facets(list) {
  const locations = new Set();
  const cats = {};
  for (const p of list) {
    if (p.location) locations.add(p.location);
    cats[p.category] = (cats[p.category] || 0) + 1;
  }
  return { locations: [...locations].sort(), categories: cats };
}
