import React from 'react';
import type { SubletListing } from '../types';
import { Heart, MapPin, Calendar, Check, GraduationCap, Sparkles, MessageCircle, Edit3, Trash2 } from 'lucide-react';
import '../styles/listings.css';

interface SubletCardProps {
  sublet: SubletListing;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectSublet: (sublet: SubletListing) => void;
  onScheduleViewing: (sublet: SubletListing) => void;
  onOpenChat?: (sublet: SubletListing) => void;
  onEditListing?: (sublet: SubletListing) => void;
  onDeleteListing?: (listingId: string) => void;
  isOwner?: boolean;
}

export const SubletCard: React.FC<SubletCardProps> = ({
  sublet,
  isFavorited,
  onToggleFavorite,
  onSelectSublet,
  onScheduleViewing,
  onOpenChat,
  onEditListing,
  onDeleteListing,
  isOwner = false
}) => {
  const discountPercent = Math.round(
    ((sublet.originalRent - sublet.subletPrice) / sublet.originalRent) * 100
  );

  return (
    <article className={`listing-card ${sublet.isUrgentBoost ? 'featured-boost' : ''}`}>
      {/* Media Header */}
      <div className="card-media-wrapper" onClick={() => onSelectSublet(sublet)}>
        <img
          src={sublet.images[0]}
          alt={sublet.title}
          className="card-image"
          loading="lazy"
        />

        <div className="card-top-badges">
          <div className="card-badges-left">
            {sublet.isUrgentBoost && (
              <span className="badge badge-amber">
                <Sparkles size={12} />
                Urgent Sublet
              </span>
            )}
            {sublet.isStudentVerified && (
              <span className="badge badge-teal">
                <GraduationCap size={12} />
                {sublet.studentAffiliation} Student
              </span>
            )}
            {isOwner && (
              <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                Your Sublet
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOwner && onEditListing && (
              <button
                className="card-fav-btn"
                style={{ background: 'rgba(7, 19, 33, 0.85)', color: 'var(--amber-400)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditListing(sublet);
                }}
                title="Edit this sublet"
                aria-label="Edit sublet"
              >
                <Edit3 size={16} />
              </button>
            )}

            {isOwner && onDeleteListing && (
              <button
                className="card-fav-btn"
                style={{ background: 'rgba(7, 19, 33, 0.85)', color: '#ef4444' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteListing(sublet.id);
                }}
                title="Delete this sublet"
                aria-label="Delete sublet"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              className={`card-fav-btn ${isFavorited ? 'is-favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(sublet.id);
              }}
              aria-label={isFavorited ? 'Remove from saved' : 'Save sublet'}
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="card-price-overlay">
          <span className="card-price-amount">${sublet.subletPrice.toLocaleString()}</span>
          <span className="card-price-period">CAD / month</span>
          {discountPercent > 0 && (
            <span className="sublet-discount-badge">
              Save {discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body">
        <div className="card-location">
          <MapPin size={13} />
          <span>{sublet.neighborhood} • {sublet.subletScope}</span>
        </div>

        <h3 className="card-title" onClick={() => onSelectSublet(sublet)} style={{ cursor: 'pointer' }}>
          {sublet.title}
        </h3>

        {/* Term Banner */}
        <div className="sublet-term-banner">
          <Calendar size={14} />
          <span>Term: {sublet.term} ({sublet.startDate} to {sublet.endDate})</span>
        </div>

        {/* Furnished items checklist */}
        {sublet.isFurnished && (
          <div className="furnished-items-list">
            {sublet.furnitureIncluded.slice(0, 3).map((item, idx) => (
              <span key={idx} className="furnished-item-tag">
                <Check size={11} style={{ display: 'inline', marginRight: 3, color: 'var(--teal-400)' }} />
                {item}
              </span>
            ))}
            {sublet.furnitureIncluded.length > 3 && (
              <span className="furnished-item-tag">+{sublet.furnitureIncluded.length - 3} more</span>
            )}
          </div>
        )}

        <div className="hfx-chips-list">
          <div className="hfx-chip-row">
            <span className="hfx-chip-key">Rent Comparison:</span>
            <span className="hfx-chip-val">
              <span style={{ textDecoration: 'line-through', color: 'var(--slate-500)', marginRight: 6 }}>
                ${sublet.originalRent}
              </span>
              <strong style={{ color: 'var(--teal-400)' }}>${sublet.subletPrice}</strong>
            </span>
          </div>

          <div className="hfx-chip-row">
            <span className="hfx-chip-key">Utilities & Wi-Fi:</span>
            <span className="hfx-chip-val highlight-green">
              {sublet.utilitiesIncluded && sublet.wifiIncluded ? 'All Included in Sublet' : 'Split by flat'}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="card-footer" style={{ gap: 8 }}>
          <div className="lister-info" style={{ flex: 1 }}>
            <img
              src={sublet.lister.avatar}
              alt={sublet.lister.name}
              className="lister-avatar"
            />
            <div>
              <div className="lister-name">{sublet.lister.name}</div>
              <div className="lister-sub">{sublet.lister.major || sublet.lister.university}</div>
            </div>
          </div>

          {onOpenChat && (
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(sublet);
              }}
              title="Chat with student lister"
            >
              <MessageCircle size={14} color="var(--teal-400)" />
              <span>Chat</span>
            </button>
          )}

          <button
            className="btn btn-primary"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onScheduleViewing(sublet);
            }}
            title="Book a viewing synced to Google Calendar"
          >
            📅 View
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onSelectSublet(sublet)}
          >
            Info
          </button>
        </div>
      </div>
    </article>
  );
};
