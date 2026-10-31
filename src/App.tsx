import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingContactButtons from './components/FloatingContactButtons';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import PropertyDetail from './pages/PropertyDetail';
import Management from './pages/Management';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { useRoute, navigate } from './lib/router';
import { CATEGORIES } from './lib/content';
import type { Lang } from './i18n';

const TITLES: [RegExp, string][] = [
  [/^\/$/, 'BG Venture Properties | Dubai Real Estate — Buy, Sell, Rent & Manage'],
  [/^\/buy/, 'Properties for Sale in Dubai | BG Venture Properties'],
  [/^\/rent/, 'Properties for Rent in Dubai | BG Venture Properties'],
  [/^\/services\/property-management/, 'Property Management Services Dubai | BG Venture Properties'],
  [/^\/about/, 'About BG Venture Properties | Dubai Real Estate Brokerage'],
  [/^\/contact/, 'Contact Us | BG Venture Properties, Business Bay Dubai'],
];

// Redirect legacy hash routes (#/property/5, #contact, #/search?...) to real URLs.
function legacyRedirect() {
  const h = location.hash;
  if (!h) return false;
  if (h.startsWith('#/property/')) { navigate(`/property/${h.slice('#/property/'.length).split('?')[0]}`, { replace: true }); return true; }
  if (h.startsWith('#/search')) { navigate('/buy', { replace: true }); return true; }
  if (h.startsWith('#/')) { navigate('/', { replace: true }); return true; }
  if (h === '#contact') { navigate('/contact', { replace: true }); return true; }
  if (h.startsWith('#')) { navigate('/', { replace: true }); return true; }
  return false;
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const { path, query } = useRoute();

  useEffect(() => { legacyRedirect(); }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (path.startsWith('/property/')) return; // detail page sets its own title
    const t = TITLES.find(([re]) => re.test(path));
    document.title = t ? t[1] : 'BG Venture Properties | Dubai Real Estate';
  }, [path]);

  let page: React.ReactNode;
  const m = path.match(/^\/(buy|rent)(?:\/([a-z-]+))?\/?$/);
  if (path === '/') page = <Home lang={lang} />;
  else if (m) {
    const cat = m[2] ?? '';
    page = cat && !CATEGORIES.some((c) => c.key === cat)
      ? <NotFound />
      : <Marketplace purpose={m[1] === 'buy' ? 'sale' : 'rent'} category={cat} query={query} key={`${m[1]}/${cat}?${query}`} />;
  }
  else if (path.startsWith('/property/')) page = <PropertyDetail id={decodeURIComponent(path.slice('/property/'.length))} key={path} />;
  else if (path === '/services/property-management') page = <Management lang={lang} />;
  else if (path === '/about') page = <About lang={lang} />;
  else if (path === '/contact') page = <Contact lang={lang} />;
  else page = <NotFound />;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <FloatingContactButtons />
      <Header lang={lang} setLang={setLang} />
      <div id="main">{page}</div>
      <Footer />
    </>
  );
}
