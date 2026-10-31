import Icon from './Icon';
import { Link } from '../lib/router';
import { bedLabel, formatArea, track, type Property } from '../lib/api';

export default function PropertyCard({ p }: { p: Property }) {
  const specs = [
    p.bedrooms != null && { icon: 'bed' as const, label: bedLabel(p.bedrooms) },
    p.bathrooms != null && { icon: 'bath' as const, label: `${p.bathrooms} Bath` },
    p.size_sqft != null && { icon: 'size' as const, label: formatArea(p).split(' · ')[0] },
  ].filter(Boolean) as { icon: 'bed' | 'bath' | 'size'; label: string }[];

  return (
    <Link className="prop-card" to={`/property/${p.slug}`} onClick={() => track('property_card_click', p.ref)}>
      <div className="prop-card-media">
        {p.images[0]
          ? <img src={p.images[0]} alt={p.title} loading="lazy" width="800" height="533" />
          : <div className="prop-card-nophoto"><Icon id="building" /><span>{p.location}</span></div>}
        <div className="prop-card-badges">
          <span className={`badge ${p.purpose === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
            {p.off_plan ? 'Off-Plan' : p.purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {p.featured && <span className="badge badge-featured"><Icon id="star" /> Featured</span>}
        </div>
      </div>
      <div className="prop-card-body">
        <h3>{p.title}</h3>
        <p className="prop-card-loc"><Icon id="pin" />{[p.building, p.location].filter(Boolean).join(', ') || 'Dubai'}</p>
        {specs.length > 0 && (
          <ul className="prop-card-specs">
            {specs.map((s) => <li key={s.icon}><Icon id={s.icon} />{s.label}</li>)}
          </ul>
        )}
        <p className="prop-card-ref"><span>{p.type_label}</span><span>Ref {p.ref}</span></p>
      </div>
    </Link>
  );
}
