import React from 'react';
import type { RentalListing } from '../types';
import { Heart, MapPin, Bed, Bath, Flame, Car, ShieldCheck, Bus, Sparkles, MessageCircle, Edit3, Trash2 } from 'lucide-react';
import '../styles/listings.css';

interface RentalCardProps {
  listing: RentalListing;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: RentalListing) => void;
  onScheduleViewing: (listing: RentalListing) => void;
  onOpenChat?: (listing: RentalListing) => void;
  onEditListing?: (listing: RentalListing) => void;
  onDeleteListing?: (listingId: string) => void;
  isOwner?: boolean;
}

export const RentalCard: React.FC<RentalCardProps> = ({
  listing,
  isFavorited,
  onToggleFavorite,
  onSelectListing,
  onScheduleViewing,
  onOpenChat,
  onEditListing,
  onDeleteListing,
  isOwner = false
}) => {
  return (
    <article className={`listing-card ${listing.isFeaturedBoost ? 'featured-boost' : ''}`}>
      {/* Media Header */}
      <div className="card-media-wrapper" onClick={() => onSelectListing(listing)}>
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="card-image"
          loading="lazy"
        />

        <div className="card-top-badges">
          <div className="card-badges-left">
            {listing.isFeaturedBoost && (
              <span className="badge badge-amber">
                <Sparkles size={12} />
                Featured
              </span>
            )}
            {listing.isVerifiedLandlord && (
              <span className="badge badge-teal">
                <ShieldCheck size={12} />
                {listing.landlord?.name ? `Verified • ${listing.landlord.name}` : 'Verified Landlord'}
              </span>
            )}
            {isOwner && (
              <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                Your Listing
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
                  onEditListing(listing);
                }}
                title="Edit this listing"
                aria-label="Edit listing"
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
                  onDeleteListing(listing.id);
                }}
                title="Delete this listing"
                aria-label="Delete listing"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              className={`card-fav-btn ${isFavorited ? 'is-favorited' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id);
              }}
              aria-label={isFavorited ? 'Remove from saved' : 'Save listing'}
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="card-price-overlay">
          <span className="card-price-amount">${listing.price.toLocaleString()}</span>
          <span className="card-price-period">CAD / month</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body">
        <div className="card-location">
          <MapPin size={13} />
          <span>{listing.neighborhood} • {listing.propertyType}</span>
        </div>

        <h3 className="card-title" onClick={() => onSelectListing(listing)} style={{ cursor: 'pointer' }}>
          {listing.title}
        </h3>

        <div className="card-specs-row">
          <div className="card-spec-item">
            <Bed size={15} />
            <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} Bed`}</span>
          </div>
          <div className="card-spec-item">
            <Bath size={15} />
            <span>{listing.bathrooms} Bath</span>
          </div>
          {listing.sqft && (
            <div className="card-spec-item">
              <span>{listing.sqft} sqft</span>
            </div>
          )}
        </div>

        {/* Halifax Specific Value Indicators */}
        <div className="hfx-chips-list">
          <div className="hfx-chip-row">
            <span className="hfx-chip-key">
              <Flame size={13} />
              Heating:
            </span>
            <span className={`hfx-chip-val ${listing.heatingType.includes('Included') ? 'highlight-green' : ''}`}>
              {listing.heatingType} (~${listing.estimatedWinterUtilities}/mo)
            </span>
          </div>

          <div className="hfx-chip-row">
            <span className="hfx-chip-key">
              <Car size={13} />
              Winter Parking:
            </span>
            <span className={`hfx-chip-val ${listing.winterParking.includes('Underground') || listing.winterParking.includes('Driveway') ? 'highlight-blue' : 'highlight-amber'}`}>
              {listing.winterParking}
            </span>
          </div>
        </div>

        {/* Campus Commute Pill */}
        <div className="campus-commute-pill">
          <Bus size={13} />
          <span>
            🚌 Dal Studley: {listing.transitTimes.dalStudley}m • SMU: {listing.transitTimes.smu}m • DT: {listing.transitTimes.dalSexton}m
          </span>
        </div>

        {/* Card Footer */}
        <div className="card-footer" style={{ gap: 8 }}>
          <div className="lister-info" style={{ flex: 1 }}>
            <img
              src={listing.landlord.avatar}
              alt={listing.landlord.name}
              className="lister-avatar"
            />
            <div>
              <div className="lister-name">{listing.landlord.name}</div>
              <div className="lister-sub">{listing.landlord.responseRate} response</div>
            </div>
          </div>

          {onOpenChat && (
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(listing);
              }}
              title="Chat with landlord"
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
              onScheduleViewing(listing);
            }}
            title="Book a viewing synced to Google Calendar"
          >
            📅 View
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onSelectListing(listing)}
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
};
