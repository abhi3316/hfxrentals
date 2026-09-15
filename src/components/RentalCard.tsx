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
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'}
          alt={listing.title || 'Halifax Rental'}
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
          <span className="card-price-amount">${(listing.price || 0).toLocaleString()}</span>
          <span className="card-price-period">CAD / month</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body">
        <div className="card-location">
          <MapPin size={13} />
          <span>{listing.neighborhood || 'Halifax'} • {listing.propertyType || 'Apartment'}</span>
        </div>

        <h3 className="card-title" onClick={() => onSelectListing(listing)} style={{ cursor: 'pointer' }}>
          {listing.title || 'Halifax Rental Unit'}
        </h3>

        <div className="card-specs-row">
          <div className="card-spec-item">
            <Bed size={15} />
            <span>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms || 1} Bed`}</span>
          </div>
          <div className="card-spec-item">
            <Bath size={15} />
            <span>{listing.bathrooms || 1} Bath</span>
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
            <span className={`hfx-chip-val ${(listing.heatingType || '').includes('Included') ? 'highlight-green' : ''}`}>
              {listing.heatingType || 'Electric Baseboard'} (~${listing.estimatedWinterUtilities || 50}/mo)
            </span>
          </div>

          <div className="hfx-chip-row">
            <span className="hfx-chip-key">
              <Car size={13} />
              Winter Parking:
            </span>
            <span className={`hfx-chip-val ${(listing.winterParking || '').includes('Underground') || (listing.winterParking || '').includes('Driveway') ? 'highlight-blue' : 'highlight-amber'}`}>
              {listing.winterParking || 'Street Permit Only'}
            </span>
          </div>
        </div>

        {/* Campus Commute Pill */}
        <div className="campus-commute-pill">
          <Bus size={13} />
          <span>
            🚌 Dal Studley: {listing.transitTimes?.dalStudley || 12}m • SMU: {listing.transitTimes?.smu || 15}m • DT: {listing.transitTimes?.dalSexton || 15}m
          </span>
        </div>

        {/* Card Footer */}
        <div className="card-footer" style={{ gap: 8 }}>
          <div className="lister-info" style={{ flex: 1 }}>
            <img
              src={listing.landlord?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={listing.landlord?.name || 'Landlord'}
              className="lister-avatar"
            />
            <div>
              <div className="lister-name">{listing.landlord?.name || 'Halifax Landlord'}</div>
              <div className="lister-sub">{listing.landlord?.responseRate || 'Under 1 hour'} response</div>
            </div>
          </div>

          {onOpenChat && (
            <button
              className={`btn ${isOwner ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(listing);
              }}
              title={isOwner ? 'View prospective tenant inquiries' : 'Chat with landlord'}
            >
              <MessageCircle size={14} color={isOwner ? '#071321' : 'var(--teal-400)'} />
              <span>{isOwner ? 'Inquiries' : 'Chat'}</span>
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
