import { Fragment, useEffect, useState } from 'react';
import Icon from '../components/Icon';
import Gallery from '../components/Gallery';
import InquiryForm from '../components/InquiryForm';
import PropertyCard from '../components/PropertyCard';
import { Link } from '../lib/router';
import { bedLabel, fetchProperties, fetchProperty, formatArea, track, type Property } from '../lib/api';
import { catLabel, catSingular, LANDLINE_TEL, WHATSAPP } from '../lib/content';

export default function PropertyDetail({ id }: { id: string }) {
  const [state, setState] = useState<'loading' | 'error' | 'done'>('loading');
  const [p, setP] = useState<Property | null>(null);
  const [related, setRelated] = useState<Property[]>([]);

  useEffect(() => {
    let live = true;
    setState('loading');
    fetchProperty(id)
      .then((d) => {
        if (!live) return;
        setP(d.property);
        setState('done');
        track('property_detail_view', d.property.ref);
        const q = new URLSearchParams({ purpose: d.property.purpose, category: d.property.category, limit: '4' });
        fetchProperties(q).then((r) => live && setRelated(r.properties.filter((x) => x.ref !== d.property.ref).slice(0, 3))).catch(() => {});
      })
      .catch(() => live && setState('error'));
    return () => { live = false; };
  }, [id]);

  useEffect(() => {
    if (!p) return;
    document.title = `${p.title} | BG Venture Properties`;
    let ld = document.getElementById('ld-property') as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = 'ld-property';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'RealEstateListing',
      name: p.title, url: location.href, datePosted: p.date_added || undefined,
      address: { '@type': 'PostalAddress', addressLocality: p.location, addressRegion: 'Dubai', addressCountry: 'AE' },
      offers: p.price ? { '@type': 'Offer', price: p.price, priceCurrency: p.currency } : undefined,
      image: p.images.map((i) => i.startsWith('http') ? i : `https://bgventureproperties.ae${i}`),
    });
    return () => { document.title = 'BG Venture Properties | Dubai Real Estate'; ld?.remove(); };
  }, [p]);

  if (state === 'loading') return <main className="container page-pad"><p className="results-status">Loading property…</p></main>;
  if (state === 'error' || !p) return (
    <main className="container page-pad">
      <p className="results-status">This listing could not be found or is no longer available.</p>
      <Link className="button" to="/buy">Browse properties for sale</Link>
    </main>
  );

  const specs: [string, string][] = ([
    ['Reference', p.ref],
    ['Type', p.type_label],
    ['Purpose', p.off_plan ? 'Off-Plan' : p.purpose === 'rent' ? 'For Rent' : 'For Sale'],
    p.bedrooms != null ? ['Bedrooms', bedLabel(p.bedrooms)] : null,
    p.bathrooms != null ? ['Bathrooms', String(p.bathrooms)] : null,
    p.units ? ['Units', String(p.units)] : null,
    p.size_sqft ? ['Area', formatArea(p)] : null,
    p.furnishing ? ['Furnishing / condition', p.furnishing] : null,
    p.parking ? ['Parking', String(p.parking)] : null,
    ['Location', [p.building, p.location, p.city].filter(Boolean).join(', ')],
    ['Availability', p.availability],
    p.date_added ? ['Listed on', p.date_added] : null,
  ].filter(Boolean) as [string, string][]);

  const headline = [
    p.bedrooms != null && { icon: 'bed' as const, label: bedLabel(p.bedrooms) },
    p.bathrooms != null && { icon: 'bath' as const, label: `${p.bathrooms} Bathrooms` },
    p.size_sqft != null && { icon: 'size' as const, label: formatArea(p) },
  ].filter(Boolean) as { icon: 'bed' | 'bath' | 'size'; label: string }[];

  return (
    <main>
      <div className="container page-pad pd">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to={p.purpose === 'sale' ? '/buy' : '/rent'}>{p.purpose === 'sale' ? 'Buy' : 'Rent'}</Link><span>/</span>
          <Link to={`/${p.purpose === 'sale' ? 'buy' : 'rent'}/${p.category}`}>{catLabel(p.category)}</Link><span>/</span>
          <span aria-current="page">{p.ref}</span>
        </nav>

        <div className="pd-head">
          <div>
            <div className="pd-badges">
              <span className={`badge ${p.purpose === 'rent' ? 'badge-rent' : 'badge-sale'}`}>{p.off_plan ? 'Off-Plan' : p.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
              <span className="badge badge-neutral">{p.availability}</span>
              {p.featured && <span className="badge badge-featured"><Icon id="star" /> Featured</span>}
            </div>
            <h1>{p.title}</h1>
            <p className="pd-loc"><Icon id="pin" />{[p.building, p.location, p.city].filter(Boolean).join(', ')} · Ref {p.ref}</p>
          </div>

        </div>

        <div className="pd-layout">
          <div className="pd-main">
            <Gallery images={p.images} title={p.title} propertyRef={p.ref} />

            {headline.length > 0 && (
              <ul className="pd-specs-row">
                {headline.map((s) => <li key={s.icon}><Icon id={s.icon} /><div><small>{s.icon === 'bed' ? 'Bedrooms' : s.icon === 'bath' ? 'Bathrooms' : 'Area'}</small>{s.label}</div></li>)}
              </ul>
            )}

            <div className="prop-note">
              <span className="prop-note-icon"><Icon id="check" /></span>
              <div>
                <strong>Availability confirmed on inquiry</strong>
                <p>Details and current availability are verified by our team when you enquire — quote reference {p.ref} to arrange a viewing or request a full fact sheet.</p>
              </div>
            </div>

            <h2>Description</h2>
            <p className="pd-desc">{p.description}</p>

            {p.amenities.length > 0 && (<>
              <h2>Features &amp; amenities</h2>
              <ul className="pd-amenities">{p.amenities.map((a) => <li key={a}><Icon id="check" />{a}</li>)}</ul>
            </>)}

            <h2>Property information</h2>
            <dl className="pd-specs">{specs.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>

            {p.nearby && p.nearby.length > 0 && (<>
              <h2>Nearby</h2>
              <ul className="pd-nearby">{p.nearby.map((n) => <li key={n.name}><strong>{n.name}</strong><span>{n.category}{n.distance_metres != null ? ` · ${n.distance_metres < 1000 ? Math.round(n.distance_metres) + ' m' : (n.distance_metres / 1000).toFixed(1) + ' km'}` : ''}</span></li>)}</ul>
            </>)}
            {p.map_url && <p><a className="text-link" href={p.map_url} target="_blank" rel="noopener" onClick={() => track('map_open', p.ref)}><Icon id="pin" /> View location on Google Maps</a></p>}
          </div>

          <aside className="pd-side">
            <div className="inquiry-card">
              <div className="inquiry-card-head">
                <span className={`badge ${p.purpose === 'rent' ? 'badge-rent' : 'badge-sale'}`}>{p.off_plan ? 'Off-Plan' : p.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
                <span className="inquiry-card-ref">Ref {p.ref}</span>
              </div>
              <InquiryForm
                defaultType={p.purpose === 'rent' ? 'rent' : 'buy'}
                propertyRef={p.ref}
                propertyTitle={p.title}
                heading="Interested in this property?"
                compact
              />
              <div className="inquiry-agent">
                <span className="agent-icon"><Icon id="user" /></span>
                <div>
                  <strong>{p.agent.name}</strong>
                  <small>Reference {p.ref}</small>
                </div>
              </div>
              <div className="inquiry-quick">
                <a className="button button-dark button-small" href={`tel:${LANDLINE_TEL}`} onClick={() => track('inquiry_call_click', p.ref)}><Icon id="phone" /> Call</a>
                <a className="button button-small btn-whatsapp" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello, I'm interested in ${p.ref} — ${p.title}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => track('inquiry_whatsapp_click', p.ref)}><Icon id="whatsapp" /> WhatsApp</a>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="related">
            <h2>Similar {catSingular(p.category).toLowerCase()} listings</h2>
            <div className="prop-grid related-grid">
              {related.map((r) => <PropertyCard key={r.ref} p={r} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
