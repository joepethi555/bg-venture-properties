import { useEffect, useRef, useState } from 'react';
import Icon, { type IconId } from '../components/Icon';
import PropertyCard from '../components/PropertyCard';
import InquiryForm from '../components/InquiryForm';
import { Link, navigate } from '../lib/router';
import { fetchMeta, fetchProperties, type Meta, type Property } from '../lib/api';
import { CATEGORIES, EMAIL, LANDLINE, LANDLINE_TEL, MOBILE, MOBILE_TEL, ADDRESS } from '../lib/content';
import { t, type Lang } from '../i18n';

function HeroSearch({ locations }: { locations: string[] }) {
  const [tab, setTab] = useState<'sale' | 'rent'>('sale');
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    for (const k of ['location', 'category', 'beds', 'max_price']) {
      const val = String(d.get(k) || '');
      if (val) q.set(k, val);
    }
    navigate(`/${tab === 'sale' ? 'buy' : 'rent'}${q.size ? `?${q}` : ''}`);
  };
  return (
    <form className="hero-search" onSubmit={submit} role="search" aria-label="Property search">
      <div className="hero-search-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'sale'} className={tab === 'sale' ? 'active' : ''} onClick={() => setTab('sale')}>Buy</button>
        <button type="button" role="tab" aria-selected={tab === 'rent'} className={tab === 'rent' ? 'active' : ''} onClick={() => setTab('rent')}>Rent</button>
      </div>
      <div className="hero-search-bar">
        <label><span>Location</span>
          <select name="location"><option value="">All Dubai</option>{locations.map((l) => <option key={l}>{l}</option>)}</select>
        </label>
        <label><span>Property type</span>
          <select name="category"><option value="">All types</option>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.plural}</option>)}</select>
        </label>
        <label><span>Bedrooms</span>
          <select name="beds"><option value="">Any</option><option value="0">Studio</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}</select>
        </label>
        <button className="button" type="submit"><Icon id="search" /> Search</button>
      </div>
    </form>
  );
}

function Rail({ items, label }: { items: Property[]; label: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => rail.current?.scrollBy({ left: d * Math.min(rail.current.clientWidth * 0.8, 780), behavior: 'smooth' });
  if (!items.length) return null;
  return (
    <div className="rail-wrap">
      <div className="rail" ref={rail} role="region" aria-roledescription="carousel" aria-label={label}>
        {items.map((p) => <div className="rail-item" key={p.ref}><PropertyCard p={p} /></div>)}
      </div>
      <button type="button" className="rail-btn prev" aria-label="Previous" onClick={() => scroll(-1)}><Icon id="left" /></button>
      <button type="button" className="rail-btn next" aria-label="Next" onClick={() => scroll(1)}><Icon id="arrow" /></button>
    </div>
  );
}

const DEVELOPERS = [
  { key: 'emaar', name: 'EMAAR', accent: '#1a1a2e', logo: true },
  { key: 'damac', name: 'DAMAC', accent: '#8b6914', logo: true },
  { key: 'nakheel', name: 'NAKHEEL', accent: '#0e6e6e', logo: false },
  { key: 'meraas', name: 'MERAAS', accent: '#c0392b', logo: false },
  { key: 'sobha', name: 'SOBHA', accent: '#2471a3', logo: true },
  { key: 'aldar', name: 'ALDAR', accent: '#7d3c98', logo: true },
  { key: 'omniyat', name: 'OMNIYAT', accent: '#1b4f72', logo: true },
  { key: 'binghatti', name: 'BINGHATTI', accent: '#b9770e', logo: true },
  { key: 'azizi', name: 'AZIZI', accent: '#117864', logo: false },
  { key: 'ellington', name: 'ELLINGTON', accent: '#5d6d7e', logo: false },
  { key: 'danube', name: 'DANUBE', accent: '#21618c', logo: true },
  { key: 'arada', name: 'ARADA', accent: '#935116', logo: true },
];

const HERO_BACK = ['/img/dubai/01.jpg', '/img/dubai/02.jpg', '/img/dubai/03.jpg', '/img/dubai/04.jpg'];

// Cycles an index every `interval` ms, starting after `delay` ms (staggers
// the layers). Disabled for reduced-motion users.
function useCycle(length: number, delay = 0, interval = 2000) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => { id = setInterval(() => setI((x) => (x + 1) % length), interval); }, delay);
    return () => { clearTimeout(t); if (id) clearInterval(id); };
  }, [length, delay, interval]);
  return i;
}

