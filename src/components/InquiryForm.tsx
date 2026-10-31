// Inquiry form — opens a pre-filled draft in the visitor's own email app
// (mailto) so the message is sent from their address, and also logs the
// inquiry server-side via /api/inquiries so no lead is lost.
import { useState } from 'react';
import Icon from './Icon';
import { postInquiry } from '../lib/api';
import { EMAIL, INQUIRY_TYPES, MOBILE_TEL, WHATSAPP } from '../lib/content';

interface Props {
  defaultType?: string;
  propertyRef?: string;
  propertyTitle?: string;
  heading?: string;
  compact?: boolean;
}

export default function InquiryForm({ defaultType = 'general', propertyRef, propertyTitle, heading = 'How can we help you?', compact }: Props) {
  const [state, setState] = useState<'idle' | 'done'>('idle');
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const typeLabel = INQUIRY_TYPES.find((t) => t.value === v('type'))?.label ?? 'General enquiry';

    // Log the inquiry server-side first — if the visitor never sends the
    // draft, the lead still reaches the team.
    postInquiry({
      name: v('name'), email: v('email'), phone: v('phone'),
      type: v('type'), message: v('message'),
      consent: d.get('consent') === 'on',
      property_ref: propertyRef ?? null,
    }).catch(() => { /* email draft is the primary channel — ignore logging errors */ });

    const subject = propertyRef
      ? `Property inquiry ${propertyRef} — ${typeLabel}`
      : `Website inquiry: ${typeLabel}`;
    const body = [
      'Hello BG Venture Properties,', '', v('message'), '',
      `Name: ${v('name')}`,
      `Email: ${v('email')}`,
      `Phone: ${v('phone')}`,
      `I'm interested in: ${typeLabel}`,
      propertyRef ? `Property reference: ${propertyRef}` : null,
      propertyTitle ? `Property: ${propertyTitle}` : null,
      `Sent from: ${location.href}`,
    ].filter((l): l is string => l != null).join('\r\n');

    setDraft({ subject, body });
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setState('done');
  };

  if (state === 'done') {
    const gmail = draft ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}` : '#';
    const mailto = draft ? `mailto:${EMAIL}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}` : `mailto:${EMAIL}`;
    return (
      <div className="inquiry-done" role="status">
        <span className="inquiry-done-icon"><Icon id="mail" /></span>
        <h3>Your email draft is ready</h3>
        <p>We've opened a draft in your email app addressed to <strong>{EMAIL}</strong> with everything you entered — just press <strong>Send</strong> to deliver it. A copy was also logged for our team.</p>
        <p className="inquiry-done-alt">
          Nothing opened? <a href={gmail} target="_blank" rel="noopener noreferrer">Open the draft in Gmail</a> or <a href={mailto}>try your email app again</a> — or reach us on <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> / <a href={`tel:${MOBILE_TEL}`}>+971 52 154 3487</a>.
        </p>
      </div>
    );
  }

  return (
    <form className={`inquiry-form${compact ? ' compact' : ''}`} onSubmit={onSubmit} noValidate={false}>
      <h3>{heading}</h3>
      <div className="form-row">
        <div>
          <label htmlFor={`${propertyRef ?? 'g'}-name`}>Full name <span>*</span></label>
          <input id={`${propertyRef ?? 'g'}-name`} name="name" autoComplete="name" required maxLength={120} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor={`${propertyRef ?? 'g'}-email`}>Email address <span>*</span></label>
          <input id={`${propertyRef ?? 'g'}-email`} name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label htmlFor={`${propertyRef ?? 'g'}-phone`}>Phone number <span>*</span></label>
          <input id={`${propertyRef ?? 'g'}-phone`} name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="+971 5X XXX XXXX" />
        </div>
        <div>
          <label htmlFor={`${propertyRef ?? 'g'}-type`}>I'm interested in <span>*</span></label>
          <select id={`${propertyRef ?? 'g'}-type`} name="type" required defaultValue={defaultType}>
            {INQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <label htmlFor={`${propertyRef ?? 'g'}-msg`}>Message <span>*</span></label>
      <textarea id={`${propertyRef ?? 'g'}-msg`} name="message" rows={compact ? 3 : 4} required maxLength={2000}
        defaultValue={propertyRef ? `I'm interested in ${propertyRef}${propertyTitle ? ` — ${propertyTitle}` : ''}. Please contact me with more details.` : ''}
        placeholder="Tell us about your requirements…" />
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>I consent to BG Venture Properties contacting me about this inquiry. <em>*</em></span>
      </label>
      <button className="button" type="submit">
        Send inquiry <Icon id="arrow" />
      </button>
      <p className="form-disclosure">Clicking Send opens a draft in your email app — your inquiry is delivered when you send that email. A copy is also logged for our team. Please do not include identity documents or financial account details.</p>
    </form>
  );
}
