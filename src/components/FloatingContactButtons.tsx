// Centralized contact configuration — update these values to change all
// floating buttons, the top bar, and enquiry mailto behaviour in one place.
import type { ReactElement } from 'react';

const CONTACT = {
  email: 'admin@bgventureproperties.ae',
  officePhone: '+97145809629',
  whatsappNumber: '971521543487',
  whatsappMessage:
    "Hello BG Venture Properties, I'm interested in your properties and investment opportunities in Dubai. Could you please provide more information?",
  mapsQuery: 'Regal Tower, Business Bay, Dubai, UAE',
};

interface FloatButton {
  label: string;
  href: string;
  bg: string;
  external?: boolean;
  icon: ReactElement;
}

const phoneIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02z" />
  </svg>
);

const whatsappIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.12-.28-.2-.58-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.83 9.83 0 0 1 9.88 9.89c0 5.45-4.43 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.87 11.87 0 0 0 5.68 1.45c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.48-8.4" />
  </svg>
);

const pinIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
  </svg>
);

const BUTTONS: FloatButton[] = [
  {
    label: 'Call our Dubai office',
    href: `tel:${CONTACT.officePhone}`,
    bg: '#16233a',
    icon: phoneIcon,
  },
  {
    label: 'Chat with us on WhatsApp',
    href: `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`,
    bg: '#1fa855',
    external: true,
    icon: whatsappIcon,
  },
  {
    label: 'Find our office on Google Maps',
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapsQuery)}`,
    bg: '#96793a',
    external: true,
    icon: pinIcon,
  },
];

export default function FloatingContactButtons() {
  return (
    <div className="floating-contact" role="complementary" aria-label="Quick contact options">
      {BUTTONS.map((b) => (
        <a
          key={b.href}
          href={b.href}
          className="float-btn"
          style={{ background: b.bg }}
          aria-label={b.label}
          data-label={b.label}
          {...(b.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {b.icon}
        </a>
      ))}
    </div>
  );
}
