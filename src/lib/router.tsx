// Minimal history router — real URLs for SEO, no dependency.
// The Express server serves index.html for all non-API paths.
import { useEffect, useState, type MouseEvent, type AnchorHTMLAttributes, type ReactNode } from 'react';

export function navigate(to: string, { replace = false } = {}) {
  const url = to.startsWith('/') ? to : `/${to}`;
  if (url === location.pathname + location.search) return;
  (replace ? history.replaceState : history.pushState).call(history, {}, '', url);
  dispatchEvent(new PopStateEvent('popstate'));
}

export function useRoute() {
  const [, tick] = useState(0);
  useEffect(() => {
    const on = () => { tick((x) => x + 1); scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); };
    addEventListener('popstate', on);
    return () => removeEventListener('popstate', on);
  }, []);
  return { path: location.pathname, query: new URLSearchParams(location.search) };
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={go} {...rest}>{children}</a>;
}
