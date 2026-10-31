import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';
import { Link, navigate } from '../lib/router';
import { fetchMeta, fetchProperties, type Meta, type Property, type SearchResult } from '../lib/api';
import { CATEGORIES, catSingular } from '../lib/content';
import InquiryForm from '../components/InquiryForm';

const PAGE_SIZE = 12;

export default function Marketplace({ purpose, category, query }: { purpose: 'sale' | 'rent'; category: string; query: URLSearchParams }) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'done'>('loading');
  const page = Math.max(1, Number(query.get('page')) || 1);
  const sort = query.get('sort') || 'newest';

  const qKey = query.toString();
  useEffect(() => {
    let live = true;
    fetchMeta().then((m) => live && setMeta(m)).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    setState('loading');
    const q = new URLSearchParams(qKey);
    q.set('purpose', purpose);
    if (category) q.set('category', category);
    q.set('limit', String(PAGE_SIZE));
    q.set('page', String(page));
    fetchProperties(q)
      .then((r) => { if (!live) return; setResult(r); setState('done'); })
      .catch(() => live && setState('error'));
    return () => { live = false; };
  }, [purpose, category, qKey, page]);

  const setSort = (s: string) => {
    const q = new URLSearchParams(query);
    if (s === 'newest') q.delete('sort'); else q.set('sort', s);
    q.delete('page');
    const base = `/${purpose === 'sale' ? 'buy' : 'rent'}${category ? `/${category}` : ''}`;
    navigate(`${base}${q.size ? `?${q}` : ''}`);
  };

  const setPage = (p: number) => {
    const q = new URLSearchParams(query);
    if (p <= 1) q.delete('page'); else q.set('page', String(p));
    const base = `/${purpose === 'sale' ? 'buy' : 'rent'}${category ? `/${category}` : ''}`;
    navigate(`${base}${q.size ? `?${q}` : ''}`);
  };

  const cat = CATEGORIES.find((c) => c.key === category);
  const h1 = cat
    ? `${cat.plural} for ${purpose === 'sale' ? 'sale' : 'rent'} in Dubai`
    : `Properties for ${purpose === 'sale' ? 'sale' : 'rent'} in Dubai`;

  return (
    <main>
      <section className="page-hero">
        <img src={cat?.img || '/dubai.jpg'} alt="" />
        <div className="page-hero-shade" />
        <div className="container page-hero-content">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span>/</span>
            <Link to={purpose === 'sale' ? '/buy' : '/rent'}>{purpose === 'sale' ? 'Buy' : 'Rent'}</Link>
            {cat && <><span>/</span><span aria-current="page">{cat.plural}</span></>}
          </nav>
          <h1>{h1}</h1>
          <p>{cat ? cat.blurb : `Browse our ${purpose === 'sale' ? 'sale' : 'rental'} portfolio — apartments, villas, offices, retail, warehouses, and whole buildings across Dubai.`}</p>
        </div>
      </section>

      <div className="container market-body">
        <FilterBar purpose={purpose} category={category} query={query} locations={meta?.locations ?? []} />

        <div className="results-bar">
          <p className="results-count" role="status">
            {state === 'done' && result ? <><strong>{result.total.toLocaleString('en-US')}</strong> {result.total === 1 ? 'property' : 'properties'} found</> : 'Searching…'}
            {state === 'done' && result && result.properties.some((p) => !p.sample)
              ? <span className="results-live"> · including company listings</span> : null}
          </p>
          <label className="sort-field"><span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort results">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="size_desc">Area: largest first</option>
            </select>
          </label>
        </div>

        {state === 'error' && <p className="results-status">Listings could not be loaded right now. Please try again or send us your requirements below.</p>}
        {state === 'done' && result && result.properties.length === 0 && (
          <div className="results-empty">
            <p className="results-status">{result.total > 0
              ? 'This page is beyond the result range.'
              : 'No properties match these filters. Try widening your search — or tell us what you need and we\'ll shortlist options for you.'}</p>
            {result.total > 0 && <p className="results-status"><button type="button" className="button button-small" onClick={() => setPage(1)}>Back to page 1</button></p>}
          </div>
        )}
        {state === 'done' && result && (
          <div className="prop-grid">
            {result.properties.map((p: Property) => <PropertyCard key={p.ref} p={p} />)}
          </div>
        )}
        {state === 'loading' && (
          <div className="prop-grid">
            {Array.from({ length: 6 }).map((_, i) => <div className="prop-card skeleton" key={i}><div className="prop-card-media" /><div className="prop-card-body" /></div>)}
          </div>
        )}

        {state === 'done' && result && result.pages > 1 && (
          <nav className="pagination" aria-label="Results pages">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><Icon id="left" /></button>
            {Array.from({ length: result.pages }).map((_, i) => i + 1)
              .filter((n) => n === 1 || n === result.pages || Math.abs(n - page) <= 2)
              .reduce<(number | '…')[]>((acc, n, i, arr) => (i && n - (arr[i - 1] as number) > 1 ? [...acc, '…', n] : [...acc, n]), [])
              .map((n, i) => n === '…'
                ? <span key={`e${i}`} className="page-gap">…</span>
                : <button key={n} type="button" className={n === page ? 'current' : ''} aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>)}
            <button type="button" disabled={page >= result.pages} onClick={() => setPage(page + 1)} aria-label="Next page"><Icon id="arrow" /></button>
          </nav>
        )}

        <p className="sample-note"><Icon id="tag" /> Availability and details are confirmed by our team on inquiry. <Link to="/contact">Contact us</Link> for the latest options, including off-market listings.</p>

        <section className="market-cta">
          <div>
            <h2>Can't find the right {cat ? catSingular(category).toLowerCase() : 'property'}?</h2>
            <p>Tell us your requirements — our team will respond with real, available options including off-market listings.</p>
          </div>
          <InquiryForm defaultType={purpose === 'sale' ? 'buy' : 'rent'} heading="Send us your requirements" compact />
        </section>
      </div>
    </main>
  );
}
