// URL-driven property filter bar — used on /buy and /rent marketplace pages.
// Writes filters to the query string so searches are shareable/bookmarkable.
import { useState } from 'react';
import Icon from './Icon';
import { CATEGORIES } from '../lib/content';
import { navigate } from '../lib/router';

const PRICE_OPTIONS = [250000, 500000, 1000000, 2000000, 5000000, 10000000, 25000000, 50000000, 100000000];
const RENT_OPTIONS = [30000, 50000, 75000, 100000, 150000, 250000, 500000, 1000000, 2500000];

interface Props {
  purpose: 'sale' | 'rent';
  category: string;
  query: URLSearchParams;
  locations: string[];
}

function field(label: string, children: React.ReactNode) {
  return <label className="filter-field"><span>{label}</span>{children}</label>;
}

export default function FilterBar({ purpose, category, query, locations }: Props) {
  const [more, setMore] = useState(false);
  const v = (k: string) => query.get(k) ?? '';
  const base = `/${purpose === 'sale' ? 'buy' : 'rent'}${category ? `/${category}` : ''}`;
  const prices = purpose === 'rent' ? RENT_OPTIONS : PRICE_OPTIONS;

  const apply = (updates: Record<string, string>) => {
    const q = new URLSearchParams(query);
    for (const [k, val] of Object.entries(updates)) {
      if (val) q.set(k, val); else q.delete(k);
    }
    q.delete('page');
    navigate(`${base}${q.size ? `?${q}` : ''}`);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const updates: Record<string, string> = {};
    for (const [k, val] of d.entries()) updates[k] = String(val);
    apply(updates);
  };

  return (
    <form className="filterbar" onSubmit={onSubmit} role="search" aria-label="Filter properties">
      <div className="filterbar-row">
        {field('Location', (
          <select name="location" defaultValue={v('location')} aria-label="Location">
            <option value="">All locations</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        ))}
        {!category && field('Property type', (
          <select name="category" defaultValue={v('category')} aria-label="Property type">
            <option value="">All types</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.plural}</option>)}
          </select>
        ))}
        {field('Min price', (
          <select name="min_price" defaultValue={v('min_price')} aria-label="Minimum price">
            <option value="">No min</option>
            {prices.map((p) => <option key={p} value={p}>AED {p.toLocaleString('en-US')}{purpose === 'rent' ? '/yr' : ''}</option>)}
          </select>
        ))}
        {field('Max price', (
          <select name="max_price" defaultValue={v('max_price')} aria-label="Maximum price">
            <option value="">No max</option>
            {prices.map((p) => <option key={p} value={p}>AED {p.toLocaleString('en-US')}{purpose === 'rent' ? '/yr' : ''}</option>)}
          </select>
        ))}
        {field('Bedrooms', (
          <select name="beds" defaultValue={v('beds')} aria-label="Bedrooms">
            <option value="">Any</option>
            <option value="0">Studio</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        ))}
        <div className="filterbar-actions">
          <button className="button button-small" type="submit"><Icon id="search" /> Search</button>
          <button className="filterbar-more" type="button" aria-expanded={more} onClick={() => setMore((m) => !m)}>
            <Icon id="filter" /> {more ? 'Fewer filters' : 'More filters'}
          </button>
          <button className="filterbar-clear" type="button" onClick={() => navigate(base)}>Clear</button>
        </div>
      </div>
      {more && (
        <div className="filterbar-row filterbar-extra">
          {field('Min area (sqft)', <input name="min_size" type="number" min="0" inputMode="numeric" defaultValue={v('min_size')} placeholder="e.g. 500" />)}
          {field('Max area (sqft)', <input name="max_size" type="number" min="0" inputMode="numeric" defaultValue={v('max_size')} placeholder="e.g. 5,000" />)}
          {field('Bathrooms', (
            <select name="baths" defaultValue={v('baths')}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          ))}
          {field('Furnishing', (
            <select name="furnishing" defaultValue={v('furnishing')}>
              <option value="">Any</option>
              <option>Furnished</option><option>Partly furnished</option><option>Unfurnished</option>
              <option>Fitted</option><option>Fitted & furnished</option><option>Shell & core</option>
            </select>
          ))}
          {field('Availability', (
            <select name="availability" defaultValue={v('availability')}>
              <option value="">Any</option>
              <option>Available</option><option>Under offer</option><option>Coming soon</option>
            </select>
          ))}
          {field('Keyword', <input name="q" defaultValue={v('q')} placeholder="Name, ref, building…" maxLength={80} />)}
        </div>
      )}
    </form>
  );
}
