import { Fragment, useEffect, useRef, useState } from 'react';
import Icon, { IconId } from './components/Icon';
import FloatingContactButtons from './components/FloatingContactButtons';
import { t, Lang } from './i18n';
import { fetchProperties, fetchProperty, imageUrl, formatPrice, formatArea, track, PublicProperty } from './properties';

const EMAIL = 'admin@bgventureproperties.ae';
const LANDLINE = '+971 4 580 9629';
const MOBILE = '+971 52 154 3487';
const LANDLINE_TEL = '+97145809629';
const MOBILE_TEL = '+971521543487';

const SERVICES = [
  'Investment advisory',
  'Buying or selling',
  'Office leasing',
  'Tenant sourcing or residential rental',
  'Property management',
  'Overseas property search',
] as const;

const SERVICE_PAGES: Record<string, {
  eyebrow: string; title: string; em: string; img: string; alt: string;
  intro: string; offers: { h: string; p: string }[]; note: string;
}> = {
  '#/service-leasing': {
    eyebrow: '01 / LEASING PROPERTY BROKERAGE',
    title: 'The right space.', em: 'The right tenant.',
    img: '/p6.jpg', alt: 'Modern residential property exterior in Dubai',
    intro: 'Whether you are a landlord looking for a quality tenant or a business searching for the right office, we bring both sides of the lease together — quickly and professionally.',
    offers: [
      { h: 'Tenant sourcing', p: 'We market your property and connect you with verified prospective tenants looking to rent.' },
      { h: 'Office & commercial leasing', p: 'Office space matched to your location, team size, budget, and move-in timeframe.' },
      { h: 'Residential leasing', p: 'Homes matched to lifestyle, commute, and budget — from studios to family residences.' },
      { h: 'Lease coordination', p: 'Guidance through viewings, negotiations, and the documentation needed to complete the lease.' },
    ],
    note: 'Over 200 landlords already trust BG Venture Properties to connect their properties with the right people.',
  },
  '#/service-selling': {
    eyebrow: '02 / BUYING & SELLING BROKERAGE',
    title: 'Buy with clarity.', em: 'Sell with confidence.',
    img: '/contract.jpg', alt: 'Hands signing a real estate contract with a gold pen',
    intro: 'From your first viewing to the final signature, our brokerage team helps you find the right property — or the right buyer — with a clear view of price, process, and opportunity.',
    offers: [
      { h: 'Buyer representation', p: 'A focused shortlist matched to your goals, budget, and investment horizon — in Dubai or from abroad.' },
      { h: 'Seller representation', p: 'Property positioning, presentation, and enquiry handling to reach serious buyers.' },
      { h: 'Investment advisory', p: 'Opportunities assessed on price, costs, rental assumptions, and the questions worth asking.' },
      { h: 'Transaction support', p: 'Coordination of viewings, negotiation, and the stages needed to complete your deal.' },
    ],
    note: 'With 5,000 properties supported, we know how to match the right property to the right client.',
  },
  '#/service-management': {
    eyebrow: '03 / REAL ESTATE MANAGEMENT SUPERVISION',
    title: 'Your property.', em: 'Professionally supervised.',
    img: '/p5.jpg', alt: 'Residential building facade under management',
    intro: 'Living abroad or simply short on time? Our management supervision keeps your Dubai property running — with an agreed scope, clear communication, and a team on the ground.',
    offers: [
      { h: 'Tenancy supervision', p: 'Tenant communication, renewals, and day-to-day coordination handled for you.' },
      { h: 'Maintenance coordination', p: 'Issues assessed, quotes gathered, and work approved by you before it proceeds.' },
      { h: 'Rent & income tracking', p: 'Clear visibility of payments, expenses, and the status of your property.' },
      { h: 'Owner reporting', p: 'Regular updates agreed with you — so distance never means being out of touch.' },
    ],
    note: 'Tell us how involved you want to be. We agree the scope, fees, and approvals before we begin.',
  },
};

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

const SLIDES = [
  { src: '/p1.jpg', label: 'Residential property' },
  { src: '/p2.jpg', label: 'Interior living' },
  { src: '/p3.jpg', label: 'Office spaces' },
  { src: '/p4.jpg', label: 'Commercial leasing' },
  { src: '/p5.jpg', label: 'Property management' },
  { src: '/p6.jpg', label: 'Family homes' },
  { src: '/p7.jpg', label: 'Client meetings' },
  { src: '/p8.jpg', label: 'Investment discussions' },
  { src: '/p9.jpg', label: 'Deal negotiation' },
  { src: '/p10.jpg', label: 'Apartment living' },
  { src: '/villa.jpg', label: 'Luxury villas' },
  { src: '/aerial.jpg', label: 'Dubai investment districts' },
  { src: '/finance.jpg', label: 'Investment planning' },
  { src: '/contract.jpg', label: 'Closing the deal' },
];

const NAV_ITEMS: Array<{ href?: string; key: string; label: string; dropdown?: Array<{ href: string; key: string; label: string }> }> = [
  { href: '#home', key: 'nav.home', label: 'Home' },
  { key: 'nav.company', label: 'Our company', dropdown: [
    { href: '#about', key: 'nav.about', label: 'About Us' },
    { href: '#/mission', key: 'mission.label', label: 'Our Mission' },
    { href: '#/vision', key: 'vision.label', label: 'Our Vision' },
    { href: '#/scope', key: 'nav.scope', label: 'Our Scope' },
  ] },
  { href: '#services', key: 'nav.expertise', label: 'Our expertise' },
  { href: '#international', key: 'nav.investors', label: 'International investors' },
  { href: '#contact', key: 'nav.contact', label: 'Contact' },
];

