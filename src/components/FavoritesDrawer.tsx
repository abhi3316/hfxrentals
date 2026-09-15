import React from 'react';
import type { RentalListing, SubletListing } from '../types';
import { X, Trash2, Heart } from 'lucide-react';
import '../styles/modal.css';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: (RentalListing | SubletListing)[];
  onRemoveFavorite: (id: string) => void;
  onSelectListing: (item: RentalListing | SubletListing) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectListing
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="favorites-drawer" aria-label="Saved listings drawer">
        <div className="drawer-header">
          <div className="drawer-title">
            <Heart size={20} color="var(--coral-500)" fill="var(--coral-500)" />
            <span>Saved Places ({favorites.length})</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--slate-400)' }}>
              <Heart size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, color: 'var(--slate-300)' }}>No saved listings yet</p>
              <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
                Click the heart icon on any rental or sublet card to save it for easy comparison.
              </p>
            </div>
          ) : (
            favorites.map((item) => {
              const isRental = 'price' in item;
              const price = isRental ? (item as RentalListing).price : (item as SubletListing).subletPrice;

              return (
                <div key={item.id} className="fav-item-row" onClick={() => { onSelectListing(item); onClose(); }}>
                  <img src={item.images[0]} alt={item.title} className="fav-item-thumb" />
                  <div className="fav-item-info">
                    <div className="fav-item-title">{item.title}</div>
                    <div className="fav-item-price">${price.toLocaleString()} CAD/mo</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                      {item.neighborhood}
                    </div>
                  </div>

                  <button
                    className="fav-item-del"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(item.id);
                    }}
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