const WHY: { icon: IconId; h: string; p: string }[] = [
  { icon: 'shield', h: 'Licensed brokerage', p: 'Leasing, buying & selling brokerage, and real estate management supervision — our three licensed activities.' },
  { icon: 'pin', h: 'On the ground in Dubai', p: 'Based in Business Bay with hands-on knowledge of Dubai\'s communities, pricing, and process.' },
  { icon: 'globe', h: 'International client support', p: 'Buy, rent, or manage from anywhere — we guide overseas clients through each step remotely.' },
  { icon: 'key', h: 'End-to-end service', p: 'From search to signing, tenants to management — one partner for the whole property journey.' },
];

const MGMT = [
  'Residential property management', 'Commercial property management', 'Villa & apartment management',
  'Building management', 'Tenant management', 'Rental collection',
  'Maintenance coordination', 'Property inspections', 'Leasing & occupancy management',
];

export default function Home({ lang }: { lang: Lang }) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [featured, setFeatured] = useState<Property[]>([]);
  const [forSale, setForSale] = useState<Property[]>([]);
  const [forRent, setForRent] = useState<Property[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const backIdx = useCycle(HERO_BACK.length, 0, 3000);
  const tr = lang !== 'en';
  const L = (k: string) => t(k, lang);

  // 3D hero: layered scene tilts with the cursor — back layer deepest,
  // floating photo cards nearer, each displaced by its translateZ depth.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${nx * 6}deg`);
      el.style.setProperty('--rx', `${ny * -4}deg`);
      el.style.setProperty('--mx', `${nx * 34}px`);
      el.style.setProperty('--my', `${ny * 22}px`);
    };
    const onLeave = () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  useEffect(() => {
    let live = true;
    fetchMeta().then((m) => live && setMeta(m)).catch(() => {});
    fetchProperties(new URLSearchParams({ featured: '1', limit: '10' })).then((r) => live && setFeatured(r.properties)).catch(() => {});
    fetchProperties(new URLSearchParams({ purpose: 'sale', limit: '4' })).then((r) => live && setForSale(r.properties)).catch(() => {});
    fetchProperties(new URLSearchParams({ purpose: 'rent', limit: '4' })).then((r) => live && setForRent(r.properties)).catch(() => {});
    return () => { live = false; };
  }, []);

  const locations = meta?.locations ?? [];

  return (
    <main>
      <section className="hero" ref={heroRef}>
        <div className="hero-scene" aria-hidden="true">
          <div className="hero-layers">
            <div className="hero-layer hero-back">
              {HERO_BACK.map((src, i) => <img key={src} src={src} alt="" className={i === backIdx ? 'on' : ''} />)}
            </div>
          </div>
          <div className="hero-shade" />
        </div>
        <div className="container hero-content">
          <p className="eyebrow light hero-eyebrow">{tr ? L('hero.eyebrow') : 'DUBAI REAL ESTATE INVESTMENT EXPERTS'}</p>
          <h1>{tr ? <>{L('hero.line1')}<br />{L('hero.line2')}<br /><em>{L('hero.line3')}</em></> : <>The right property.<br />The right partner.<br /><em>A world of possibility.</em></>}</h1>
          <p className="hero-sub">{tr ? L('hero.desc') : 'A Dubai real estate brokerage built around you. Leasing, buying, selling, and management supervision—wherever you are in the world.'}</p>
          <div className="hero-checks">
            <span><Icon id="check" /> {tr ? L('hero.check1') : 'Local market expertise'}</span>
            <span><Icon id="check" /> {tr ? L('hero.check2') : 'International client support'}</span>
          </div>
          <HeroSearch locations={locations} />
        </div>
      </section>

      <section className="strip">
        <div className="container strip-grid">
          {[['buy', 'Buy', 'Homes and investments to own'], ['rent', 'Rent', 'Properties ready to lease'], ['sell', 'Sell', 'Position your property to buyers'], ['manage', 'Manage', 'Supervision for your asset']].map(([k, h, p]) => (
            <Link key={k} className="strip-card" to={k === 'buy' ? '/buy' : k === 'rent' ? '/rent' : k === 'manage' ? '/services/property-management' : '/contact'}>
              <span>{k === 'buy' ? <Icon id="home" /> : k === 'rent' ? <Icon id="key" /> : k === 'sell' ? <Icon id="tag" /> : <Icon id="shield" />}</span>
              <h3>{h}</h3><p>{p}</p><Icon id="up" />
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section container featured-sec">
          <div className="section-heading split">
            <div><p className="eyebrow">HAND-PICKED</p><h2>Featured <em>properties.</em></h2></div>
            <Link className="text-link" to="/buy">Browse all <Icon id="arrow" /></Link>
          </div>
          <Rail items={featured} label="Featured properties" />
        </section>
      )}

      <section className="section about-stats-sec">
        <div className="container">
          <div className="section-heading centered">
            <p className="eyebrow">{tr ? L('about.eyebrow') : 'THE COMPANY BEHIND YOUR NEXT MOVE'}</p>
            <h2>{tr ? <>{L('about.h1')}<br /><em>{L('about.h2')}</em></> : <>Property expertise.<br /><em>Personal commitment.</em></>}</h2>
            <p>{tr ? L('about.sub') : 'From finding your first investment to managing an established portfolio, we connect people, properties, and opportunities across Dubai.'}</p>
          </div>
          <div className="stats-grid">
            <div className="stat"><span>01 / OUR RELATIONSHIPS</span><strong>200<span>+</span></strong><h3>{tr ? L('stat1.h') : 'Landlords supported'}</h3><p>Relationships built around property ownership.</p></div>
            <div className="stat"><span>02 / OUR PROPERTY EXPERIENCE</span><strong>5,000</strong><h3>{tr ? L('stat2.h') : 'Properties supported'}</h3><p>Helping connect properties with people.</p></div>
            <div className="stat"><span>03 / OUR HOME MARKET</span><strong>Dubai<span>.</span></strong><h3>{tr ? L('stat3.h') : 'Local knowledge'}</h3><p>On-the-ground support in the UAE.</p></div>
            <div className="stat"><span>04 / OUR PERSPECTIVE</span><strong>Global<span>.</span></strong><h3>{tr ? L('stat4.h') : 'International clients'}</h3><p>Your location need not limit your search.</p></div>
          </div>
        </div>
      </section>

      <section className="dev-marquee-section" aria-label="UAE real estate developers we work with">
        <p className="dev-marquee-label">PARTNERED WITH THE UAE’S LEADING DEVELOPERS</p>
        <div className="dev-marquee">
          <div className="dev-track">
            {[0, 1].map((copy) => (
              <div className="dev-group" key={copy} aria-hidden={copy === 1}>
                {DEVELOPERS.map((d) => (
                  <span className="dev-card" key={`${copy}-${d.name}`}>
                    {d.logo
                      ? <img className="dev-logo" src={`/devlogos/${d.key}.png`} alt="" width="22" height="22" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      : <i className="dev-mark" style={{ background: d.accent }} />}
                    <span className="dev-name">{d.name}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-grey">
        <div className="container">
          <div className="section-heading split">
            <div><p className="eyebrow">FOR SALE</p><h2>Own a piece of <em>Dubai.</em></h2></div>
            <Link className="text-link" to="/buy">All properties for sale <Icon id="arrow" /></Link>
          </div>
          <div className="prop-grid">{forSale.map((p) => <PropertyCard key={p.ref} p={p} />)}</div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading split">
          <div><p className="eyebrow">FOR RENT</p><h2>Move in <em>sooner.</em></h2></div>
          <Link className="text-link" to="/rent">All properties for rent <Icon id="arrow" /></Link>
        </div>
        <div className="prop-grid">{forRent.map((p) => <PropertyCard key={p.ref} p={p} />)}</div>
      </section>

      <section className="section section-grey">
        <div className="container">
          <div className="section-heading centered">
            <p className="eyebrow">BROWSE BY CATEGORY</p>
            <h2>Every kind of <em>Dubai property.</em></h2>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link key={c.key} className="cat-card" to={`/buy/${c.key}`}>
                <img src={c.img} alt={c.plural} loading="lazy" />
                <div className="cat-card-body">
                  <span className="cat-use">{c.use === 'residential' ? 'Residential' : 'Commercial'}</span>
                  <h3>{c.plural}</h3>
                  <p>{meta?.categories[c.key] ? `${meta.categories[c.key].toLocaleString('en-US')} listings` : c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mgmt-band">
        <div className="container mgmt-layout">
          <div className="mgmt-copy">
            <p className="eyebrow light">PROPERTY MANAGEMENT</p>
            <h2>Your property, <em>professionally supervised.</em></h2>
            <p>Own property in Dubai but short on time — or based abroad? Our management supervision keeps your asset tenanted, maintained, and reported on, with the scope agreed up front.</p>
            <Link className="button" to="/services/property-management">Explore management services <Icon id="arrow" /></Link>
          </div>
          <ul className="mgmt-list">
            {MGMT.map((m) => <li key={m}><Icon id="check" />{m}</li>)}
          </ul>
        </div>
      </section>

      <section className="section intl">
        <div className="container intl-layout">
          <div className="intl-visual">
            <img src="/aerial.jpg" alt="Aerial view of Dubai's coastline" loading="lazy" />
            <div className="intl-chip intl-chip-top"><Icon id="globe" /><span><small>REMOTE-FIRST PROCESS</small>Video viewings &amp; guidance online</span></div>
            <div className="intl-chip intl-chip-bottom"><Icon id="pin" /><span><small>YOUR LOCAL TEAM</small>Business Bay, Dubai</span></div>
          </div>
          <div className="intl-copy">
            <p className="eyebrow">{tr ? L('intl.eyebrow') : 'FOR INTERNATIONAL CLIENTS'}</p>
            <h2>{tr ? <>{L('intl.h1')}<br /><em>{L('intl.h2')}</em></> : <>You don’t have to be here.<br /><em>Your property partner is.</em></>}</h2>
            <p>{tr ? L('intl.p') : 'Buying, leasing, or owning property in another country starts with the right people on the ground. We guide overseas clients through Dubai real estate — remotely, clearly, and across every time zone.'}</p>
            <ul className="intl-list">
              <li><span className="icon-box"><Icon id="home" /></span><div><h3>{tr ? L('intl.f1h') : 'Buy & sell from anywhere'}</h3><p>{tr ? L('intl.f1p') : 'Remote viewings, honest guidance at each step, and transaction support coordinated around your time zone.'}</p></div></li>
              <li><span className="icon-box"><Icon id="key" /></span><div><h3>{tr ? L('intl.f2h') : 'Lease before you land'}</h3><p>{tr ? L('intl.f2p') : 'Office or home secured before you arrive — shortlists, viewings, and lease coordination handled for you.'}</p></div></li>
              <li><span className="icon-box"><Icon id="shield" /></span><div><h3>{tr ? L('intl.f3h') : 'Own it. We’ll run it.'}</h3><p>{tr ? L('intl.f3p') : 'Management supervision built for owners abroad — tenants, maintenance approvals, and clear owner reporting.'}</p></div></li>
            </ul>
            <Link className="button" to="/contact">{tr ? L('intl.cta') : 'Talk to our Dubai team'} <Icon id="arrow" /></Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading split">
          <div><p className="eyebrow">WHERE WE WORK</p><h2>Popular Dubai <em>locations.</em></h2></div>
        </div>
        <div className="loc-grid">
          {locations.slice(0, 12).map((l) => (
            <Link key={l} className="loc-chip" to={`/buy?location=${encodeURIComponent(l)}`}><Icon id="pin" />{l}</Link>
          ))}
        </div>
      </section>

      <section className="section section-grey">
        <div className="container">
          <div className="section-heading centered">
            <p className="eyebrow">{tr ? L('about.eyebrow') : 'WHY BG VENTURE PROPERTIES'}</p>
            <h2>{tr ? <>{L('about.h1')}<br /><em>{L('about.h2')}</em></> : <>Property expertise.<br /><em>Personal commitment.</em></>}</h2>
          </div>
          <div className="why-grid">
            {WHY.map((w) => <article key={w.h}><span className="icon-box"><Icon id={w.icon} /></span><h3>{w.h}</h3><p>{w.p}</p></article>)}
          </div>
          <div className="stats-row">
            <div><strong>200+</strong><span>{tr ? L('stat1.h') : 'Landlords supported'}</span></div>
            <div><strong>5,000</strong><span>{tr ? L('stat2.h') : 'Properties supported'}</span></div>
            <div><strong>{meta ? meta.total.toLocaleString('en-US') : '570'}+</strong><span>Portal listings</span></div>
            <div><strong>3</strong><span>Licensed activities</span></div>
          </div>
        </div>
      </section>

      <section className="section about-band">
        <div className="container about-layout">
          <div className="about-copy">
            <p className="eyebrow">OUR COMPANY</p>
            <h2>{tr ? <>{L('mission.label')}<br /><em>{L('nav.company')}</em></> : <>A Dubai brokerage built<br /><em>around you.</em></>}</h2>
            <p>{tr ? L('mission.text') : 'To connect investors, landlords, and businesses with the right Dubai property opportunities — through clear advice, disciplined service, and support that continues beyond the transaction.'}</p>
            <Link className="button button-dark" to="/about">{tr ? L('scope.link') : 'About BG Venture Properties'} <Icon id="arrow" /></Link>
          </div>
          <div className="about-img"><img src="/office.jpg" alt="Dubai commercial towers" loading="lazy" /></div>
        </div>
      </section>

      <section className="section section-grey contact-sec" id="contact">
        <div className="container contact-layout">
          <div className="contact-copy">
            <p className="eyebrow">{tr ? L('contact.eyebrow') : 'LET’S MAKE YOUR NEXT MOVE COUNT'}</p>
            <h2>{tr ? <>{L('contact.h1')}<br />{L('contact.h2')}<br /><em>{L('contact.h3')}</em></> : <>Your goals.<br />Our expertise.<br /><em>Let’s talk.</em></>}</h2>
            <p>{tr ? <>{L('contact.sub')} {L('contact.sub2')}</> : 'Investing, buying, selling, renting, or managing? Tell us what you need.'}</p>
            <div className="contact-details">
              <a href={`mailto:${EMAIL}`}><span className="contact-icon"><Icon id="mail" /></span><span><small>EMAIL</small>{EMAIL}</span></a>
              <a href={`tel:${LANDLINE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>OFFICE</small>{LANDLINE}</span></a>
              <a href={`tel:${MOBILE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>MOBILE</small>{MOBILE}</span></a>
            </div>
            <p className="contact-addr"><Icon id="pin" /> {ADDRESS}</p>
          </div>
          <InquiryForm heading={tr ? L('form.title') : 'How can we help you?'} />
        </div>
      </section>
    </main>
  );
}
