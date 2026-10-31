import Icon from '../components/Icon';
import InquiryForm from '../components/InquiryForm';
import { Link } from '../lib/router';
import { t, type Lang } from '../i18n';

const SERVICES = [
  { h: 'Residential property management', p: 'Apartments and villas kept tenanted, maintained, and reported on — with an agreed scope.' },
  { h: 'Commercial property management', p: 'Offices, retail, and mixed-use assets supervised to protect occupancy and income.' },
  { h: 'Building management', p: 'Whole-building oversight: common areas, service coordination, and owner reporting.' },
  { h: 'Tenant management', p: 'Screening, move-ins, renewals, and day-to-day tenant communication handled for you.' },
  { h: 'Rental collection', p: 'Rent tracked and followed up, with clear visibility of payments and arrears.' },
  { h: 'Maintenance coordination', p: 'Issues assessed, quotes gathered, and work approved by you before it proceeds.' },
  { h: 'Property inspections', p: 'Scheduled condition checks with photo reports so distance never means being out of touch.' },
  { h: 'Leasing & occupancy management', p: 'Marketing, viewings, and lease documentation to keep vacancy periods short.' },
];

export default function Management({ lang }: { lang: Lang }) {
  const tr = lang !== 'en';
  const L = (k: string) => t(k, lang);
  return (
    <main>
      <section className="page-hero">
        <img src="/p5.jpg" alt="Residential building under management" />
        <div className="page-hero-shade" />
        <div className="container page-hero-content">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Property management</span></nav>
          <h1>Property management, <em>done properly.</em></h1>
          <p>Licensed real estate management supervision for owners in Dubai and abroad — scope, responsibilities, and fees agreed from the outset.</p>
        </div>
      </section>

      <div className="container page-pad">
        <div className="section-heading split">
          <div><p className="eyebrow">{tr ? L('services.eyebrow') : 'WHAT WE MANAGE'}</p><h2>{tr ? <>{L('svc3.h')}.<br /><em>{L('services.h2')}</em></> : <>Everyday supervision.<br /><em>Long-term value.</em></>}</h2></div>
          <p>Living abroad or simply short on time? We keep your Dubai property running — with clear communication and a team on the ground.</p>
        </div>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <article className="svc-card" key={s.h}>
              <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.h}</h3><p>{s.p}</p>
            </article>
          ))}
        </div>

        <div className="mgmt-note">
          <Icon id="check" />
          <p>Over 200 landlords already trust BG Venture Properties to connect their properties with the right people — and keep them running. Tell us how involved you want to be: we agree the scope, fees, and approvals before we begin.</p>
        </div>

        <section className="market-cta">
          <div>
            <h2>Own a property in Dubai?</h2>
            <p>Tell us about it — we’ll outline a management scope that fits, with fees and approvals agreed before anything starts.</p>
          </div>
          <InquiryForm defaultType="management" heading="Request a management proposal" compact />
        </section>
      </div>
    </main>
  );
}
