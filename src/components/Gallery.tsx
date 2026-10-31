import { useState } from 'react';
import Icon from './Icon';
import { track } from '../lib/api';

export default function Gallery({ images, title, propertyRef }: { images: string[]; title: string; propertyRef: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return <div className="gallery-empty"><Icon id="building" /><span>Photos coming soon</span></div>;
  }
  const idx = Math.min(active, images.length - 1);
  const go = (d: number) => { setActive((idx + d + images.length) % images.length); track('property_gallery_interaction', propertyRef); };
  let touchX = 0;

  return (
    <div className="gallery">
      <div className="gallery-stage"
        onTouchStart={(e) => { touchX = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = touchX - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1); }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); } }}
        tabIndex={0} role="group" aria-roledescription="slide" aria-label={`Photo ${idx + 1} of ${images.length}`}>
        <img src={images[idx]} alt={`${title} — photo ${idx + 1}`} draggable={false} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button key={src + i} type="button" className={i === idx ? 'active' : ''} aria-label={`Photo ${i + 1}`} onClick={() => setActive(i)}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
