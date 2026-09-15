import React, { useState } from 'react';
import type { RentalListing, SubletListing, HalifaxNeighborhood, HeatingType, WinterParkingStatus, LeaseType } from '../types';
import { HALIFAX_NEIGHBORHOODS } from '../data/mockData';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { AddressAutocomplete } from './AddressAutocomplete';
import '../styles/modal.css';

interface EditListingModalProps {
  listing: RentalListing | SubletListing;
  onClose: () => void;
  onSave: (updatedListing: RentalListing | SubletListing) => void;
  onDelete: (listingId: string) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  onClose,
  onSave,
  onDelete
}) => {
  const isRental = 'price' in listing;
  const initialPrice = isRental
    ? String((listing as RentalListing).price)
    : String((listing as SubletListing).subletPrice);

  // Form State
  const [title, setTitle] = useState(listing.title);
  const [neighborhood, setNeighborhood] = useState<HalifaxNeighborhood>(listing.neighborhood);
  const [address, setAddress] = useState(listing.address);
  const [price, setPrice] = useState(initialPrice);
  const [bedrooms, setBedrooms] = useState(
    String(isRental ? (listing as RentalListing).bedrooms : (listing as SubletListing).bedroomsTotal)
  );
  const [bathrooms, setBathrooms] = useState(
    String(isRental ? (listing as RentalListing).bathrooms : (listing as SubletListing).bathroomsTotal)
  );
  const [heatingType, setHeatingType] = useState<HeatingType>(
    isRental ? (listing as RentalListing).heatingType : 'Heat & Hot Water Included'
  );
  const [winterUtilities, setWinterUtilities] = useState(
    String(isRental ? (listing as RentalListing).estimatedWinterUtilities : 0)
  );
  const [winterParking, setWinterParking] = useState<WinterParkingStatus>(
    isRental ? (listing as RentalListing).winterParking : 'Assigned Driveway'
  );
  const [leaseType, setLeaseType] = useState<LeaseType>(
    isRental ? (listing as RentalListing).leaseType : 'Periodic (Year-to-Year, Rent Cap Protected)'
  );
  const [petPolicy, setPetPolicy] = useState(
    isRental ? (listing as RentalListing).petPolicy : 'Dogs & Cats Welcome'
  );
  const [imageUrl, setImageUrl] = useState(listing.images?.[0] || '');
  const [description, setDescription] = useState(listing.description);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRental) {
      const updated: RentalListing = {
        ...(listing as RentalListing),
        title,
        neighborhood,
        address,
        price: Number(price) || 0,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        heatingType,
        estimatedWinterUtilities: Number(winterUtilities) || 0,
        winterParking,
        leaseType,
        petPolicy: petPolicy as any,
        images: imageUrl ? [imageUrl, ...(listing.images.slice(1))] : listing.images,
        description
      };
      onSave(updated);
    } else {
      const updated: SubletListing = {
        ...(listing as SubletListing),
        title,
        neighborhood,
        address,
        subletPrice: Number(price) || 0,
        bedroomsTotal: Number(bedrooms),
        bathroomsTotal: Number(bathrooms),
        images: imageUrl ? [imageUrl, ...(listing.images.slice(1))] : listing.images,
        description
      };
      onSave(updated);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close edit modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 20 }}>
          <span className="badge badge-amber" style={{ marginBottom: 6 }}>
            Landlord Controls
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Edit Listing</h3>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>
            Modify any parameter of your listing or permanently remove it from the Halifax market.
          </p>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: 20
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f87171', fontWeight: 700, marginBottom: 6 }}>
              <AlertTriangle size={20} />
              <span>Are you sure you want to delete this listing?</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--slate-300)', marginBottom: 14 }}>
              This will immediately remove <strong>"{listing.title}"</strong> and all active viewing schedules from HfxRentals. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-accent"
                style={{ background: '#ef4444', borderColor: '#ef4444', padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => {
                  onDelete(listing.id);
                  onClose();
                }}
              >
                Yes, Permanently Delete
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {/* Form Body */}
        <form onSubmit={handleSave} className="edit-listing-form">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
              Listing Title
            </label>
            <input
              type="text"
              required
              className="text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunny 2-Bed Flat on Coburg Rd near Dalhousie"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                Monthly Rent (CAD)
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                Halifax Neighborhood
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value as HalifaxNeighborhood)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              >
                {HALIFAX_NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)' }}>
                Street Address
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                ⚡ Real-time Halifax autofill
              </span>
            </div>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              onSelectSuggestion={(s) => {
                setAddress(s.streetAddress);
                if (s.neighborhood) {
                  setNeighborhood(s.neighborhood);
                }
              }}
              placeholder="e.g. 6100 Coburg Road, Halifax, NS"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              >
                <option value="0">Studio / Bachelor</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              >
                <option value="1">1 Bathroom</option>
                <option value="1.5">1.5 Bathrooms</option>
                <option value="2">2 Bathrooms</option>
                <option value="2.5">2.5+ Bathrooms</option>
              </select>
            </div>
          </div>

          {/* Halifax Specific Heating & Parking */}
          {isRental && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                  🔥 Heating System
                </label>
                <select
                  value={heatingType}
                  onChange={(e) => setHeatingType(e.target.value as HeatingType)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                >
                  <option value="Heat & Hot Water Included">Heat & Hot Water Included</option>
                  <option value="Heat Pump (Ductless)">Heat Pump (Ductless)</option>
                  <option value="Electric Baseboard">Electric Baseboard</option>
                  <option value="Natural Gas">Natural Gas</option>
                  <option value="Oil Radiator">Oil Radiator</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                  🚗 HRM Winter Parking
                </label>
                <select
                  value={winterParking}
                  onChange={(e) => setWinterParking(e.target.value as WinterParkingStatus)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                >
                  <option value="Assigned Driveway">Assigned Driveway</option>
                  <option value="Heated Underground">Heated Underground</option>
                  <option value="Off-Street Paved">Off-Street Paved</option>
                  <option value="Street Permit Only (Watch Winter Ban)">Street Permit Only (Watch Winter Ban)</option>
                  <option value="No Parking">No Parking</option>
                </select>
              </div>
            </div>
          )}

          {isRental && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                  Est. Winter Utilities (CAD extra/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  value={winterUtilities}
                  onChange={(e) => setWinterUtilities(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                  Lease Type
                </label>
                <select
                  value={leaseType}
                  onChange={(e) => setLeaseType(e.target.value as LeaseType)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                >
                  <option value="Periodic (Year-to-Year, Rent Cap Protected)">Periodic (Year-to-Year, Rent Cap Protected)</option>
                  <option value="Fixed-Term (Specified End Date)">Fixed-Term (Specified End Date)</option>
                  <option value="Month-to-Month">Month-to-Month</option>
                  <option value="Lease Assignment / Takeover">Lease Assignment / Takeover</option>
                </select>
              </div>
            </div>
          )}

          {isRental && (
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
                🐾 Pet Policy
              </label>
              <select
                value={petPolicy}
                onChange={(e) => setPetPolicy(e.target.value as any)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              >
                <option value="Dogs & Cats Welcome">Dogs & Cats Welcome</option>
                <option value="Cats Only">Cats Only</option>
                <option value="Small Dogs Under 25lbs">Small Dogs Under 25lbs</option>
                <option value="No Pets">No Pets</option>
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
              Main Photo URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-300)', display: 'block', marginBottom: 6 }}>
              Property Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--navy-900)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
            {!showDeleteConfirm && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                <span>Delete Listing</span>
              </button>
            )}

            <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
