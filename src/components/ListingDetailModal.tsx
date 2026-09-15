import React, { useState } from 'react';
import type { RentalListing, SubletListing } from '../types';
import { X, MapPin, Flame, Bus, Send, CheckCircle2, MessageCircle, Edit3, Trash2, ShieldCheck } from 'lucide-react';
import '../styles/modal.css';

interface ListingDetailModalProps {
  listing: RentalListing | SubletListing;
  onClose: () => void;
  onOpenScamShield: () => void;
  onOpenViewingScheduler: (listing: RentalListing | SubletListing) => void;
  onOpenChat: (listing: RentalListing | SubletListing) => void;
  onEditListing?: (listing: RentalListing | SubletListing) => void;
  onDeleteListing?: (listingId: string) => void;
  isOwner?: boolean;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onOpenScamShield,
  onOpenViewingScheduler,
  onOpenChat,
  onEditListing,
  onDeleteListing,
  isOwner = false
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('Hi! I saw your listing on HfxRentals and would love to schedule an in-person or video viewing.');
  const [inquirySent, setInquirySent] = useState(false);

  const isRental = 'price' in listing;
  const price = isRental ? (listing as RentalListing).price : (listing as SubletListing).subletPrice;
  const winterUtil = isRental ? (listing as RentalListing).estimatedWinterUtilities : 0;
  const trueCost = price + winterUtil;

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Gallery Hero */}
        <div className="modal-gallery-hero">
          <img
            src={listing.images?.[activeImageIdx] || listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'}
            alt={listing.title || 'Listing'}
            className="modal-main-image"
          />

          {(listing.images || []).length > 1 && (
            <div className="modal-thumbnails-strip">
              {(listing.images || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`modal-thumbnail ${idx === activeImageIdx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="modal-body-content">
          <div className="modal-header-row">
            <div>
              <div className="modal-address">
                <MapPin size={15} />
                <span>{listing.address} • {listing.neighborhood}</span>
              </div>
              <h2 className="modal-title">{listing.title}</h2>
            </div>

            <div className="modal-price-box">
              <div className="modal-price-val">${(price || 0).toLocaleString()}</div>
              <div className="modal-price-sub">CAD / month</div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 10, padding: '10px 14px', fontSize: '0.85rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => {
                  onClose();
                  onOpenChat(listing);
                }}
              >
                <MessageCircle size={16} />
                Chat with {isRental ? 'Landlord' : 'Lister'}
              </button>

              <button
                className="btn btn-secondary"
                style={{ marginTop: 8, padding: '8px 14px', fontSize: '0.82rem', width: '100%' }}
                onClick={() => onOpenViewingScheduler(listing)}
              >
                📅 Schedule Viewing
              </button>

              {isOwner && onEditListing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.78rem', color: 'var(--amber-400)', borderColor: 'rgba(244, 162, 97, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    onClick={() => {
                      onClose();
                      onEditListing(listing);
                    }}
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>

                  {onDeleteListing && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      onClick={() => {
                        onClose();
                        onDeleteListing(listing.id);
                      }}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Halifax True Cost of Rent Box */}
          {isRental && (
            <div className="true-cost-box">
              <div className="true-cost-title">
                <Flame size={18} />
                <span>Halifax True Cost Breakdown (Winter Heating & Utilities)</span>
              </div>
              <div className="true-cost-grid">
                <div className="true-cost-item">
                  <div className="true-cost-label">Base Monthly Rent</div>
                  <div className="true-cost-num">${price || 0}</div>
                </div>
                <div className="true-cost-item">
                  <div className="true-cost-label">Est. Winter Utilities</div>
                  <div className="true-cost-num">
                    +${(listing as RentalListing).estimatedWinterUtilities || 50}/mo
                  </div>
                </div>
                <div className="true-cost-item" style={{ background: 'rgba(0, 168, 150, 0.15)' }}>
                  <div className="true-cost-label" style={{ color: 'var(--teal-400)' }}>
                    Effective Winter Rent
                  </div>
                  <div className="true-cost-num" style={{ color: 'var(--teal-400)' }}>
                    ${trueCost || 0}/mo
                  </div>
                </div>
                <div className="true-cost-item">
                  <div className="true-cost-label">HRM Winter Parking</div>
                  <div className="true-cost-num" style={{ fontSize: '0.95rem' }}>
                    {(listing as RentalListing).winterParking || 'Assigned Driveway'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campus Commute Breakdown */}
          <div className="campus-commute-table-box">
            <div className="campus-table-title">
              <Bus size={18} />
              <span>Campus & Downtown Commute Times (Halifax Transit & Walking)</span>
            </div>
            <div className="campus-badges-row">
              <span className="campus-commute-tag">
                Dalhousie Studley: <strong>{listing.transitTimes?.dalStudley || 12} mins</strong>
              </span>
              <span className="campus-commute-tag">
                Dalhousie Sexton: <strong>{listing.transitTimes?.dalSexton || 15} mins</strong>
              </span>
              <span className="campus-commute-tag">
                Saint Mary's (SMU): <strong>{listing.transitTimes?.smu || 14} mins</strong>
              </span>
              <span className="campus-commute-tag">
                MSVU (Bedford Hwy): <strong>{listing.transitTimes?.msvu || 24} mins</strong>
              </span>
              <span className="campus-commute-tag">
                NSCC Ivany: <strong>{listing.transitTimes?.nscc || 28} mins</strong>
              </span>
              {listing.transitTimes?.ferryTerminal && (
                <span className="campus-commute-tag" style={{ borderColor: 'var(--teal-500)' }}>
                  Alderney / Woodside Ferry: <strong>{listing.transitTimes.ferryTerminal} mins</strong>
                </span>
              )}
            </div>
          </div>

          {/* Specs & Description */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: 8 }}>About this Home</h4>
            <p style={{ color: 'var(--slate-300)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              {listing.description || 'No description provided.'}
            </p>
          </div>

          {/* Amenities or Furnished checklist */}
          {isRental ? (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Key Amenities</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {((listing as RentalListing).amenities || []).map((a, i) => (
                  <span key={i} className="badge badge-blue">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Furniture & Inclusions</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {((listing as SubletListing).furnitureIncluded || []).map((f, i) => (
                  <span key={i} className="badge badge-teal">
                    🛏️ {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Remote Student Scam Shield Upsell Banner */}
          <div
            style={{
              background: 'rgba(244, 162, 97, 0.12)',
              border: '1px solid rgba(244, 162, 97, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 24
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--amber-500)', fontSize: '0.95rem' }}>
                🛡️ Remote Renter or International Student?
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-300)', marginTop: 2 }}>
                Can't attend in person? Have an on-campus Dal/SMU ambassador do a 15-min physical inspection before you transfer any deposit.
              </div>
            </div>
            <button
              className="btn btn-accent"
              style={{ fontSize: '0.8rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
              onClick={() => {
                onClose();
                onOpenScamShield();
              }}
            >
              Book Inspection ($69)
            </button>
          </div>

          {/* Landlord / Lister Profile Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'var(--navy-800)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              marginBottom: 20
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={isRental ? (listing as RentalListing).landlord.avatar : (listing as SubletListing).lister.avatar}
                alt={isRental ? (listing as RentalListing).landlord.name : (listing as SubletListing).lister.name}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--teal-500)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {isRental ? (listing as RentalListing).landlord.name : (listing as SubletListing).lister.name}
                  </h4>
                  <span className="badge badge-teal" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    <ShieldCheck size={11} /> Verified {isRental ? 'Landlord' : 'Student'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: 3 }}>
                  {isRental
                    ? `Verified Landlord • ${(listing as RentalListing).landlord.responseRate} response`
                    : `${(listing as SubletListing).lister.university} Student • ${(listing as SubletListing).lister.major}`}
                </div>
              </div>
            </div>
            {isOwner && (
              <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                Your Profile
              </span>
            )}
          </div>

          {/* Contact / Inquiry Box */}
          <div className="inquiry-box">
            <h4 className="inquiry-title">
              Message {isRental ? (listing as RentalListing).landlord.name : (listing as SubletListing).lister.name}
            </h4>

            {inquirySent ? (
              <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0, 168, 150, 0.15)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={36} color="var(--teal-400)" style={{ margin: '0 auto 8px auto' }} />
                <h5 style={{ fontSize: '1.1rem', color: '#ffffff' }}>Inquiry Sent Successfully!</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-300)', marginTop: 4 }}>
                  The lister has been notified via their verified contact. You will receive replies in your email inbox.
                </p>
              </div>
            ) : (
              <form className="inquiry-form" onSubmit={handleSubmitInquiry}>
                <div className="form-row-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your message..."
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                    🔒 Direct connection • No spam guarantee
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                      onClick={() => {
                        onClose();
                        onOpenChat(listing);
                      }}
                    >
                      <MessageCircle size={15} color="var(--teal-400)" />
                      Open Live Chat
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Send size={15} />
                      Send Inquiry
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
