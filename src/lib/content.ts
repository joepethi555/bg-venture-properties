// Shared content constants: categories, navigation, contact details.

export const EMAIL = 'admin@bgventureproperties.ae';
export const LANDLINE = '+971 4 580 9629';
export const MOBILE = '+971 52 154 3487';
export const LANDLINE_TEL = '+97145809629';
export const MOBILE_TEL = '+971521543487';
export const WHATSAPP = '971521543487';
export const ADDRESS = 'Offices 3101 & 3104, Regal Tower, Business Bay, Dubai, UAE';
export const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Regal+Tower+Business+Bay+Dubai';
export const MAPS_EMBED = 'https://www.google.com/maps?q=Regal%20Tower%2C%20Business%20Bay%2C%20Dubai%2C%20UAE&z=16&output=embed';

export interface Category {
  key: string;
  label: string;
  plural: string;
  use: 'residential' | 'commercial';
  img: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { key: 'apartment', label: 'Apartment', plural: 'Apartments', use: 'residential', img: '/img/apartment/01.jpg', blurb: 'Studios to penthouses across Dubai\'s residential towers.' },
  { key: 'villa', label: 'Villa', plural: 'Villas', use: 'residential', img: '/img/villa/01.jpg', blurb: 'Family villas in Dubai\'s established communities.' },
  { key: 'office', label: 'Office', plural: 'Offices', use: 'commercial', img: '/img/office/01.jpg', blurb: 'Fitted and shell & core office space for every team size.' },
  { key: 'shop', label: 'Shop / Retail', plural: 'Shops', use: 'commercial', img: '/img/shop/01.jpg', blurb: 'Retail units and storefronts in high-footfall locations.' },
  { key: 'warehouse', label: 'Warehouse', plural: 'Warehouses', use: 'commercial', img: '/img/warehouse/01.jpg', blurb: 'Industrial, logistics, and storage facilities across Dubai.' },
  { key: 'commercial-building', label: 'Commercial Building', plural: 'Commercial Buildings', use: 'commercial', img: '/img/commercial-building/01.jpg', blurb: 'Whole-building commercial investment opportunities.' },
  { key: 'residential-building', label: 'Residential Building', plural: 'Residential Buildings', use: 'residential', img: '/img/residential-building/01.jpg', blurb: 'Entire residential buildings for investors and funds.' },
];

export const catLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.plural ?? key;
export const catSingular = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const INQUIRY_TYPES = [
  { value: 'buy', label: 'Buying a property' },
  { value: 'rent', label: 'Renting a property' },
  { value: 'sell', label: 'Selling a property' },
  { value: 'lease', label: 'Leasing a property' },
  { value: 'management', label: 'Property management' },
  { value: 'general', label: 'General business enquiry' },
];

export const FURNISHINGS = ['Furnished', 'Partly furnished', 'Unfurnished', 'Fitted', 'Fitted & furnished', 'Shell & core'];
