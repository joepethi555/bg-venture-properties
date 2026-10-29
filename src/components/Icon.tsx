import type { ReactNode } from 'react';

export type IconId =
  | 'arrow' | 'up' | 'invest' | 'home' | 'office' | 'key'
  | 'shield' | 'globe' | 'pin' | 'phone' | 'mail' | 'check';

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
};

export default function Icon({ id, hidden = true }: { id: IconId; hidden?: boolean }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden={hidden}>
      {PATHS[id]}
    </svg>
  );
}
