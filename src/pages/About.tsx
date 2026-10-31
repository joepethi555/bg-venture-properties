import Icon from '../components/Icon';
import { Link } from '../lib/router';
import { t, type Lang } from '../i18n';
import { EMAIL } from '../lib/content';

export default function About({ lang }: { lang: Lang }) {
  const tr = lang !== 'en';
  const L = (k: string) => t(k, lang);
  return (
    <main>
      <section className="page-hero">
        <img src="/skyline.jpg" alt="Dubai skyline" />
        <div className="page-hero-shade" />
        <div className="container page-hero-content">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">About</span></nav>
          <h1>{tr ? <>{L('about.h1')}<br /><em>{L('about.h2')}</em></> : <>Property expertise.<br /><em>Personal commitment.</em></>}</h1>
          <p>From finding your first investment to managing an established portfolio, we connect people, properties, and opportunities across Dubai.</p>
        </div>
      </section>

      <div className="container page-pad">
        <div className="purpose-grid">
          <div className="purpose-card"><span className="purpose-label">{tr ? L('mission.label') : 'OUR MISSION'}</span><p>{tr ? L('mission.text') : 'To connect investors, landlords, and businesses with the right Dubai property opportunities — through clear advice, disciplined service, and support that continues beyond the transaction.'}</p></div>
          <div className="purpose-card purpose-card-dark"><span className="purpose-label">{tr ? L('vision.label') : 'OUR VISION'}</span><p>{tr ? L('vision.text') : 'To be the trusted Dubai property partner for investors worldwide — known for clarity, integrity, and the confidence we bring to every property decision.'}</p></div>
        </div>

        <div className="scope-block">
          <p className="scope-text">
            We are <strong>BG Venture Properties</strong> — a Dubai real estate brokerage focused on three licensed activities: <mark>leasing property brokerage</mark>, <mark>buying &amp; selling brokerage</mark>, and <mark>real estate management supervision</mark>. For investors, landlords, businesses, and people looking for their next property, our role is simple: <em>understand what you need, help you find it, and support what comes next.</em>
          </p>
        </div>

        <div className="stats-row about-stats">
          <div><strong>200+</strong><span>{tr ? L('stat1.h') : 'Landlords supported'}</span></div>
          <div><strong>5,000</strong><span>{tr ? L('stat2.h') : 'Properties supported'}</span></div>
          <div><strong>Dubai</strong><span>{tr ? L('stat3.h') : 'Local knowledge'}</span></div>
          <div><strong>Global</strong><span>{tr ? L('stat4.h') : 'International clients'}</span></div>
        </div>

        <div className="svc-grid svc-grid-3">
          <article className="svc-card"><span className="svc-num">01</span><h3>{tr ? L('svc1.h') : 'Leasing property brokerage'}</h3><p>{tr ? L('svc1.p') : 'We connect landlords with prospective tenants and help tenants find the right home, office, or commercial space.'}</p><Link className="text-link" to="/rent">Browse rentals <Icon id="arrow" /></Link></article>
          <article className="svc-card"><span className="svc-num">02</span><h3>{tr ? L('svc2.h') : 'Buying & selling brokerage'}</h3><p>{tr ? L('svc2.p') : 'Find the right property or connect yours with potential buyers — including investment opportunities.'}</p><Link className="text-link" to="/buy">Browse for sale <Icon id="arrow" /></Link></article>
          <article className="svc-card"><span className="svc-num">03</span><h3>{tr ? L('svc3.h') : 'Real estate management supervision'}</h3><p>{tr ? L('svc3.p') : 'Support for the ongoing needs of your Dubai property — scope and communication agreed from the start.'}</p><Link className="text-link" to="/services/property-management">Management services <Icon id="arrow" /></Link></article>
        </div>

        <p className="risk-note"><Icon id="invest" /><span>{tr ? L('proc.note') : 'Informed investment matters. Property values and rental income can rise or fall. Returns are not guaranteed. Evaluate costs, risks, and your own circumstances before committing.'}</span></p>

        <div className="service-page-cta">
          <h2>{tr ? L('services.footerH') : 'Not sure where to start?'}</h2>
          <p>{tr ? L('services.footerP') : 'Tell us your goals. We’ll help you identify the right next step.'}</p>
          <Link className="button" to="/contact">{tr ? L('services.footerCta') : 'Talk to our team'} <Icon id="arrow" /></Link>
          <a className="text-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </div>
    </main>
  );
}
