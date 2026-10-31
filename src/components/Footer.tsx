import Icon from './Icon';
import { Link } from '../lib/router';
import { ADDRESS, CATEGORIES, EMAIL, LANDLINE, LANDLINE_TEL, MAPS_EMBED, MAPS_URL, MOBILE, MOBILE_TEL } from '../lib/content';

export default function Footer() {
  return (
    <footer>
      <div className="footer-accent" />
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link to="/" aria-label="BG Venture Properties home"><img className="footer-logo" src="/logo-transparent.png" alt="BG Venture Properties" width="750" height="617" /></Link>
          <p>Dubai real estate brokerage.<br />Buy, sell, rent, lease &amp; manage — with one trusted partner.</p>
          <span className="footer-location"><Icon id="globe" /> Dubai, United Arab Emirates</span>
        </div>
        <div>
          <h3>Properties</h3>
          <Link to="/buy">Buy property</Link>
          <Link to="/rent">Rent property</Link>
          <Link to="/services/property-management">Property management</Link>
          <Link to="/contact">Sell your property</Link>
        </div>
        <div>
          <h3>Categories</h3>
          {CATEGORIES.slice(0, 5).map((c) => <Link key={c.key} to={`/buy/${c.key}`}>{c.plural}</Link>)}
        </div>
        <div>
          <h3>Company</h3>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
          <a href={`tel:${LANDLINE_TEL}`}>{LANDLINE}</a>
          <a href={`tel:${MOBILE_TEL}`}>{MOBILE}</a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </div>
      <div className="container footer-map">
        <div className="footer-map-label"><Icon id="pin" /><span>{ADDRESS}</span><a href={MAPS_URL} target="_blank" rel="noopener noreferrer">Open in Google Maps <Icon id="up" /></a></div>
        <iframe title="BG Venture Properties office location — Regal Tower, Business Bay, Dubai" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} BG Venture Properties. All rights reserved.</span>
        <span className="footer-note">Prices and availability are confirmed on inquiry — contact our team for current status.</span>
      </div>
    </footer>
  );
}
