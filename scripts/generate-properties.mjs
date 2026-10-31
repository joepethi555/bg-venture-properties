// Generates the demonstration property inventory (data/properties.json) and
// public/sitemap.xml. Records are deterministic (seeded) and flagged
// sample:true — they are demonstration listings, NOT live inventory, and the
// UI badges them accordingly. Replace this file's output with real feed data
// to go live without touching the frontend.
// Run: node scripts/generate-properties.mjs
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://bgventureproperties.ae';

// ---------- deterministic rng ----------
let seed = 0xB6170E;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const int = (min, max) => Math.floor(min + rnd() * (max - min + 1));
const chance = (p) => rnd() < p;
const round = (n, to) => Math.round(n / to) * to;

// ---------- pools ----------
const IMG_DIR = join(root, 'public', 'img');
const pools = {};
for (const cat of ['office', 'villa', 'apartment', 'warehouse', 'shop', 'commercial-building', 'residential-building']) {
  pools[cat] = existsSync(join(IMG_DIR, cat))
    ? (await readdir(join(IMG_DIR, cat))).filter((f) => f.endsWith('.jpg')).map((f) => `/img/${cat}/${f}`)
    : [];
}
const missing = Object.entries(pools).filter(([, v]) => !v.length);
if (missing.length) {
  console.error('Missing image pools:', missing.map(([k]) => k).join(', '));
  process.exit(1);
}

const RES_AREAS = [
  'Business Bay', 'Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Palm Jumeirah',
  'Dubai Hills Estate', 'Jumeirah Village Circle', 'Jumeirah Village Triangle',
  'Al Barsha', 'Deira', 'Bur Dubai', 'Sheikh Zayed Road', 'Dubai Silicon Oasis',
  'International City', 'Dubai South', 'Motor City', 'Jumeirah Lake Towers',
  'Al Furjan', 'Mirdif', 'Arjan', 'Liwan', 'Dubai Creek Harbour', 'Town Square',
];
const COM_AREAS = [
  'Business Bay', 'Downtown Dubai', 'Sheikh Zayed Road', 'Jumeirah Lake Towers',
  'Deira', 'Bur Dubai', 'Al Barsha', 'Dubai Silicon Oasis', 'DIFC',
  'Al Quoz', 'Dubai Investment Park', 'Motor City', 'International City',
  'Dubai South', 'Tecom', 'Dubai Healthcare City',
];
const WH_AREAS = [
  'Al Quoz', 'Ras Al Khor', 'Jebel Ali', 'Dubai Investment Park',
  'Dubai South', 'Dubai Industrial City', 'National Industries Park', 'Al Qusais',
];
const SHOP_AREAS = [
  'Deira', 'Bur Dubai', 'Al Barsha', 'Jumeirah', 'Dubai Marina', 'Business Bay',
  'International City', 'Motor City', 'Jumeirah Lake Towers', 'Downtown Dubai',
  'Dubai Silicon Oasis', 'Al Nahda', 'Karama', 'Al Furjan',
];

const ADJ = ['Elegant', 'Modern', 'Spacious', 'Bright', 'Contemporary', 'Premium', 'Stylish', 'Refined', 'Impressive', 'Executive'];
const APT_BLDG = ['Marina Gate', 'The Torch', 'Boulevard Point', 'Opera Grand', 'Index Tower', 'Liberty House', 'Bay Central', 'Elite Residence', 'The Address Residences', 'Central Park Tower', 'Park Heights', 'Executive Towers', 'Burj Views', 'Sobha Hartland Greens', 'Azizi Riviera', 'Mag 218', 'Sky Gardens', 'The Lofts'];
const VILLA_STYLE = ['contemporary', 'Mediterranean', 'modern Arabic', 'minimalist', 'classic', 'newly built'];
const OFF_BLDG = ['Regal Tower', 'Iris Bay', 'Ontario Tower', 'The Prism', 'Burlington Tower', 'Exchange Tower', 'Control Tower', 'Fortune Executive', 'Aspect Tower', 'Binary Tower', 'Single Business Tower', 'Park Lane Tower'];
const RES_BLDG = ['residential tower', 'mid-rise residential building', 'residential complex', 'apartment building'];
const COM_BLDG = ['commercial tower', 'Grade A office building', 'mixed-use commercial building', 'business tower'];

const AMEN = {
  apartment: ['Balcony', 'Built-in wardrobes', 'Central A/C', 'Shared gym', 'Shared pool', 'Covered parking', 'Concierge', '24/7 security', "Children's play area", 'View of water', 'Maids room', 'Pet friendly'],
  villa: ['Private pool', 'Private garden', 'Majlis', 'Maids room', 'Driver room', 'Covered parking', 'Built-in wardrobes', 'Central A/C', 'BBQ area', 'Gated community', "Children's play area", 'Smart home system'],
  office: ['Fitted', 'Partitioned', 'Meeting rooms', 'Pantry', 'Reception area', 'Covered parking', '24/7 access', 'High-speed elevators', 'Central A/C', 'Raised flooring', 'Grade A building', 'Sea/city view'],
  warehouse: ['High ceiling', 'Loading docks', 'Drive-in access', '3-phase power', 'Office mezzanine', 'Fire fighting system', 'Truck parking', 'Insulated', 'Racking ready', 'Yard space'],
  shop: ['Street frontage', 'High footfall', 'Fitted interior', 'Signage rights', 'Visitor parking', 'Storage room', 'Glass facade', 'Mall location', 'Chiller-free'],
  'commercial-building': ['Grade A', 'LEED certified', 'Retail podium', 'Ample parking', '24/7 security', 'High-speed elevators', 'Conference facilities', 'Showroom frontage', 'LEED Gold'],
  'residential-building': ['Amenity deck', 'Gymnasium', 'Swimming pool', 'Covered parking', '24/7 security', 'Play area', 'Community retail', 'Landscaped courtyard'],
};

