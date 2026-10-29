import { useEffect, useRef, useState } from 'react';
import Icon, { IconId } from './components/Icon';
import { t, Lang } from './i18n';

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

const NAV_ITEMS = [
  { href: '#home', key: 'nav.home', label: 'Home' },
  { href: '#about', key: 'nav.company', label: 'Our company' },
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
  const formRef = useRef<HTMLFormElement>(null);

  useReveal();

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
  const isAr = lang === 'ar';

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <div className="topbar" role="region" aria-label="Office contact details">
        <div className="ticker-viewport">
          <div className="ticker-track is-ready">
            {[0, 1].map((copy) => (
              <div className="ticker-group" key={copy} aria-hidden={copy === 1}>
                <span><Icon id="pin" /> Iris Bay Tower, Dubai, UAE</span>
                <a href={`mailto:${EMAIL}`} tabIndex={copy === 1 ? -1 : undefined}><Icon id="mail" /> {EMAIL}</a>
                <a href={`tel:${LANDLINE_TEL}`} tabIndex={copy === 1 ? -1 : undefined}><Icon id="phone" /> Landline: {LANDLINE}</a>
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
            {NAV_ITEMS.map(({ href, key, label }) => (
              <a key={href} className={`nav-link${activeSection === href ? ' active' : ''}`} href={href}
                aria-current={activeSection === href ? 'location' : undefined}
                onClick={() => setMenuOpen(false)}>
                {isAr ? L(key) : label}
              </a>
            ))}
            <button className="lang-toggle" type="button" aria-pressed={isAr} aria-label="Switch language between English and Arabic" onClick={() => setLang(isAr ? 'en' : 'ar')}>
              <span>EN</span><i /><span className="lang-other">عربي</span>
            </button>
            <a className="button button-small" href="#contact" onClick={() => setMenuOpen(false)}>
              {isAr ? L('nav.cta') : 'Speak to an expert'} <Icon id="up" />
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <img className="hero-image hero-image-one" src="/dubai.jpg" alt="Dubai skyline with Burj Khalifa and the city's highways" width="2200" height="1467" />
          <img className="hero-image hero-image-two" src="/skyline.jpg" alt="" aria-hidden="true" width="1000" height="1200" loading="lazy" />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="eyebrow hero-eyebrow"><span /> {isAr ? L('hero.eyebrow') : 'DUBAI REAL ESTATE INVESTMENT EXPERTS'}</p>
            <h1 id="hero-title">
              {isAr ? <>{L('hero.line1')}<br />{L('hero.line2')}<br /><em>{L('hero.line3')}</em></>
                : <>The right property.<br />The right partner.<br /><em>A world of possibility.</em></>}
            </h1>
            <p className="hero-description">
              {isAr ? L('hero.desc') : 'A Dubai real estate brokerage built around you. Leasing, buying, selling, and management supervision—wherever you are in the world.'}
            </p>
            <div className="hero-actions">
              <a className="button" href="#contact">{isAr ? L('hero.cta1') : 'Let’s discuss your goals'} <Icon id="arrow" /></a>
              <a className="button button-outline" href="#services">{isAr ? L('hero.cta2') : 'Explore our expertise'} <Icon id="up" /></a>
            </div>
            <div className="hero-assurance">
              <span><Icon id="check" /> {isAr ? L('hero.check1') : 'Local market expertise'}</span>
              <span><Icon id="check" /> {isAr ? L('hero.check2') : 'International client support'}</span>
            </div>
          </div>
          <div className="hero-side"><span>BASED IN DUBAI</span><i /><span>CONNECTED WORLDWIDE</span></div>
          <div className="hero-bottom container">
            <span>{isAr ? L('hero.bottomLeft') : 'YOUR AMBITION. OUR LOCAL EXPERTISE.'}</span>
            <a href="#about">{isAr ? L('hero.bottomRight') : 'Discover BG Venture'} <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="quick-start container" aria-label="Find the right service">
          <div className="quick-title"><span>{isAr ? L('quick.label') : 'YOUR NEXT MOVE'}</span><h2>{isAr ? L('quick.title') : 'How can we help?'}</h2></div>
          <a href="#contact" onClick={() => pickService('Investment advisory')}>
            <Icon id="invest" /><span dangerouslySetInnerHTML={{ __html: isAr ? L('quick.invest') : 'I want to <strong>invest in property</strong>' }} /><Icon id="up" />
          </a>
          <a href="#spaces">
            <Icon id="office" /><span dangerouslySetInnerHTML={{ __html: isAr ? L('quick.space') : 'I’m looking for <strong>an office or home</strong>' }} /><Icon id="up" />
          </a>
          <a href="#contact" onClick={() => pickService('Property management')}>
            <Icon id="key" /><span dangerouslySetInnerHTML={{ __html: isAr ? L('quick.landlord') : 'I’m a landlord <strong>looking for support</strong>' }} /><Icon id="up" />
          </a>
        </section>

        <section id="about" className="section about-section">
          <div className="container">
            <div className="section-heading centered">
              <p className="eyebrow">{isAr ? L('about.eyebrow') : 'THE COMPANY BEHIND YOUR NEXT MOVE'}</p>
              <h2>{isAr ? <>{L('about.h1')}<br /><em>{L('about.h2')}</em></> : <>Property expertise.<br /><em>Personal commitment.</em></>}</h2>
              <p>{isAr ? L('about.sub') : <>From finding your first investment to managing an established portfolio,<br className="desktop-break" /> we connect people, properties, and opportunities across Dubai.</>}</p>
            </div>
            <div className="stats-grid">
              <div className="stat"><span>01 / OUR RELATIONSHIPS</span><strong>200<span>+</span></strong><h3>{isAr ? L('stat1.h') : 'Landlords supported'}</h3><p>Relationships built around property ownership.</p></div>
              <div className="stat"><span>02 / OUR PROPERTY EXPERIENCE</span><strong>5,000</strong><h3>{isAr ? L('stat2.h') : 'Properties supported'}</h3><p>Helping connect properties with people.</p></div>
              <div className="stat"><span>03 / OUR HOME MARKET</span><strong>Dubai<span>.</span></strong><h3>{isAr ? L('stat3.h') : 'Local knowledge'}</h3><p>On-the-ground support in the UAE.</p></div>
              <div className="stat"><span>04 / OUR PERSPECTIVE</span><strong>Global<span>.</span></strong><h3>{isAr ? L('stat4.h') : 'International clients'}</h3><p>Your location need not limit your search.</p></div>
            </div>
            <div className="about-bottom">
              <p>We are <strong>BG Venture Properties</strong>—a Dubai real estate brokerage focused on three things: <strong>leasing property brokerage</strong>, <strong>buying &amp; selling brokerage</strong>, and <strong>real estate management supervision</strong>. For investors, landlords, businesses, and people looking for their next property, our role is simple: understand what you need, help you find it, and support what comes next.</p>
              <a className="text-link" href="#contact">Get to know your property partner <Icon id="arrow" /></a>
            </div>
            <div className="purpose-grid">
              <div className="purpose-card"><span className="purpose-label">{isAr ? L('mission.label') : 'OUR MISSION'}</span><p>{isAr ? L('mission.text') : 'To connect investors, landlords, and businesses with the right Dubai property opportunities — through clear advice, disciplined service, and support that continues beyond the transaction.'}</p></div>
              <div className="purpose-card purpose-card-dark"><span className="purpose-label">{isAr ? L('vision.label') : 'OUR VISION'}</span><p>{isAr ? L('vision.text') : 'To be the trusted Dubai property partner for investors worldwide — recognised for clarity, integrity, and the confidence we bring to every property decision.'}</p></div>
              <div className="purpose-values"><span><strong>Integrity</strong> in every recommendation</span><i /><span><strong>Clarity</strong> in every detail</span><i /><span><strong>Commitment</strong> beyond the transaction</span></div>
            </div>
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <div className="section-heading split">
              <div>
                <p className="eyebrow">{isAr ? L('services.eyebrow') : 'WHAT WE DO'}</p>
                <h2>{isAr ? <>{L('services.h1')}<br /><em>{L('services.h2')}</em></> : <>Three core services.<br /><em>One trusted partner.</em></>}</h2>
              </div>
              <p>{isAr ? L('services.sub') : <>Licensed real estate brokerage activities—<br />covering leasing, sales, and management supervision.</>}</p>
            </div>
            <div className="service-grid">
              <ServiceCard n="01" icon="key" title={isAr ? L('svc1.h') : 'Leasing property brokerage'} link="Find your next space" onPick={() => pickService('Office leasing')}>
                {isAr ? L('svc1.p') : 'We connect landlords with prospective tenants and help tenants find the right home, office, or commercial space—matching every requirement.'}
              </ServiceCard>
              <ServiceCard n="02" icon="home" title={isAr ? L('svc2.h') : 'Buying & selling brokerage'} link="Make your next move" onPick={() => pickService('Buying or selling')}>
                {isAr ? L('svc2.p') : 'Find the right property or connect yours with potential buyers. Support with your search, property positioning, enquiries, and next steps—including investment opportunities.'}
              </ServiceCard>
              <ServiceCard n="03" icon="shield" title={isAr ? L('svc3.h') : 'Management supervision'} link="Support for your property" onPick={() => pickService('Property management')}>
                {isAr ? L('svc3.p') : 'Support for the ongoing needs of your Dubai property. Agree the supervision scope, responsibilities, communication, and fees from the outset.'}
              </ServiceCard>
            </div>
            <div className="supporting-services">
              <span className="supporting-label">ALSO FOR YOU</span>
              <a href="#contact" onClick={() => pickService('Investment advisory')}><Icon id="invest" /> Investment opportunities</a>
              <a href="#contact" onClick={() => pickService('Tenant sourcing or residential rental')}><Icon id="key" /> Tenant sourcing &amp; rentals</a>
              <a href="#contact" onClick={() => pickService('Overseas property search')}><Icon id="globe" /> Overseas property search</a>
            </div>
            <div className="services-footer">
              <div><h3>{isAr ? L('services.footerH') : 'Not sure where to start?'}</h3><p>{isAr ? L('services.footerP') : 'Tell us your goals. We’ll help you identify the right next step.'}</p></div>
              <a className="button button-dark" href="#contact">{isAr ? L('services.footerCta') : 'Talk to our team'} <Icon id="arrow" /></a>
            </div>
          </div>
        </section>

        <section id="spaces" className="section spaces">
          <div className="container">
            <div className="section-heading split">
              <div><p className="eyebrow">THE RIGHT SPACE MAKES A DIFFERENCE</p><h2>For your business.<br /><em>For your next chapter.</em></h2></div>
              <p>A new workspace. A place to call home.<br />A property with investment potential.</p>
            </div>
            <div className="space-grid">
              <a className="space-card space-office" href="#contact" onClick={() => pickService('Office leasing')}>
                <img src="/office.jpg" alt="Illustrative spacious modern office with desks and lounge seating" width="1200" height="800" loading="lazy" />
                <div className="space-content"><span className="space-tag">COMMERCIAL PROPERTY</span><h3>Your ambition.<br />A better address.</h3><p>Office spaces that work for your business.</p><span className="space-action">Find office space <Icon id="arrow" /></span></div>
                <span className="image-index">01 / BUSINESS</span>
              </a>
              <a className="space-card space-home" href="#contact" onClick={() => pickService('Buying or selling')}>
                <img src="/residence.jpg" alt="Illustrative contemporary residential interior with natural light" width="1000" height="1000" loading="lazy" />
                <div className="space-content"><span className="space-tag">RESIDENTIAL PROPERTY</span><h3>A place to belong.<br />An opportunity to own.</h3><p>Homes and investments around your needs.</p><span className="space-action">Find a property <Icon id="arrow" /></span></div>
                <span className="image-index">02 / LIVING</span>
              </a>
            </div>
            <p className="image-disclaimer">Illustrative photography. Contact our team for current property availability and details.</p>
          </div>
        </section>

        <section id="international" className="international section">
          <div className="container international-layout">
            <div className="international-visual">
              <img src="/skyline.jpg" alt="Aerial view of Burj Al Arab and Dubai's coastline" width="1000" height="1200" loading="lazy" />
              <div className="location-label"><Icon id="pin" /><span>YOUR LOCAL CONNECTION<strong>Dubai, United Arab Emirates</strong></span><span className="location-dot" /></div>
              <div className="international-caption"><Icon id="globe" /><span>Wherever you are.<br /><strong>We’re here in Dubai.</strong></span></div>
            </div>
            <div className="international-copy">
              <p className="eyebrow">LOCAL EXPERTISE. INTERNATIONAL REACH.</p>
              <h2>You don’t have to be here.<br /><em>Your property partner is.</em></h2>
              <p>Investing or finding property in another country starts with having the right people on the ground. We help international clients explore Dubai with a clearer understanding of their options.</p>
              <ul className="feature-list">
                <Feature h="A search built around your requirements">Your objectives, preferred areas, budget, and timing guide the shortlist.</Feature>
                <Feature h="Guidance through the practical details">Understand the transaction stages and which steps may require documentation or specialist advice.</Feature>
                <Feature h="Support beyond finding the property">Discuss tenants, leasing, and ongoing management before you take the next step.</Feature>
              </ul>
              <a className="button" href="#contact" onClick={() => pickService('Overseas property search')}>Connect with your Dubai team <Icon id="arrow" /></a>
            </div>
          </div>
        </section>

        <section id="landlords" className="section landlords">
          <div className="container landlord-layout">
            <div>
              <p className="eyebrow">FOR LANDLORDS &amp; PROPERTY OWNERS</p>
              <h2>Your property deserves<br /><em>the right attention.</em></h2>
              <p>Finding tenants. Reaching buyers. Managing the everyday.<br />We help you move from property ownership to a practical plan.</p>
              <a className="button button-outline" href="#contact" onClick={() => pickService('Property management')}>Let’s talk about your property <Icon id="arrow" /></a>
            </div>
            <div className="landlord-services">
              <LandlordRow n="01" h="Find the right tenants" p="Connect your property with people looking to rent." onPick={() => pickService('Tenant sourcing or residential rental')} />
              <LandlordRow n="02" h="Reach prospective buyers" p="Get support presenting your property to potential clients." onPick={() => pickService('Buying or selling')} />
              <LandlordRow n="03" h="Manage with a clearer plan" p="Agree the services and communication your property needs." onPick={() => pickService('Property management')} />
            </div>
          </div>
        </section>

        <section id="process" className="section process">
          <div className="container">
            <div className="section-heading centered"><p className="eyebrow">A CLEAR PATH FORWARD</p><h2>From your first question<br /><em>to your next move.</em></h2></div>
            <div className="steps">
              <Step n="01" h="Tell us what matters" p="We start with your objectives, budget, property requirements, and timeframe." />
              <Step n="02" h="Explore the right options" p="Review suitable properties or an appropriate service plan, with the details explained." />
              <Step n="03" h="Make an informed decision" p="Understand the costs, responsibilities, documentation, and next steps." />
              <Step n="04" h="Plan for what comes next" p="Discuss leasing, tenants, or property management as your needs evolve." />
            </div>
            <p className="risk-note"><Icon id="invest" /><span>Informed investment matters. Property values and rental income can rise or fall. Returns are not guaranteed. Evaluate costs, risks, and your own circumstances before committing.</span></p>
          </div>
        </section>

        <section className="section faq-section">
          <div className="container faq-layout">
            <div><p className="eyebrow">YOUR QUESTIONS, ANSWERED</p><h2>Clarity before<br /><em>commitment.</em></h2><p>Good decisions start with good questions.</p><a className="text-link" href="#contact">Ask our team <Icon id="arrow" /></a></div>
            <div className="faqs">
              <Faq q="Can you find me a property if I am outside the UAE?">Yes. We help overseas clients search for Dubai property based on their requirements. We can discuss your objectives remotely and explain which transaction steps may need documentation, attendance, verification, or professional support.</Faq>
              <Faq q="Can you help me find an office for my business?">Yes. Share your preferred location, team size, budget, intended use, and move-in timeframe. We will help you explore commercial space and identify requirements that need confirmation before a lease is agreed.</Faq>
              <Faq q="I own a property. Can you help me find tenants or buyers?">Yes. We help landlords connect with prospective tenants and support owners looking to sell. Contact us with your property details to discuss availability, positioning, and the appropriate service scope.</Faq>
              <Faq q="What does your property management service include?">The scope is agreed around your property and requirements. Speak with us about tenant communication, leasing support, maintenance coordination, reporting, fees, and approvals. Only services specified in your agreement are included.</Faq>
              <Faq q="Do you guarantee returns on investment properties?">No. Property prices, rent, and occupancy change with market conditions. Any estimates must be considered alongside their assumptions, costs, and risks. Past performance does not guarantee future results.</Faq>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">{isAr ? L('contact.eyebrow') : 'LET’S MAKE YOUR NEXT MOVE COUNT'}</p>
              <h2>{isAr ? <>{L('contact.h1')}<br />{L('contact.h2')}<br /><em>{L('contact.h3')}</em></> : <>Your goals.<br />Our expertise.<br /><em>Let’s talk.</em></>}</h2>
              <p>{isAr ? <>{L('contact.sub')}<br />{L('contact.sub2')}</> : <>Investing, buying, selling, renting, or managing?<br />Tell us what you need. We’ll help you take the next step.</>}</p>
              <div className="contact-details">
                <a href={`mailto:${EMAIL}`}><span className="contact-icon"><Icon id="mail" /></span><span><small>EMAIL OUR TEAM</small>{EMAIL}</span></a>
                <a href={`tel:${LANDLINE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>CALL OUR DUBAI OFFICE</small>{LANDLINE}</span></a>
                <a href={`tel:${MOBILE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>MOBILE</small>{MOBILE}</span></a>
              </div>
              <div className="office-address"><Icon id="pin" /><p><strong>Office 1508, Iris Bay Tower</strong><br />Business Bay, Dubai, United Arab Emirates</p></div>
            </div>
            <form id="enquiry-form" ref={formRef} className="enquiry-form" onSubmit={onSubmit}>
              <span className="form-eyebrow">A CONVERSATION IS A GOOD START</span>
              <h3>{isAr ? L('form.title') : 'How can we help you?'}</h3>
              <p className="form-intro">{isAr ? L('form.intro') : 'Share a few details to prepare an email to our team.'}</p>
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
              <button className="button" type="submit">{isAr ? L('form.submit') : 'Prepare my enquiry'} <Icon id="arrow" /></button>
              <p className="form-disclosure">This form opens your email app. Nothing is submitted or stored by this website. Please do not include identity documents or financial account details.</p>
              <p id="form-status" role="status" aria-live="polite">{status}</p>
              <noscript><p>Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> directly to make an enquiry.</p></noscript>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-accent" />
        <div className="container footer-main">
          <div className="footer-brand-block">
            <a className="footer-wordmark" href="#home">BG VENTURE<span>PROPERTIES</span></a>
            <p>Dubai real estate expertise.<br />Personal support. Global perspective.</p>
            <span className="footer-location"><Icon id="globe" /> Dubai, United Arab Emirates</span>
          </div>
          <div><h3>Explore</h3><a href="#about">Our company</a><a href="#services">Our expertise</a><a href="#international">International investors</a><a href="#process">How we work</a></div>
          <div><h3>Our expertise</h3><a href="#contact" onClick={() => pickService('Office leasing')}>Leasing brokerage</a><a href="#contact" onClick={() => pickService('Buying or selling')}>Buying &amp; selling brokerage</a><a href="#contact" onClick={() => pickService('Property management')}>Management supervision</a><a href="#contact" onClick={() => pickService('Overseas property search')}>Overseas property search</a></div>
          <div><h3>Let’s connect</h3><a href={`tel:${LANDLINE_TEL}`}>{LANDLINE}</a><a href={`tel:${MOBILE_TEL}`}>{MOBILE}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
        </div>
        <div className="container footer-map">
          <div className="footer-map-label"><Icon id="pin" /><span>Office 1508, Iris Bay Tower · Business Bay, Dubai, UAE</span><a href="https://www.google.com/maps/search/?api=1&query=Iris+Bay+Tower+Business+Bay+Dubai" target="_blank" rel="noopener noreferrer">Open in Google Maps <Icon id="up" /></a></div>
          <iframe title="BG Venture Properties office location — Iris Bay Tower, Business Bay, Dubai" src="https://www.google.com/maps?q=Iris%20Bay%20Tower%2C%20Business%20Bay%2C%20Dubai%2C%20UAE&z=16&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} BG Venture Properties. All rights reserved.</span>
          <a href="#home">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </>
  );
}

function ServiceCard({ n, icon, title, link, onPick, children }: { n: string; icon: IconId; title: string; link: string; onPick: () => void; children: React.ReactNode }) {
  return (
    <article className="service-card">
      <div className="service-top"><span className="icon-box"><Icon id={icon} /></span><span>{n}</span></div>
      <h3>{title}</h3>
      <p>{children}</p>
      <a className="text-link" href="#contact" onClick={onPick}>{link} <Icon id="arrow" /></a>
    </article>
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
