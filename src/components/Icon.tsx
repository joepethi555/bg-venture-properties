import type { ReactNode } from 'react';

export type IconId =
  | 'arrow' | 'up' | 'invest' | 'home' | 'office' | 'key'
  | 'shield' | 'globe' | 'pin' | 'phone' | 'mail' | 'check' | 'search'
  | 'bed' | 'bath' | 'size' | 'filter' | 'close' | 'menu' | 'building'
  | 'calendar' | 'tag' | 'user' | 'star' | 'whatsapp' | 'left';

const PATHS: Record<IconId, ReactNode> = {
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  up: <path d="M6 18 18 6M6 6h12v12" />,
  invest: <path d="M3 20h18M6 16v-5m6 5V8m6 8V4M4 8l6-5 5 2 5-3" />,
  home: <path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" />,
  office: <path d="M4 21V3h12v18m0-12h4v12M2 21h20M8 7h4m-4 4h4m-4 4h4m-4 6v-3h4v3" />,
  key: <><circle cx="8" cy="9" r="5" /><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3" /></>,
  shield: <><path d="m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5l8-3Z" /><path d="m8 11 3 3 5-6" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20M4 6h16M4 18h16" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  phone: <path d="m5 3 4 1 1 5-3 2c2 3 3 4 6 6l2-3 5 1 1 4c0 5-9 2-14-3S0 3 5 3Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></>,
  bed: <><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" /><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M12 4v6" /><path d="M2 17h20" /></>,
  bath: <><path d="M2 12h20" /><path d="M4 12v2a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6v-2" /><path d="M6 12V6a2 2 0 0 1 4 0" /><path d="m7 21-1 1m11-1 1 1" /></>,
  size: <><path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0l-11.2 11.2a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4Z" /><path d="m7.5 10.5 2 2m1-5 2 2m1-5 2 2" /></>,
  filter: <path d="M4 5h16l-6.5 7.5v5.5L10 20v-7.5L4 5Z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  building: <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M16 9h3a1 1 0 0 1 1 1v11" /><path d="M2 21h20" /><path d="M8 7h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4m8-4v4M3 11h18" /></>,
  tag: <><path d="m3 12 9-9 9 9-9 9-9-9Z" transform="rotate(90 12 12)" /><circle cx="8.5" cy="8.5" r="1.5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  star: <path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9L12 3Z" />,
  left: <path d="M20 12H5m6 6-6-6 6-6" />,
  whatsapp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5 13.5c-.2.6-1.2 1.1-1.7 1.2-.5 0-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4s.8 1.9.8 2c0 .1.1.3 0 .5-.4.8-.8.9-.6 1.3.9 1.5 2 2.4 3.4 3 .4.2.6.1.8-.1l1-1.1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.3.6.4 0 .1 0 .6-.4 1.1Z" />,
};

export default function Icon({ id, hidden = true }: { id: IconId; hidden?: boolean }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden={hidden}>
      {PATHS[id]}
    </svg>
  );
}
