import { useEffect, useState, Fragment } from 'react';
import Icon from './Icon';
import { Link } from '../lib/router';
import { ADDRESS, CATEGORIES, EMAIL, LANDLINE, LANDLINE_TEL } from '../lib/content';
import { t, type Lang } from '../i18n';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'ar', label: 'عربي' }, { code: 'zh', label: '中文' }] as const;

function CategoryMenu({ purpose, onPick }: { purpose: 'sale' | 'rent'; onPick: () => void }) {
  const base = purpose === 'sale' ? '/buy' : '/rent';
  return (
    <div className="nav-dd" role="menu">
      <Link to={base} role="menuitem" onClick={onPick}>All {purpose === 'sale' ? 'properties for sale' : 'rentals'}</Link>
      {CATEGORIES.map((c) => <Link key={c.key} to={`${base}/${c.key}`} role="menuitem" onClick={onPick}>{c.plural}</Link>)}
    </div>
  );
}

export default function Header({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const tr = lang !== 'en';
  const L = (k: string) => t(k, lang);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.has-dd')) setOpen(null); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const navLink = (to: string, label: string) => (
    <Link to={to} className="nav-link" onClick={() => setMenuOpen(false)}>{label}</Link>
  );

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span><Icon id="pin" /> {ADDRESS}</span>
          <div className="topbar-links">
            <a href={`mailto:${EMAIL}`}><Icon id="mail" /> {EMAIL}</a>
            <a href={`tel:${LANDLINE_TEL}`}><Icon id="phone" /> {LANDLINE}</a>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container nav-wrap">
          <Link className="brand" to="/" aria-label="BG Venture Properties home">
            <img src="/logo-transparent.png" alt="BG Venture Properties" width="750" height="617" />
          </Link>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="navigation" aria-label="Toggle menu" onClick={() => setMenuOpen((o) => !o)}>
            <Icon id={menuOpen ? 'close' : 'menu'} />
          </button>
          <nav id="navigation" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
            {navLink('/', tr ? L('nav.home') : 'Home')}
            <div className={`has-dd${open === 'buy' ? ' open' : ''}`}>
              <button type="button" className="nav-link nav-dd-toggle" aria-haspopup="menu" aria-expanded={open === 'buy'} onClick={() => setOpen(open === 'buy' ? null : 'buy')}>
                {tr ? L('nav.buy') : 'Buy'} <span className="caret" aria-hidden="true">▾</span>
              </button>
              <CategoryMenu purpose="sale" onPick={() => { setOpen(null); setMenuOpen(false); }} />
            </div>
            <div className={`has-dd${open === 'rent' ? ' open' : ''}`}>
              <button type="button" className="nav-link nav-dd-toggle" aria-haspopup="menu" aria-expanded={open === 'rent'} onClick={() => setOpen(open === 'rent' ? null : 'rent')}>
                {tr ? L('nav.rent') : 'Rent'} <span className="caret" aria-hidden="true">▾</span>
              </button>
              <CategoryMenu purpose="rent" onPick={() => { setOpen(null); setMenuOpen(false); }} />
            </div>
            {navLink('/services/property-management', tr ? L('nav.management') : 'Management')}
            {navLink('/about', tr ? L('nav.about') : 'About')}
            {navLink('/contact', tr ? L('nav.contact') : 'Contact')}
            <div className="lang-toggle" role="group" aria-label="Choose website language">
              {LANGS.map((l, i) => (
                <Fragment key={l.code}>
                  {i > 0 && <i />}
                  <button type="button" className={lang === l.code ? 'lang-active' : ''} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>{l.label}</button>
                </Fragment>
              ))}
            </div>
            <Link className="button button-small" to="/contact" onClick={() => setMenuOpen(false)}>
              {tr ? L('nav.cta') : 'Speak to an expert'} <Icon id="up" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