const DESC = {
  sale: [
    'A well-presented {t} offered for sale in {l}, {d}. Positioned for both end users and investors seeking quality stock in an established Dubai location.',
    'Rare opportunity to acquire this {t} in {l}. {d} An excellent addition to a Dubai property portfolio.',
    'Offered to the market: a {t} in {l}, {d}. Strong rental demand in the area supports the investment case.',
  ],
  rent: [
    'Available for lease: a {t} in {l}, {d}. Ready for immediate occupancy — enquire to arrange a viewing.',
    'A {t} now leasing in {l}. {d} Flexible terms may be considered for the right tenant.',
    'Well-maintained {t} offered for rent in {l}, {d}. Early viewings are recommended.',
  ],
};
const DETAIL = {
  apartment: ['finished to a contemporary standard with an open-plan layout', 'featuring floor-to-ceiling windows and quality finishes', 'with a practical layout and community amenities on the doorstep'],
  villa: ['set on a generous plot with landscaped outdoor space', 'arranged over two floors with generous family accommodation', 'featuring high ceilings and a private entertaining garden'],
  office: ['fitted and ready for immediate occupation', 'offered in shell-and-core condition for bespoke fit-out', 'with efficient floorplates and excellent natural light'],
  warehouse: ['with clear-span storage and dedicated loading access', 'with insulated construction and three-phase power', 'suited to logistics, storage, or light industrial use'],
  shop: ['benefiting from strong passing footfall', 'with prominent frontage and signage opportunities', 'in a proven retail location with on-site parking'],
  'commercial-building': ['offered as a single-tower investment opportunity', 'with established tenancy and strong occupancy history', 'positioned on a high-visibility commercial corridor'],
  'residential-building': ['offered as a single residential investment asset', 'with a professional management structure in place', 'with steady occupancy across all unit types'],
};

const CATS = {
  apartment: 140, villa: 110, office: 110, warehouse: 80,
  shop: 80, 'commercial-building': 25, 'residential-building': 25,
};

// ---------- generators ----------
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function specs(cat) {
  switch (cat) {
    case 'apartment': {
      const beds = pick(['studio', 'studio', 1, 1, 1, 2, 2, 2, 3, 3, 4]);
      const baths = beds === 'studio' ? 1 : Math.min(beds + (chance(0.4) ? 1 : 0), 5);
      return { bedrooms: beds, bathrooms: baths, size: int(380, beds === 'studio' ? 700 : beds * 900 + 1200) };
    }
    case 'villa': {
      const beds = int(3, 7);
      return { bedrooms: beds, bathrooms: beds + int(0, 2), size: int(2800, 12000) };
    }
    case 'office': return { bedrooms: null, bathrooms: chance(0.6) ? int(1, 3) : null, size: int(250, 8000) };
    case 'warehouse': return { bedrooms: null, bathrooms: int(1, 2), size: int(3000, 60000) };
    case 'shop': return { bedrooms: null, bathrooms: chance(0.5) ? 1 : null, size: int(300, 4000) };
    case 'commercial-building': return { bedrooms: null, bathrooms: null, size: int(40000, 250000) };
    case 'residential-building': return { bedrooms: null, bathrooms: null, size: int(30000, 200000), units: int(24, 220) };
  }
}

function priceFor(cat, purpose, size) {
  if (purpose === 'sale') {
    const psf = { apartment: [950, 2100], villa: [800, 1900], office: [750, 1800], warehouse: [350, 750], shop: [900, 2600], 'commercial-building': [550, 1100], 'residential-building': [450, 900] }[cat];
    return { price: round(size * int(...psf), 10000), rent_period: null };
  }
  const ann = { apartment: [38000, 420000], villa: [160000, 950000], shop: [55000, 620000], 'residential-building': [1500000, 8500000], 'commercial-building': [2500000, 12000000] }[cat];
  if (ann) return { price: round(int(...ann), 5000), rent_period: 'yr' };
  if (cat === 'office') return { price: round(size * int(55, 170), 1000), rent_period: 'yr' };
  if (cat === 'warehouse') return { price: round(size * int(28, 65), 1000), rent_period: 'yr' };
  return { price: round(int(60000, 400000), 5000), rent_period: 'yr' };
}