function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      '.section-heading, .stat, .service-card, .supporting-services, .services-footer, .quick-start > *, .space-card, .international-visual, .international-copy, .landlord-layout > div, .steps article, .risk-note, .faqs details, .contact-copy, .enquiry-form, .purpose-card, .purpose-values',
    );
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
    });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [status, setStatus] = useState('');
  const [route, setRoute] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useReveal();

  useEffect(() => {
    if (!dropOpen) return;
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.nav-dropdown')) setDropOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dropOpen]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      if (h.startsWith('#/')) {
        setRoute(h);
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      } else if (route) setRoute('');
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [route]);

  useEffect(() => {
    if (route) return;
    const hero = document.querySelector<HTMLElement>('.hero');
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      hero?.style.setProperty('--px', String(nx * 22));
      hero?.style.setProperty('--py', String(ny * 14));
    };
    hero?.addEventListener('mousemove', onMove);
    return () => hero?.removeEventListener('mousemove', onMove);
  }, [route]);

  useEffect(() => {
    if (route) return;
    const els = [...document.querySelectorAll<HTMLElement>('[data-tilt]')];
    const cleanups = els.map((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      };
      const leave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [route]);

  useEffect(() => {
    if (route) return;
    const slider = sliderRef.current;
    if (!slider) return;
    const id = window.setInterval(() => {
      const slide = slider.querySelector<HTMLElement>('.slide');
      const w = slide ? slide.offsetWidth + 18 : 320;
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) slider.scrollTo({ left: 0, behavior: 'smooth' });
      else slider.scrollBy({ left: w, behavior: 'smooth' });
    }, 3500);
    const pause = () => window.clearInterval(id);
    slider.addEventListener('pointerenter', pause);
    return () => { window.clearInterval(id); slider.removeEventListener('pointerenter', pause); };
  }, [route]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveSection(`#${visible[0].target.id}`);
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: 0 },
    );
    NAV_ITEMS.forEach(({ href }) => {
      if (!href) return;
      const el = document.querySelector(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const pickService = (service: string) => {
    const select = document.getElementById('service') as HTMLSelectElement | null;
    if (select) select.value = service;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? '').trim();
    const body = [
      'Hello BG Venture Properties,', '', v('message'), '',
      `Name: ${v('name')}`, `Email: ${v('email')}`,
      `Phone: ${v('phone') || 'Not provided'}`, `Service: ${v('service')}`,
      `Preferred contact time / time zone: ${v('timezone') || 'Not provided'}`,
    ].join('\r\n');
    setStatus(`Your email app will open with a draft. Your enquiry is not sent until you send that email. If no app opens, email ${EMAIL} directly.`);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Website enquiry: ${v('service')}`)}&body=${encodeURIComponent(body)}`;
  };

  const L = (key: string) => t(key, lang);
  const tr = lang !== 'en';
  const LANGS = [ { code: 'en', label: 'EN' }, { code: 'ar', label: 'عربي' }, { code: 'zh', label: '中文' } ] as const;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <FloatingContactButtons />

      <div className="topbar" role="region" aria-label="Office contact details">
        <div className="ticker-viewport">
          <div className="ticker-track is-ready">
            {[0, 1].map((copy) => (
              <div className="ticker-group" key={copy} aria-hidden={copy === 1}>
                <span><Icon id="pin" /> Regal Tower, Business Bay, Dubai, UAE</span>
                <a href={`mailto:${EMAIL}`} tabIndex={copy === 1 ? -1 : undefined}><Icon id="mail" /> {EMAIL}</a>
                <a href={`tel:${LANDLINE_TEL}`} tabIndex={copy === 1 ? -1 : undefined}><Icon id="phone" /> {LANDLINE}</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label="BG Venture Properties home">
            <img src="/logo-transparent.png" alt="BG Venture Properties" width="750" height="617" />
          </a>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen((o) => !o)}>
            <span>Menu</span><span className="menu-lines" aria-hidden="true" />
          </button>
          <nav id="navigation" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
            {NAV_ITEMS.map(({ href, key, label, dropdown }) => dropdown ? (
              <div key={key} className={`nav-dropdown${dropOpen ? ' open' : ''}`}>
                <button type="button" className="nav-link nav-dropdown-toggle" aria-haspopup="menu" aria-expanded={dropOpen} onClick={() => setDropOpen((o) => !o)}>
                  {tr ? L(key) : label} <span className="dropdown-caret" aria-hidden="true">▾</span>
                </button>
                <div className="dropdown-menu" role="menu">
                  {dropdown.map((d) => (
                    <a key={d.href} href={d.href} role="menuitem" onClick={() => setMenuOpen(false)}>{tr ? L(d.key) : d.label}</a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={href} className={`nav-link${activeSection === href ? ' active' : ''}`} href={href}
                aria-current={activeSection === href ? 'location' : undefined}
                onClick={() => setMenuOpen(false)}>
                {tr ? L(key) : label}
              </a>
            ))}
            <div className="lang-toggle" role="group" aria-label="Choose website language">
              {LANGS.map((l, i) => (
                <Fragment key={l.code}>
                  {i > 0 && <i />}
                  <button type="button" className={lang === l.code ? 'lang-active' : ''} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>{l.label}</button>
                </Fragment>
              ))}
            </div>
            <a className="button button-small" href="#contact" onClick={() => setMenuOpen(false)}>
              {tr ? L('nav.cta') : 'Speak to an expert'} <Icon id="up" />
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        {route.startsWith('#/property/') ? (
          <PropertyPage id={route.slice('#/property/'.length).split('?')[0]}
            onBack={() => { window.history.back(); }}
            onEnquire={() => { window.location.hash = 'contact'; }} />
        ) : route.startsWith('#/search') ? (
          <SearchPage onBack={() => { window.location.hash = '#home'; setRoute(''); }}
            onEnquire={() => { setRoute(''); window.location.hash = 'contact'; }} />
        ) : route === '#/mission' || route === '#/vision' || route === '#/scope' || route === '#/mission-vision' ? (
          <CompanyPage kind={route === '#/scope' ? 'scope' : route === '#/vision' ? 'vision' : 'mission'} tr={tr} L={L}
            onBack={() => { window.location.hash = '#home'; setRoute(''); }}
            onEnquire={() => { setRoute(''); window.location.hash = 'contact'; }} />
        ) : route && SERVICE_PAGES[route] ? (
          <ServicePage page={SERVICE_PAGES[route]}
            onBack={() => { window.location.hash = '#home'; setRoute(''); }}
            onEnquire={() => { setRoute(''); window.location.hash = 'contact'; }} />
        ) : (
        <>
        <section id="home" className="hero" aria-labelledby="hero-title">
          <img className="hero-image hero-image-one" src="/dubai.jpg" alt="Dubai skyline with Burj Khalifa and the city's highways" width="2200" height="1467" />
          <img className="hero-image hero-image-two" src="/skyline.jpg" alt="" aria-hidden="true" width="1000" height="1200" loading="lazy" />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="eyebrow hero-eyebrow"><span /> {tr ? L('hero.eyebrow') : 'DUBAI REAL ESTATE INVESTMENT EXPERTS'}</p>
            <h1 id="hero-title">
              {tr ? <>{L('hero.line1')}<br />{L('hero.line2')}<br /><em>{L('hero.line3')}</em></>
                : <>The right property.<br />The right partner.<br /><em>A world of possibility.</em></>}
            </h1>
            <p className="hero-description">
              {tr ? L('hero.desc') : 'A Dubai real estate brokerage built around you. Leasing, buying, selling, and management supervision—wherever you are in the world.'}
            </p>
            <div className="hero-actions hero-actions-future" />
            <div className="hero-assurance">
              <span><Icon id="check" /> {tr ? L('hero.check1') : 'Local market expertise'}</span>
              <span><Icon id="check" /> {tr ? L('hero.check2') : 'International client support'}</span>
            </div>
            <HeroSearch />
          </div>
          <div className="hero-side"><span>BASED IN DUBAI</span><i /><span>CONNECTED WORLDWIDE</span></div>
          <div className="hero-bottom container">
            <span>{tr ? L('hero.bottomLeft') : 'YOUR AMBITION. OUR LOCAL EXPERTISE.'}</span>
            <a href="#about">{tr ? L('hero.bottomRight') : 'Discover BG Venture'} <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="quick-start container" aria-label="Find the right service">
          <div className="quick-title"><span>{tr ? L('quick.label') : 'YOUR NEXT MOVE'}</span><h2>{tr ? L('quick.title') : 'How can we help?'}</h2></div>
          <a href="#contact" onClick={() => pickService('Investment advisory')}>
            <Icon id="invest" /><span dangerouslySetInnerHTML={{ __html: tr ? L('quick.invest') : 'I want to <strong>invest in property</strong>' }} /><Icon id="up" />
          </a>
          <a href="#spaces">
            <Icon id="office" /><span dangerouslySetInnerHTML={{ __html: tr ? L('quick.space') : 'I’m looking for <strong>an office or home</strong>' }} /><Icon id="up" />
          </a>
          <a href="#contact" onClick={() => pickService('Property management')}>
            <Icon id="key" /><span dangerouslySetInnerHTML={{ __html: tr ? L('quick.landlord') : 'I’m a landlord <strong>looking for support</strong>' }} /><Icon id="up" />
          </a>
        </section>

        <FeaturedListings />

        <section className="dev-marquee-section" aria-label="UAE real estate developers we work with">
          <p className="dev-marquee-label"><span>PARTNERED WITH THE UAE’S LEADING DEVELOPERS</span></p>
          <div className="dev-marquee">
            <div className="dev-track">
              {[0, 1].map((copy) => (
                <div className="dev-group" key={copy} aria-hidden={copy === 1}>
                  {DEVELOPERS.map((d) => (
                    <span className="dev-card" key={`${copy}-${d.name}`}>
                      {d.logo
                        ? <img className="dev-logo" src={`/devlogos/${d.key}.png`} alt="" width="28" height="28" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        : <i className="dev-mark" style={{ background: d.accent }} />}
                      <span className="dev-name">{d.name}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="container">
            <div className="section-heading centered">
              <p className="eyebrow">{tr ? L('about.eyebrow') : 'THE COMPANY BEHIND YOUR NEXT MOVE'}</p>
              <h2>{tr ? <>{L('about.h1')}<br /><em>{L('about.h2')}</em></> : <>Property expertise.<br /><em>Personal commitment.</em></>}</h2>
              <p>{tr ? L('about.sub') : <>From finding your first investment to managing an established portfolio,<br className="desktop-break" /> we connect people, properties, and opportunities across Dubai.</>}</p>
            </div>
            <div className="stats-grid">
              <div className="stat"><span>01 / OUR RELATIONSHIPS</span><strong>200<span>+</span></strong><h3>{tr ? L('stat1.h') : 'Landlords supported'}</h3><p>Relationships built around property ownership.</p></div>
              <div className="stat"><span>02 / OUR PROPERTY EXPERIENCE</span><strong>5,000</strong><h3>{tr ? L('stat2.h') : 'Properties supported'}</h3><p>Helping connect properties with people.</p></div>
              <div className="stat"><span>03 / OUR HOME MARKET</span><strong>Dubai<span>.</span></strong><h3>{tr ? L('stat3.h') : 'Local knowledge'}</h3><p>On-the-ground support in the UAE.</p></div>
              <div className="stat"><span>04 / OUR PERSPECTIVE</span><strong>Global<span>.</span></strong><h3>{tr ? L('stat4.h') : 'International clients'}</h3><p>Your location need not limit your search.</p></div>
            </div>
            {/* Mission, vision, and scope now live on dedicated pages — see the Our Company nav dropdown. */}
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <div className="section-heading split">
              <div>
                <p className="eyebrow">{tr ? L('services.eyebrow') : 'WHAT WE DO'}</p>
                <h2>{tr ? <>{L('services.h1')}<br /><em>{L('services.h2')}</em></> : <>Three core services.<br /><em>One trusted partner.</em></>}</h2>
              </div>
              <p>{tr ? L('services.sub') : <>Licensed real estate brokerage activities—<br />covering leasing, sales, and management supervision.</>}</p>
            </div>
            <div className="service-grid">
              <ServiceCard n="01" icon="key" title={tr ? L('svc1.h') : 'Leasing property brokerage'} link="Find your next space" page="#/service-leasing" onPick={() => pickService('Office leasing')}>
                {tr ? L('svc1.p') : 'We connect landlords with prospective tenants and help tenants find the right home, office, or commercial space—matching every requirement.'}
              </ServiceCard>
              <ServiceCard n="02" icon="home" title={tr ? L('svc2.h') : 'Buying & selling brokerage'} link="Make your next move" page="#/service-selling" onPick={() => pickService('Buying or selling')}>
                {tr ? L('svc2.p') : 'Find the right property or connect yours with potential buyers. Support with your search, property positioning, enquiries, and next steps—including investment opportunities.'}
              </ServiceCard>
              <ServiceCard n="03" icon="shield" title={tr ? L('svc3.h') : 'Management supervision'} link="Support for your property" page="#/service-management" onPick={() => pickService('Property management')}>
                {tr ? L('svc3.p') : 'Support for the ongoing needs of your Dubai property. Agree the supervision scope, responsibilities, communication, and fees from the outset.'}
              </ServiceCard>
            </div>
            <div className="supporting-services">
              <span className="supporting-label">ALSO FOR YOU</span>
              <a href="#contact" onClick={() => pickService('Investment advisory')}><Icon id="invest" /> Investment opportunities</a>
              <a href="#contact" onClick={() => pickService('Tenant sourcing or residential rental')}><Icon id="key" /> Tenant sourcing &amp; rentals</a>
              <a href="#contact" onClick={() => pickService('Overseas property search')}><Icon id="globe" /> Overseas property search</a>
            </div>
            <div className="services-footer">
              <div><h3>{tr ? L('services.footerH') : 'Not sure where to start?'}</h3><p>{tr ? L('services.footerP') : 'Tell us your goals. We’ll help you identify the right next step.'}</p></div>
              <a className="button button-dark" href="#contact">{tr ? L('services.footerCta') : 'Talk to our team'} <Icon id="arrow" /></a>
            </div>
          </div>
        </section>

        <section id="spaces" className="section spaces">
          <div className="container">
            <div className="section-heading split">
              <div><p className="eyebrow">{tr ? L('spaces.eyebrow') : 'THE RIGHT SPACE MAKES A DIFFERENCE'}</p><h2>{tr ? <>{L('spaces.h1')}<br /><em>{L('spaces.h2')}</em></> : <>For your business.<br /><em>For your next chapter.</em></>}</h2></div>
              <p>{tr ? L('spaces.sub') : 'A new workspace. A place to call home. A property with investment potential.'}</p>
            </div>
            <div className="slider-wrap">
              <div className="slider" ref={sliderRef}>
                {SLIDES.map((s, i) => (
                  <figure className="slide" key={s.src}>
                    <img src={s.src} alt={s.label} width="900" height="600" loading="lazy" />
                    <figcaption><span>{String(i + 1).padStart(2, '0')}</span> {tr ? L(`cap${i + 1}`) : s.label}</figcaption>
                  </figure>
                ))}
              </div>
              <button className="slider-btn prev" type="button" aria-label="Previous photo" onClick={() => sliderRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}>←</button>
              <button className="slider-btn next" type="button" aria-label="Next photo" onClick={() => sliderRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}>→</button>
            </div>
            <p className="image-disclaimer">{tr ? L('spaces.disc') : 'Illustrative photography. Contact our team for current property availability and details.'}</p>
          </div>
        </section>

        <section id="international" className="international section">
          <div className="container international-layout">
            <div className="international-visual">
              <img src="/skyline.jpg" alt="Aerial view of Burj Al Arab and Dubai's coastline" width="1000" height="1200" loading="lazy" />
              <div className="location-label"><Icon id="pin" /><span>{tr ? L('intl.card1') : 'YOUR LOCAL CONNECTION'}<strong>{tr ? L('intl.card2') : 'Dubai, United Arab Emirates'}</strong></span><span className="location-dot" /></div>
              <div className="international-caption"><Icon id="globe" /><span>{tr ? <>{L('intl.cap1')}<br /><strong>{L('intl.cap2')}</strong></> : <>Wherever you are.<br /><strong>We’re here in Dubai.</strong></>}</span></div>
            </div>
            <div className="international-copy">
              <p className="eyebrow">{tr ? L('intl.eyebrow') : 'LOCAL EXPERTISE. INTERNATIONAL REACH.'}</p>
              <h2>{tr ? <>{L('intl.h1')}<br /><em>{L('intl.h2')}</em></> : <>You don’t have to be here.<br /><em>Your property partner is.</em></>}</h2>
              <p>{tr ? L('intl.p') : 'Investing or finding property in another country starts with having the right people on the ground. We help international clients explore Dubai with a clearer understanding of their options.'}</p>
              <ul className="feature-list">
                <Feature h={tr ? L('intl.f1h') : 'A search built around your requirements'}>{tr ? L('intl.f1p') : 'Your objectives, preferred areas, budget, and timing guide the shortlist.'}</Feature>
                <Feature h={tr ? L('intl.f2h') : 'Guidance through the practical details'}>{tr ? L('intl.f2p') : 'Understand the transaction stages and which steps may require documentation or specialist advice.'}</Feature>
                <Feature h={tr ? L('intl.f3h') : 'Support beyond finding the property'}>{tr ? L('intl.f3p') : 'Discuss tenants, leasing, and ongoing management before you take the next step.'}</Feature>
              </ul>
              <a className="button" href="#contact" onClick={() => pickService('Overseas property search')}>{tr ? L('intl.cta') : 'Connect with your Dubai team'} <Icon id="arrow" /></a>
            </div>
          </div>
        </section>

        <section id="landlords" className="section landlords">
          <div className="container landlord-layout">
            <div>
              <p className="eyebrow">{tr ? L('land.eyebrow') : 'FOR LANDLORDS & PROPERTY OWNERS'}</p>
              <h2>{tr ? <>{L('land.h1')}<br /><em>{L('land.h2')}</em></> : <>Your property deserves<br /><em>the right attention.</em></>}</h2>
              <p>{tr ? L('land.p') : 'Finding tenants. Reaching buyers. Managing the everyday. We help you move from property ownership to a practical plan.'}</p>
              <a className="button button-outline" href="#contact" onClick={() => pickService('Property management')}>{tr ? L('land.cta') : 'Let’s talk about your property'} <Icon id="arrow" /></a>
            </div>
            <div className="landlord-services">
              <LandlordRow n="01" h={tr ? L('land.r1h') : 'Find the right tenants'} p={tr ? L('land.r1p') : 'Connect your property with people looking to rent.'} onPick={() => pickService('Tenant sourcing or residential rental')} />
              <LandlordRow n="02" h={tr ? L('land.r2h') : 'Reach prospective buyers'} p={tr ? L('land.r2p') : 'Get support presenting your property to potential clients.'} onPick={() => pickService('Buying or selling')} />
              <LandlordRow n="03" h={tr ? L('land.r3h') : 'Manage with a clearer plan'} p={tr ? L('land.r3p') : 'Agree the services and communication your property needs.'} onPick={() => pickService('Property management')} />
            </div>
          </div>
        </section>

        <section id="process" className="section process">
          <div className="container">
            <div className="section-heading centered"><p className="eyebrow">{tr ? L('proc.eyebrow') : 'A CLEAR PATH FORWARD'}</p><h2>{tr ? <>{L('proc.h1')}<br /><em>{L('proc.h2')}</em></> : <>From your first question<br /><em>to your next move.</em></>}</h2></div>
            <div className="steps">
              <Step n="01" h={tr ? L('proc.s1h') : 'Tell us what matters'} p={tr ? L('proc.s1p') : 'We start with your objectives, budget, property requirements, and timeframe.'} />
              <Step n="02" h={tr ? L('proc.s2h') : 'Explore the right options'} p={tr ? L('proc.s2p') : 'Review suitable properties or an appropriate service plan, with the details explained.'} />
              <Step n="03" h={tr ? L('proc.s3h') : 'Make an informed decision'} p={tr ? L('proc.s3p') : 'Understand the costs, responsibilities, documentation, and next steps.'} />
              <Step n="04" h={tr ? L('proc.s4h') : 'Plan for what comes next'} p={tr ? L('proc.s4p') : 'Discuss leasing, tenants, or property management as your needs evolve.'} />
            </div>
            <p className="risk-note"><Icon id="invest" /><span>{tr ? L('proc.note') : 'Informed investment matters. Property values and rental income can rise or fall. Returns are not guaranteed. Evaluate costs, risks, and your own circumstances before committing.'}</span></p>
          </div>
        </section>

        <section className="section faq-section">
          <div className="container faq-layout">
            <div><p className="eyebrow">{tr ? L('faq.eyebrow') : 'YOUR QUESTIONS, ANSWERED'}</p><h2>{tr ? <>{L('faq.h1')}<br /><em>{L('faq.h2')}</em></> : <>Clarity before<br /><em>commitment.</em></>}</h2><p>{tr ? L('faq.p') : 'Good decisions start with good questions.'}</p><a className="text-link" href="#contact">{tr ? L('faq.link') : 'Ask our team'} <Icon id="arrow" /></a></div>
            <div className="faqs">
              <Faq q={tr ? L('faq.q1') : 'Can you find me a property if I am outside the UAE?'}>{tr ? L('faq.a1') : 'Yes. We help overseas clients search for Dubai property based on their requirements. We can discuss your objectives remotely and explain which transaction steps may need documentation, attendance, verification, or professional support.'}</Faq>
              <Faq q={tr ? L('faq.q2') : 'Can you help me find an office for my business?'}>{tr ? L('faq.a2') : 'Yes. Share your preferred location, team size, budget, intended use, and move-in timeframe. We will help you explore commercial space and identify requirements that need confirmation before a lease is agreed.'}</Faq>
              <Faq q={tr ? L('faq.q3') : 'I own a property. Can you help me find tenants or buyers?'}>{tr ? L('faq.a3') : 'Yes. We help landlords connect with prospective tenants and support owners looking to sell. Contact us with your property details to discuss availability, positioning, and the appropriate service scope.'}</Faq>
              <Faq q={tr ? L('faq.q4') : 'What does your property management service include?'}>{tr ? L('faq.a4') : 'The scope is agreed around your property and requirements. Speak with us about tenant communication, leasing support, maintenance coordination, reporting, fees, and approvals. Only services specified in your agreement are included.'}</Faq>
              <Faq q={tr ? L('faq.q5') : 'Do you guarantee returns on investment properties?'}>{tr ? L('faq.a5') : 'No. Property prices, rent, and occupancy change with market conditions. Any estimates must be considered alongside their assumptions, costs, and risks. Past performance does not guarantee future results.'}</Faq>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">{tr ? L('contact.eyebrow') : 'LET’S MAKE YOUR NEXT MOVE COUNT'}</p>
              <h2>{tr ? <>{L('contact.h1')}<br />{L('contact.h2')}<br /><em>{L('contact.h3')}</em></> : <>Your goals.<br />Our expertise.<br /><em>Let’s talk.</em></>}</h2>
              <p>{tr ? <>{L('contact.sub')}<br />{L('contact.sub2')}</> : <>Investing, buying, selling, renting, or managing?<br />Tell us what you need. We’ll help you take the next step.</>}</p>
              <div className="contact-details">
                <a href={`mailto:${EMAIL}`}><span className="contact-icon"><Icon id="mail" /></span><span><small>EMAIL OUR TEAM</small>{EMAIL}</span></a>
                <a href={`tel:${LANDLINE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>CALL OUR DUBAI OFFICE</small>{LANDLINE}</span></a>
                <a href={`tel:${MOBILE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>MOBILE</small>{MOBILE}</span></a>
              </div>
              <div className="office-address"><Icon id="pin" /><p><strong>Offices 3101 &amp; 3104, Regal Tower</strong><br />Business Bay, Dubai, United Arab Emirates</p></div>
            </div>
            <form id="enquiry-form" ref={formRef} className="enquiry-form" onSubmit={onSubmit}>
              <span className="form-eyebrow">A CONVERSATION IS A GOOD START</span>
              <h3>{tr ? L('form.title') : 'How can we help you?'}</h3>
              <p className="form-intro">{tr ? L('form.intro') : 'Share a few details to prepare an email to our team.'}</p>
              <div className="form-row">
                <div><label htmlFor="name">Full name <span>*</span></label><input id="name" name="name" autoComplete="name" placeholder="Your full name" required maxLength={120} /></div>
                <div><label htmlFor="email">Email address <span>*</span></label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></div>
              </div>
              <div className="form-row">
                <div><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+ Country code" maxLength={40} /></div>
                <div><label htmlFor="service">I’m interested in <span>*</span></label>
                  <select id="service" name="service" required>
                    <option value="">Select a service</option>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <label htmlFor="timezone">Preferred contact time / time zone</label>
              <input id="timezone" name="timezone" placeholder="e.g. Afternoons, London time" maxLength={120} />
              <label htmlFor="message">What do you have in mind? <span>*</span></label>
              <textarea id="message" name="message" rows={3} placeholder="Tell us about your goals, property, or requirements…" required maxLength={2000} />
              <button className="button" type="submit">{tr ? L('form.submit') : 'Prepare my enquiry'} <Icon id="arrow" /></button>
              <p className="form-disclosure">This form opens your email app. Nothing is submitted or stored by this website. Please do not include identity documents or financial account details.</p>
              <p id="form-status" role="status" aria-live="polite">{status}</p>
              <noscript><p>Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> directly to make an enquiry.</p></noscript>
            </form>
          </div>
        </section>
        </>
        )}
      </main>

      <footer>
        <div className="footer-accent" />
        <div className="container footer-main">
          <div className="footer-brand-block">
            <a className="footer-logo-link" href="#home" aria-label="BG Venture Properties home"><img className="footer-logo" src="/logo-transparent.png" alt="BG Venture Properties" width="750" height="617" /></a>
            <p>Dubai real estate expertise.<br />Personal support. Global perspective.</p>
            <span className="footer-location"><Icon id="globe" /> Dubai, United Arab Emirates</span>
          </div>
          <div><h3>Explore</h3><a href="#about">Our company</a><a href="#services">Our expertise</a><a href="#international">International investors</a><a href="#process">How we work</a></div>
          <div><h3>Our expertise</h3><a href="#contact" onClick={() => pickService('Office leasing')}>Leasing brokerage</a><a href="#contact" onClick={() => pickService('Buying or selling')}>Buying &amp; selling brokerage</a><a href="#contact" onClick={() => pickService('Property management')}>Management supervision</a><a href="#contact" onClick={() => pickService('Overseas property search')}>Overseas property search</a></div>
          <div><h3>Let’s connect</h3><a href={`tel:${LANDLINE_TEL}`}>{LANDLINE}</a><a href={`tel:${MOBILE_TEL}`}>{MOBILE}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
        </div>
        <div className="container footer-map">
          <div className="footer-map-label"><Icon id="pin" /><span>Offices 3101 &amp; 3104, Regal Tower · Business Bay, Dubai, UAE</span><a href="https://www.google.com/maps/search/?api=1&query=Regal+Tower+Business+Bay+Dubai" target="_blank" rel="noopener noreferrer">Open in Google Maps <Icon id="up" /></a></div>
          <iframe title="BG Venture Properties office location — Regal Tower, Business Bay, Dubai" src="https://www.google.com/maps?q=Regal%20Tower%2C%20Business%20Bay%2C%20Dubai%2C%20UAE&z=16&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} BG Venture Properties. All rights reserved.</span>
          <a href="#home">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </>
  );
}

function ServiceCard({ n, icon, title, link, page, onPick, children }: { n: string; icon: IconId; title: string; link: string; page: string; onPick: () => void; children: React.ReactNode }) {
  return (
    <article className="service-card" data-tilt>
      <div className="service-top"><span className="icon-box"><Icon id={icon} /></span><span>{n}</span></div>
      <h3>{title}</h3>
      <p>{children}</p>
      <div className="card-actions">
        <a className="button button-small card-cta" href={page}>Explore this service <Icon id="arrow" /></a>
        <a className="text-link" href="#contact" onClick={onPick}>{link} <Icon id="arrow" /></a>
      </div>
    </article>
  );
}

const PROPERTY_TYPES = ['Offices', 'Villas', 'Apartments', 'Warehouses', 'Shops & Retail', 'Buildings', 'Commercial Units'];

const LOCATIONS = ['Business Bay', 'Jumeirah Lake Towers (JLT)', 'Jumeirah Village Circle (JVC)', 'Al Furjan', 'Liwan'];


function HeroSearch() {
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (location) q.set('location', location);
    if (type) q.set('type', type);
    window.location.hash = `#/search${q.size ? `?${q}` : ''}`;
  };

  const sel = (id: string, label: string, value: string, options: string[], set: (v: string) => void, disabled = false) => (
    <label className={`search-field${disabled ? ' is-disabled' : ''}`}>
      <span>{label}</span>
      <select aria-label={label} value={value} disabled={disabled} onChange={(e) => set(e.target.value)}>
        <option value="">{id === 'location' ? 'Any location' : id === 'city' ? 'Any city' : `Any ${label.toLowerCase()}`}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <form className="hero-search simple-search" onSubmit={submit} role="search" aria-label="Property search">
      <div className="search-bar">
        {sel('location', 'Location', location, LOCATIONS, setLocation)}
        {sel('type', 'Property Type', type, PROPERTY_TYPES, setType)}
        <button className="search-btn" type="submit" aria-label="Search properties"><Icon id="search" /></button>
      </div>
    </form>
  );
}

function SearchPage({ onBack, onEnquire }: { onBack: () => void; onEnquire: () => void }) {
  const hash = window.location.hash.split('?')[1] || '';
  const q = new URLSearchParams(hash);
  return (
    <section className="service-page search-results-page">
      <div className="service-page-hero company-page-hero">
        <img src="/dubai.jpg" alt="Dubai skyline" />
        <div className="service-page-shade" />
        <div className="container service-page-hero-content">
          <p className="eyebrow">PROPERTY SEARCH</p>
          <h1>Your search.<br /><em>Our portfolio.</em></h1>
          <div className="service-page-actions">
            <button className="button button-outline" type="button" onClick={onBack}>← Back to search</button>
          </div>
        </div>
      </div>
      <div className="container service-page-body">
        <div className="section-heading centered"><h2>Available <em>properties.</em></h2></div>
        <PropertyResults query={q} />
        <div className="service-page-cta">
          <h2>Can't find the right fit?</h2>
          <p>Send us your search — our team will respond with real, available options.</p>
          <a className="button" href="#contact" onClick={onEnquire}>Send my search <Icon id="arrow" /></a>
        </div>
      </div>
    </section>
  );
}

function PropertyResults({ query }: { query: URLSearchParams }) {
  const [state, setState] = useState<'loading' | 'error' | 'done'>('loading');
  const [items, setItems] = useState<PublicProperty[]>([]);
  const key = query.toString();
  useEffect(() => {
    let live = true;
    setState('loading');
    fetchProperties(new URLSearchParams(key))
      .then((p) => { if (!live) return; setItems(p); setState('done'); track('property_search'); p.forEach((x) => track('property_card_impression', x.id)); })
      .catch(() => live && setState('error'));
    return () => { live = false; };
  }, [key]);
  if (state === 'loading') return <p className="results-status">Loading available properties…</p>;
  if (state === 'error') return <p className="results-status">Listings could not be loaded right now. Please send us your search below and we'll respond directly.</p>;
  if (!items.length) return <p className="results-status">No published properties match these filters yet — send us your search and we'll shortlist off-market options for you.</p>;
  return (
    <div className="property-grid">
      {items.map((p) => <PropertyCard key={p.id} p={p} />)}
    </div>
  );
}

function PropertyCard({ p }: { p: PublicProperty }) {
  return (
    <a className="property-card" href={`#/property/${p.id}`} onClick={() => track('property_card_click', p.id)}>
      <div className="property-card-media">
        {p.cover_image_id
          ? <img src={imageUrl(p.id, p.cover_image_id)} alt={p.title} loading="lazy" />
          : <div className="property-card-placeholder"><Icon id="pin" /><span>{p.community || 'Dubai'}</span></div>}
        <span className="property-card-tag">{p.listing_type === 'rent' ? 'For Rent' : p.listing_type === 'off_plan' ? 'Off-Plan' : 'For Sale'}</span>
      </div>
      <div className="property-card-body">
        <strong className="property-card-price">{formatPrice(p)}</strong>
        <h3>{p.title}</h3>
        <p className="property-card-meta">
          {[p.bedrooms && (p.bedrooms === 'Studio' ? 'Studio' : `${p.bedrooms} bed`), p.bathrooms && `${p.bathrooms} bath`, formatArea(p)].filter(Boolean).join(' · ')}
        </p>
        <p className="property-card-loc"><Icon id="pin" />{[p.building, p.community].filter(Boolean).join(', ') || 'Dubai'}</p>
      </div>
    </a>
  );
}

function FeaturedListings() {
  const [items, setItems] = useState<PublicProperty[]>([]);
  const rail = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const measure = () => {
    const el = rail.current;
    if (!el || !el.children.length) return;
    const left = el.getBoundingClientRect().left;
    const distances = Array.from(el.children).map(child => Math.abs(child.getBoundingClientRect().left - left));
    setPosition(distances.indexOf(Math.min(...distances)));
    setAtEnd(Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 4);
  };
  const move = (direction: number) => {
    const el = rail.current;
    if (!el) return;
    const next = Math.max(0, Math.min(items.length - 1, position + direction));
    (el.children[next] as HTMLElement)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
  };
  useEffect(() => {
    let live = true;
    fetchProperties(new URLSearchParams())
      .then(p => { if (live) setItems(p); })
      .catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, []);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    const seen = new Set<string>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting && !seen.has(entry.target.id)) {
        seen.add(entry.target.id);
        track('property_card_impression', Number((entry.target as HTMLElement).dataset.propertyId));
      }
    }, { threshold: .5 });
    Array.from(el.children).forEach(child => observer.observe(child));
    measure();
    return () => { resize.disconnect(); observer.disconnect(); };
  }, [items]);
  if (!items.length) return null;
  return (
    <section className="section container featured-listings" aria-label="Current property listings">
      <div className="section-heading split">
        <div><p className="eyebrow">CURRENT LISTINGS</p><h2>Properties we're<br /><em>representing.</em></h2></div>
        <a className="text-link" href="#/search">Browse all listings <Icon id="arrow" /></a>
      </div>
      <div className="carousel-toolbar">
        <span role="status" aria-live="polite">{position + 1} / {items.length} properties</span>
        <div className="carousel-arrows">
          <button type="button" aria-label="Previous properties" aria-controls="featured-property-track" disabled={position === 0} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Next properties" aria-controls="featured-property-track" disabled={atEnd} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div id="featured-property-track" className="property-carousel" ref={rail} onScroll={measure} role="region" aria-roledescription="carousel" aria-label="Available properties" tabIndex={0}
        onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } }}>
        {items.map((p, i) => <div className="property-slide" id={`featured-property-${p.id}`} data-property-id={p.id} key={p.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}><PropertyCard p={p} /></div>)}
      </div>
    </section>
  );
}

function PropertyPage({ id, onBack, onEnquire }: { id: string; onBack: () => void; onEnquire: () => void }) {
  const [state, setState] = useState<'loading' | 'error' | 'done'>('loading');
  const [data, setData] = useState<{ property: PublicProperty; images: { id: number; alt_text?: string | null; caption?: string | null }[]; details: { map_url?: string | null; amenities: string[]; nearby_places: { name: string; category: string; distance_metres?: number | null }[]; nearby_supermarkets?: string | null; nearby_facilities?: string | null } } | null>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let live = true;
    fetchProperty(id)
      .then((d) => { if (!live) return; setData(d); setState('done'); track('property_detail_view', d.property.id); })
      .catch(() => live && setState('error'));
    return () => { live = false; };
  }, [id]);
  if (state === 'loading') return <section className="service-page"><div className="container service-page-body"><p className="results-status">Loading property…</p></div></section>;
  if (state === 'error' || !data) return (
    <section className="service-page"><div className="container service-page-body">
      <p className="results-status">This listing is no longer available.</p>
      <a className="button" href="#/search">Browse available properties</a>
    </div></section>
  );
  const { property: p, images, details } = data;
  const specs: [string, string][] = [
    ['Reference', p.ref], ['Type', p.property_type], ['Purpose', p.listing_type === 'rent' ? 'For Rent' : p.listing_type === 'off_plan' ? 'Off-Plan' : 'For Sale'],
    p.bedrooms ? ['Bedrooms', p.bedrooms] : null, p.bathrooms ? ['Bathrooms', String(p.bathrooms)] : null,
    p.area_sqft ? ['Area', formatArea(p)] : null, p.furnishing ? ['Furnishing', p.furnishing] : null,
    p.parking ? ['Parking', String(p.parking)] : null, p.view_type ? ['View', p.view_type] : null,
    [p.building, p.community, p.city].filter(Boolean).join(', ') ? ['Location', [p.building, p.community, p.city].filter(Boolean).join(', ')] : null,
  ].filter(Boolean) as [string, string][];
  return (
    <section className="service-page">
      <div className="container service-page-body property-detail">
        <button className="button button-outline" type="button" onClick={onBack}>← Back to results</button>
        <p className="eyebrow" style={{ marginTop: 34 }}>{p.listing_type === 'rent' ? 'FOR RENT' : p.listing_type === 'off_plan' ? 'OFF-PLAN' : 'FOR SALE'} · REF {p.ref}</p>
        <h1 className="property-detail-title">{p.title}</h1>
        <strong className="property-card-price">{formatPrice(p)}</strong>
        {images.length > 0 && (() => {
          const idx = Math.min(active, images.length - 1);
          const go = (d: number) => { setActive((idx + d + images.length) % images.length); track('property_gallery_interaction', p.id); };
          return (
            <div className="property-gallery">
              <div className="gallery-stage"
                onTouchStart={(e) => { (window as unknown as Record<string, number>)._tsx = e.touches[0].clientX; }}
                onTouchEnd={(e) => { const dx = (window as unknown as Record<string, number>)._tsx - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1); }}
                onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); } }}
                tabIndex={0} role="group" aria-roledescription="slide" aria-label={`Photo ${idx + 1} of ${images.length}`}>
                <img className="property-gallery-main" src={imageUrl(p.id, images[idx].id)} alt={images[idx].alt_text || p.title} draggable={false} />
                {images.length > 1 && (<>
                  <button type="button" className="gallery-nav gallery-prev" aria-label="Previous photo" onClick={() => go(-1)}>‹</button>
                  <button type="button" className="gallery-nav gallery-next" aria-label="Next photo" onClick={() => go(1)}>›</button>
                  <span className="gallery-counter">{idx + 1} / {images.length}</span>
                </>)}
              </div>
              {images.length > 1 && (
                <div className="property-gallery-thumbs" ref={(el) => { el?.children[idx]?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }}>
                  {images.map((im, i) => (
                    <button key={im.id} type="button" className={i === idx ? 'active' : ''} aria-label={`Show photo ${i + 1}`} onClick={() => { setActive(i); track('property_gallery_interaction', p.id); }}>
                      <img src={imageUrl(p.id, im.id)} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
        <div className="property-detail-grid">
          <div>
            <h2>Overview</h2>
            <dl className="property-specs">{specs.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
            {details.amenities.length > 0 && (<><h2>Amenities</h2><ul className="property-amenities">{details.amenities.map((a) => <li key={a}><Icon id="check" />{a}</li>)}</ul></>)}
          </div>
          <div>
            {p.description && (<><h2>Description</h2><p className="property-desc">{p.description}</p></>)}
            {details.nearby_places.length > 0 && (<><h2>Nearby</h2><ul className="property-nearby">{details.nearby_places.map((n) => <li key={n.name}><strong>{n.name}</strong><span>{n.category}{n.distance_metres != null ? ` · ${n.distance_metres < 1000 ? Math.round(n.distance_metres) + ' m' : (n.distance_metres / 1000).toFixed(1) + ' km'}` : ''}</span></li>)}</ul></>)}
            {details.map_url && (<p><a className="text-link" href={details.map_url} target="_blank" rel="noopener" onClick={() => track('map_open', p.id)}><Icon id="pin" /> View location on Google Maps</a></p>)}
          </div>
        </div>
        <div className="service-page-cta">
          <h2>Interested in this property?</h2>
          <p>Reference {p.ref} — our team will confirm availability and arrange a viewing.</p>
          <a className="button" href="#contact" onClick={() => { track('inquiry_button_click', p.id); onEnquire(); }}>Enquire about {p.ref} <Icon id="arrow" /></a>
        </div>
      </div>
    </section>
  );
}

function ServicePage({ page, onBack, onEnquire }: { page: typeof SERVICE_PAGES[string]; onBack: () => void; onEnquire: () => void }) {
  return (
    <section className="service-page">
      <div className="service-page-hero">
        <img src={page.img} alt={page.alt} />
        <div className="service-page-shade" />
        <div className="container service-page-hero-content">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}<br /><em>{page.em}</em></h1>
          <p className="service-page-intro">{page.intro}</p>
          <div className="service-page-actions">
            <a className="button" href="#contact" onClick={onEnquire}>Enquire about this service <Icon id="arrow" /></a>
            <button className="button button-outline" type="button" onClick={onBack}>← Back to home</button>
          </div>
        </div>
      </div>
      <div className="container service-page-body">
        <div className="section-heading split"><div><p className="eyebrow">WHAT WE OFFER</p><h2>Built around<br /><em>your goals.</em></h2></div></div>
        <div className="offer-grid">
          {page.offers.map((o, i) => (
            <article className="offer-card" key={o.h}>
              <span className="offer-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{o.h}</h3><p>{o.p}</p>
            </article>
          ))}
        </div>
        <div className="service-page-note"><Icon id="check" /><p>{page.note}</p></div>
        <div className="service-page-cta">
          <h2>Ready to talk it through?</h2>
          <p>Tell us what you need — we’ll show you the right next step.</p>
          <a className="button" href="#contact" onClick={onEnquire}>Speak to our team <Icon id="arrow" /></a>
        </div>
      </div>
    </section>
  );
}

function CompanyPage({ kind, tr, L, onBack, onEnquire }: { kind: 'mission' | 'vision' | 'scope'; tr: boolean; L: (k: string) => string; onBack: () => void; onEnquire: () => void }) {
  const isScope = kind === 'scope';
  const isMission = kind === 'mission';
  return (
    <section className="service-page">
      <div className="service-page-hero company-page-hero">
        <img src="/skyline.jpg" alt="Dubai skyline" />
        <div className="service-page-shade" />
        <div className="container service-page-hero-content">
          <p className="eyebrow">{tr ? L('nav.company') : 'OUR COMPANY'}</p>
          <h1>{isScope
            ? (tr ? <>{L('scope.eyebrow')}<br /><em>{L('services.h2')}</em></> : <>Our scope.<br /><em>One trusted partner.</em></>)
            : (tr ? <>{L(isMission ? 'mission.label' : 'vision.label')}<br /><em>{L('nav.company')}</em></> : isMission ? <>Our mission.<br /><em>Our company.</em></> : <>Our vision.<br /><em>Our company.</em></>)}</h1>
          <div className="service-page-actions">
            <a className="button" href="#contact" onClick={onEnquire}>{tr ? L('services.footerCta') : 'Talk to our team'} <Icon id="arrow" /></a>
            <button className="button button-outline" type="button" onClick={onBack}>← Back to home</button>
          </div>
        </div>
      </div>
      <div className="container service-page-body">
        {isScope ? (
          <>
            <div className="section-heading centered"><p className="eyebrow">{tr ? L('services.eyebrow') : 'OUR SERVICES'}</p><h2>{tr ? <>{L('services.h1')}<br /><em>{L('services.h2')}</em></> : <>Three core services.<br /><em>One trusted partner.</em></>}</h2></div>
            <div className="offer-grid offer-grid-3">
              <article className="offer-card"><span className="offer-num">01</span><h3>{tr ? L('svc1.h') : 'Leasing property brokerage'}</h3><p>{tr ? L('svc1.p') : 'We connect landlords with prospective tenants and help tenants find the right home, office, or commercial space.'}</p></article>
              <article className="offer-card"><span className="offer-num">02</span><h3>{tr ? L('svc2.h') : 'Buying & selling brokerage'}</h3><p>{tr ? L('svc2.p') : 'Find the right property or connect yours with prospective buyers — including investment property opportunities.'}</p></article>
              <article className="offer-card"><span className="offer-num">03</span><h3>{tr ? L('svc3.h') : 'Real estate management supervision'}</h3><p>{tr ? L('svc3.p') : 'Ongoing support for your Dubai property — scope, responsibilities, and communication agreed from the start.'}</p></article>
            </div>
            <div className="scope-block">
              <p className="scope-text">{tr ? <>{L('scope.a1')} <strong>BG Venture Properties</strong> {L('scope.a2')} <mark>{L('scope.m1')}</mark>{L('scope.a3')} <mark>{L('scope.m2')}</mark>{L('scope.a4')} <mark>{L('scope.m3')}</mark>{L('scope.a5')} <em>{L('scope.a6')}</em></> : <>We are <strong>BG Venture Properties</strong> — a Dubai real estate brokerage focused on three things: <mark>leasing property brokerage</mark>, <mark>buying &amp; selling brokerage</mark>, and <mark>real estate management supervision</mark>. For investors, landlords, businesses, and people looking for their next property, our role is simple: <em>understand what you need, help you find it, and support what comes next.</em></>}</p>
            </div>
          </>
        ) : (
          <div className="purpose-grid company-purpose-grid">
            <div className="purpose-card"><span className="purpose-label">{tr ? L('mission.label') : 'OUR MISSION'}</span><p>{tr ? L('mission.text') : 'To connect investors, landlords, and businesses with the right Dubai property opportunities — through clear advice, disciplined service, and support that continues beyond the transaction.'}</p></div>
            <div className="purpose-card purpose-card-dark"><span className="purpose-label">{tr ? L('vision.label') : 'OUR VISION'}</span><p>{tr ? L('vision.text') : 'To be the trusted Dubai property partner for investors worldwide — known for clarity, integrity, and the confidence we bring to every property decision.'}</p></div>
          </div>
        )}
        <div className="service-page-cta">
          <h2>{tr ? L('services.footerH') : 'Not sure where to start?'}</h2>
          <p>{tr ? L('services.footerP') : 'Tell us your goals. We’ll help you identify the right next step.'}</p>
          <a className="button" href="#contact" onClick={onEnquire}>{tr ? L('services.footerCta') : 'Talk to our team'} <Icon id="arrow" /></a>
        </div>
      </div>
    </section>
  );
}

function Feature({ h, children }: { h: string; children: React.ReactNode }) {
  return <li><span className="check-icon"><Icon id="check" /></span><div><h3>{h}</h3><p>{children}</p></div></li>;
}

function LandlordRow({ n, h, p, onPick }: { n: string; h: string; p: string; onPick: () => void }) {
  return <a href="#contact" onClick={onPick}><span>{n}</span><div><h3>{h}</h3><p>{p}</p></div><Icon id="up" /></a>;
}

function Step({ n, h, p }: { n: string; h: string; p: string }) {
  return <article><span className="step-number">{n}</span><h3>{h}</h3><p>{p}</p></article>;
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return <details><summary>{q}</summary><p>{children}</p></details>;
}
