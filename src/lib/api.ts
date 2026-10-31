// Client for the site's own property API (Express). The server merges the
// sample demonstration inventory with live published company listings.

export interface Property {
  ref: string;
  slug: string;
  title: string;
  purpose: 'sale' | 'rent';
  off_plan?: boolean;
  category: string;
  type_label: string;
  price: number | null;
  currency: string;
  rent_period: 'yr' | 'mo' | null;
  location: string;
  building?: string | null;
  city: string;
  bedrooms: number | 'studio' | null;
  bathrooms: number | null;
  size_sqft: number | null;
  units?: number | null;
  furnishing: string | null;
  parking: number | null;
  description: string;
  amenities: string[];
  images: string[];
  nearby?: { name: string; category: string; distance_metres?: number | null }[];
  map_url?: string | null;
  featured: boolean;
  availability: string;
  date_added: string;
  agent: { name: string; phone: string; email: string };
  sample: boolean;
  source?: 'live' | 'sample';
}

export interface SearchResult {
  total: number;
  page: number;
  pages: number;
  properties: Property[];
}

export interface Meta {
  total: number;
  live: number;
  locations: string[];
  categories: Record<string, number>;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Request failed (${r.status})`);
  return r.json() as Promise<T>;
}

export const fetchMeta = () => get<Meta>('/api/meta');
export const fetchProperties = (q: URLSearchParams) => get<SearchResult>(`/api/properties?${q}`);
export const fetchProperty = (id: string) => get<{ property: Property }>(`/api/properties/${encodeURIComponent(id)}`);

export async function postInquiry(body: Record<string, unknown>): Promise<{ id: string }> {
  const r = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Submission failed (${r.status})`);
  return data;
}

export function formatPrice(p: Property): string {
  const c = p.currency || 'AED';
  const n = (v: number) => v.toLocaleString('en-US');
  if (p.price == null) return 'Price on request';
  if (p.purpose === 'rent') {
    if (p.rent_period === 'mo') return `${c} ${n(p.price)}/mo`;
    return `${c} ${n(p.price)}/yr`;
  }
  return `${c} ${n(p.price)}`;
}

export function formatArea(p: Property): string {
  if (!p.size_sqft) return '';
  const sqm = p.size_sqft / 10.7639;
  return `${p.size_sqft.toLocaleString('en-US')} sqft · ${sqm.toLocaleString('en-US', { maximumFractionDigits: 1 })} sqm`;
}

export const bedLabel = (b: Property['bedrooms']) =>
  b == null ? '' : b === 'studio' ? 'Studio' : `${b} Bed`;

// Anonymous analytics — forwarded to the admin events API, no PII.
const ADMIN_API = 'https://bgv-admin.joepethj.workers.dev';
const sid = (() => {
  try {
    let s = sessionStorage.getItem('bgv_sid');
    if (!s) { s = crypto.randomUUID(); sessionStorage.setItem('bgv_sid', s); }
    return s;
  } catch { return null; }
})();

export function track(event: string, propertyRef?: string) {
  if (!sid) return;
  fetch(`${ADMIN_API}/api/analytics/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event, property_id: null, property_ref: propertyRef ?? null, session_id: sid, page: location.pathname, referrer: document.referrer || null }),
    keepalive: true,
  }).catch(() => { /* analytics must never break the page */ });
}
