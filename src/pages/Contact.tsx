import Icon from '../components/Icon';
import InquiryForm from '../components/InquiryForm';
import { Link } from '../lib/router';
import { ADDRESS, EMAIL, LANDLINE, LANDLINE_TEL, MAPS_URL, MOBILE, MOBILE_TEL, WHATSAPP } from '../lib/content';
import { t, type Lang } from '../i18n';

export default function Contact({ lang }: { lang: Lang }) {
  const tr = lang !== 'en';
  const L = (k: string) => t(k, lang);
  return (
    <main>
      <section className="page-hero">
        <img src="/contract.jpg" alt="" />
        <div className="page-hero-shade" />
        <div className="container page-hero-content">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Contact</span></nav>
          <h1>{tr ? <>{L('contact.h1')} {L('contact.h3')}</> : <>Let’s talk <em>property.</em></>}</h1>
          <p>Buying, selling, renting, leasing, or management — tell us what you need and our Dubai team will respond.</p>
        </div>
      </section>

      <div className="container page-pad contact-page">
        <div className="contact-copy">
          <h2>BG Venture Properties</h2>
          <div className="contact-details">
            <a href={`mailto:${EMAIL}`}><span className="contact-icon"><Icon id="mail" /></span><span><small>EMAIL</small>{EMAIL}</span></a>
            <a href={`tel:${LANDLINE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>OFFICE</small>{LANDLINE}</span></a>
            <a href={`tel:${MOBILE_TEL}`}><span className="contact-icon"><Icon id="phone" /></span><span><small>MOBILE</small>{MOBILE}</span></a>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"><span className="contact-icon"><Icon id="whatsapp" /></span><span><small>WHATSAPP</small>Message us anytime</span></a>
          </div>
          <p className="contact-addr"><Icon id="pin" /> {ADDRESS}</p>
          <a className="text-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Open in Google Maps <Icon id="up" /></a>
        </div>
        <InquiryForm heading="Send us a message" />
      </div>
    </main>
  );
}
