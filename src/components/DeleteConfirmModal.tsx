import React from 'react';
import type { RentalListing, SubletListing } from '../types';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import '../styles/modal.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  listing: RentalListing | SubletListing | null;
  onClose: () => void;
  onConfirm: (listingId: string) => Promise<void> | void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  listing,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  if (!isOpen || !listing) return null;

  const isRental = 'price' in listing;
  const priceDisplay = isRental
    ? `$${(listing as RentalListing).price}/mo`
    : `$${(listing as SubletListing).subletPrice}/mo`;

  const coverImage = listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80';

  const handleConfirm = () => {
    if (isDeleting) return;
    onConfirm(listing.id);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="modal-content delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480, padding: 0, overflow: 'hidden' }}
      >
        {/* Header Alert Strip */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          position: 'relative'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            flexShrink: 0
          }}>
            <AlertTriangle size={22} />
          </div>

          <div>
            <h3 id="delete-modal-title" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Delete Listing?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(254, 202, 202, 0.9)', margin: '2px 0 0 0' }}>
              This action is permanent and cannot be undone.
            </p>
          </div>

          <button
            className="modal-close-btn"
            style={{ top: 14, right: 14 }}
            onClick={onClose}
            aria-label="Close delete confirmation"
            disabled={isDeleting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px 24px' }}>
          {/* Target Listing Summary Card */}
          <div style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            background: 'rgba(7, 19, 33, 0.6)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            marginBottom: 16
          }}>
            <img
              src={coverImage}
              alt={listing.title}
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontSize: '0.95rem',
                color: '#ffffff',
                margin: '0 0 4px 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {listing.title}
              </h4>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--slate-400)',
                margin: '0 0 4px 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {listing.address || `${listing.neighborhood}, Halifax`}
              </p>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--teal-400)' }}>
                {priceDisplay}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--slate-300)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            Are you sure you want to permanently remove <strong>"{listing.title}"</strong>?
          </p>

          <ul style={{
            fontSize: '0.82rem',
            color: 'var(--slate-400)',
            margin: '0 0 20px 0',
            paddingLeft: 20,
            lineHeight: 1.6
          }}>
            <li>The listing will be immediately deleted from Halifax search results.</li>
            <li>All associated property photos will be purged from cloud storage.</li>
            <li>All prospective tenant inquiries and viewing requests will be closed.</li>
          </ul>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isDeleting}
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
            >
              Keep Listing
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleConfirm}
              disabled={isDeleting}
              aria-label="Confirm delete listing"
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: '1px solid #dc2626',
                padding: '9px 18px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Yes, Delete Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