function title(cat, purpose, s, loc) {
  const a = pick(ADJ);
  const bedTxt = s.bedrooms === 'studio' ? 'Studio' : s.bedrooms ? `${s.bedrooms}-bedroom` : null;
  switch (cat) {
    case 'apartment': return `${a} ${bedTxt} apartment, ${pick(APT_BLDG)}, ${loc}`;
    case 'villa': return `${a} ${bedTxt} ${pick(VILLA_STYLE)} villa, ${loc}`;
    case 'office': return `${a} ${purpose === 'rent' ? 'office space' : 'office unit'}, ${pick(OFF_BLDG)}, ${loc}`;
    case 'warehouse': return `${a} warehouse facility, ${loc}`;
    case 'shop': return `${a} retail unit, ${loc}`;
    case 'commercial-building': return `${a} ${pick(COM_BLDG)}, ${loc}`;
    case 'residential-building': return `${a} ${pick(RES_BLDG)}, ${loc}`;
  }
}

const areaFor = (cat) =>
  cat === 'warehouse' ? pick(WH_AREAS)
  : cat === 'shop' ? pick(SHOP_AREAS)
  : cat === 'apartment' || cat === 'villa' || cat === 'residential-building' ? pick(RES_AREAS)
  : pick(COM_AREAS);

const TYPE_LABEL = {
  apartment: 'Apartment', villa: 'Villa', office: 'Office', warehouse: 'Warehouse',
  shop: 'Shop / Retail', 'commercial-building': 'Commercial Building',
  'residential-building': 'Residential Building',
};

const properties = [];
let seq = 0;
for (const [cat, count] of Object.entries(CATS)) {
  for (let i = 0; i < count; i++) {
    seq++;
    const purpose = (cat === 'warehouse' ? chance(0.7) : cat.includes('building') ? chance(0.75) : chance(0.45)) ? 'sale' : 'rent';
    const s = specs(cat);
    const loc = areaFor(cat);
    const { price, rent_period } = priceFor(cat, purpose, s.size);
    const t = title(cat, purpose, s, loc);
    const ref = `BGVS-${String(seq).padStart(4, '0')}`;
    const pool = pools[cat];
    const n = int(6, Math.min(8, pool.length));
    const idx = new Set();
    while (idx.size < n) idx.add(Math.floor(rnd() * pool.length));
    const detail = pick(DETAIL[cat]);
    const units = s.units ? `${s.units} residential units across the building. ` : '';
    const p = {
      ref, slug: `${slugify(t)}-${ref.toLowerCase()}`,
      title: t,
      purpose, category: cat, type_label: TYPE_LABEL[cat],
      price, currency: 'AED', rent_period,
      location: loc, city: 'Dubai',
      bedrooms: s.bedrooms ?? null, bathrooms: s.bathrooms ?? null,
      size_sqft: s.size, units: s.units ?? null,
      furnishing: cat === 'apartment' || cat === 'villa' ? pick(['Furnished', 'Unfurnished', 'Unfurnished', 'Partly furnished']) : cat === 'office' ? pick(['Fitted', 'Fitted', 'Fitted & furnished', 'Shell & core']) : cat === 'shop' ? pick(['Fitted', 'Shell & core']) : null,
      parking: cat === 'warehouse' ? int(2, 12) : cat.includes('building') ? int(40, 400) : int(1, Math.min(4, (typeof s.bedrooms === 'number' ? s.bedrooms : 1) + 1)),
      description: `${pick(DESC[purpose]).replace('{t}', TYPE_LABEL[cat].toLowerCase()).replace('{l}', loc).replace('{d}', detail.charAt(0).toUpperCase() + detail.slice(1) + '.')} ${units}Contact BG Venture Properties to arrange a viewing or request further details.`,
      amenities: [...new Set(Array.from({ length: int(4, 7) }, () => pick(AMEN[cat])))],
      images: [...idx].map((j) => pool[j]),
      featured: chance(0.12),
      availability: pick(['Available', 'Available', 'Available', 'Available', 'Available', 'Available', 'Available', 'Under offer', 'Coming soon']),
      date_added: new Date(Date.now() - int(0, 360) * 86400000).toISOString().slice(0, 10),
      agent: { name: purpose === 'sale' ? 'BG Venture Properties — Sales Team' : 'BG Venture Properties — Leasing Team', phone: '+971 4 580 9629', email: 'admin@bgventureproperties.ae' },
      sample: true,
    };
    properties.push(p);
  }
}

await mkdir(join(root, 'data'), { recursive: true });
await writeFile(join(root, 'data', 'properties.json'), JSON.stringify(properties, null, 1));

const staticUrls = ['/', '/buy', '/rent', '/services/property-management', '/about', '/contact'];
const urls = [
  ...staticUrls.map((u) => `  <url><loc>${ORIGIN}${u}</loc><changefreq>weekly</changefreq></url>`),
  ...properties.map((p) => `  <url><loc>${ORIGIN}/property/${p.slug}</loc><lastmod>${p.date_added}</lastmod><changefreq>weekly</changefreq></url>`),
];
await writeFile(join(root, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

console.log(`Generated ${properties.length} sample properties -> data/properties.json`);
console.log(`Sitemap: ${staticUrls.length} static + ${properties.length} property URLs`);
