// Client for the BG Venture Properties admin public API.
// Only published, available properties and approved images are ever returned.
export const ADMIN_API = 'https://bgv-admin.joepethj.workers.dev';

export interface PublicProperty {
  id: number;
  ref: string;
  slug: string;
  title: string;
  description?: string | null;
  listing_type: 'sale' | 'rent' | 'off_plan';
  category: string;
  property_type: string;
  community?: string | null;
  subcommunity?: string | null;
  city?: string | null;
  emirate?: string | null;
  building?: string | null;
  bedrooms?: string | null;
  bathrooms?: string | null;
  area_sqft?: number | null;
  area_sqm?: number | null;
  furnishing?: string | null;
  parking?: number | null;
  balcony?: number | null;
  view_type?: string | null;
  currency?: string | null;
  sale_price?: number | null;
  annual_rent?: number | null;
  monthly_rent?: number | null;
  featured?: number | null;
  cover_image_id?: number | null;
}

export interface PublicImage {
  id: number;
  caption?: string | null;
  alt_text?: string | null;
  image_category?: string | null;
  width?: number | null;
  height?: number | null;
  is_main?: number | null;
}

export interface NearbyPlace {
  name: string;
  category: string;
  distance_metres?: number | null;
  distance_method?: string | null;
}

export interface PropertyDetails {
  map_url?: string | null;
  amenities: string[];
  measurements: { kind: string; sqft: number; sqm: number }[];
  nearby_supermarkets?: string | null;
  nearby_facilities?: string | null;
  nearby_places: NearbyPlace[];
}

export const imageUrl = (propertyId: number, imageId: number) =>
  `${ADMIN_API}/api/public/properties/${propertyId}/media/${imageId}`;

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${ADMIN_API}/api${path}`);
  if (!r.ok) throw new Error(`Request failed (${r.status})`);
  return r.json() as Promise<T>;
}

// Map the site's display filter names onto the admin data values.
const TYPE_MAP: Record<string, string> = {
  Apartments: 'Apartment', Villas: 'Villa', Offices: 'Office',
  Warehouses: 'Warehouse', 'Shops & Retail': 'Shop', Buildings: 'Commercial Building',
  'Commercial Units': 'Commercial Unit',
};
const BED_MAP: Record<string, string> = {
  Studio: 'Studio', '1 Bedroom': '1', '2 Bedrooms': '2', '3 Bedrooms': '3',
  '4 Bedrooms': '4', '5 Bedrooms': '5',
};

export async function fetchProperties(q: URLSearchParams): Promise<PublicProperty[]> {
  const api = new URLSearchParams();
  const purpose = q.get('purpose');
  if (purpose === 'rent' || purpose === 'sale') api.set('purpose', purpose);
  if (q.get('category')) api.set('category', q.get('category')!);
  if (q.get('location')) api.set('community', q.get('location')!);
  if (q.get('city')) api.set('city', q.get('city')!);
  const t = q.get('type');
  if (t && TYPE_MAP[t]) api.set('type', TYPE_MAP[t]);
  const b = q.get('bedrooms');
  if (b && BED_MAP[b]) api.set('bedrooms', BED_MAP[b]);
  const d = await get<{ properties: PublicProperty[] }>(`/public/properties?${api}`);
  return d.properties;
}

export async function fetchProperty(id: string): Promise<{
  property: PublicProperty; images: PublicImage[]; details: PropertyDetails;
}> {
  return get(`/public/properties/${id}`);
}

// Anonymous analytics — matches the admin event vocabulary, no PII.
const sid = (() => {
  try {
    let s = sessionStorage.getItem('bgv_sid');
    if (!s) { s = crypto.randomUUID(); sessionStorage.setItem('bgv_sid', s); }
    return s;
  } catch { return null; }
})();

export function track(event: string, propertyId?: number) {
  if (!sid) return;
  fetch(`${ADMIN_API}/api/analytics/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event, property_id: propertyId ?? null, session_id: sid, page: location.hash || 'home', referrer: document.referrer || null }),
    keepalive: true,
  }).catch(() => { /* analytics must never break the page */ });
}

export function formatPrice(p: PublicProperty): string {
  const c = p.currency || 'AED';
  const n = (v: number) => v.toLocaleString('en-US');
  if (p.listing_type === 'rent') {
    if (p.annual_rent) return `${c} ${n(p.annual_rent)}/yr`;
    if (p.monthly_rent) return `${c} ${n(p.monthly_rent)}/mo`;
    return 'Price on request';
  }
  return p.sale_price ? `${c} ${n(p.sale_price)}` : 'Price on request';
}

export function formatArea(p: PublicProperty): string {
  if (!p.area_sqft) return '';
  const sqm = p.area_sqm ?? p.area_sqft / 10.7639104167;
  return `${p.area_sqft.toLocaleString('en-US', { maximumFractionDigits: 0 })} sqft · ${sqm.toLocaleString('en-US', { maximumFractionDigits: 1 })} sqm`;
}
