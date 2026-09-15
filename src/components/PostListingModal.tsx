import React, { useState } from 'react';
import { HALIFAX_NEIGHBORHOODS } from '../data/mockData';
import { X, Check, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import '../styles/modal.css';

interface PostListingModalProps {
  onClose: () => void;
  onListingCreated: (newListing: any) => void;
}

export const PostListingModal: React.FC<PostListingModalProps> = ({
  onClose,
  onListingCreated
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [listingType, setListingType] = useState<'rental' | 'sublet' | 'roommate'>('rental');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [neighborhood, setNeighborhood] = useState<string>(HALIFAX_NEIGHBORHOODS[0]);
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('1850');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('1');
  const [heatingType, setHeatingType] = useState('Heat & Hot Water Included');
  const [winterParking, setWinterParking] = useState('Assigned Driveway');
  const [description, setDescription] = useState('');
  const [boostSelected, setBoostSelected] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdItem = {
      id: `custom-${Date.now()}`,
      title: title || (listingType === 'rental' ? 'Spacious Halifax Apartment' : 'Cozy Student Sublet'),
      neighborhood,
      address: address || 'South End, Halifax, NS',
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      propertyType: 'Apartment',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ],
      heatingType,
      estimatedWinterUtilities: 65,
      winterParking,
      leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
      petPolicy: 'Dogs & Cats Welcome',
      transitTimes: {
        dalStudley: 12,
        dalSexton: 15,
        smu: 14,
        msvu: 24,
        nscc: 28
      },
      availableDate: 'Immediate',
      isVerifiedLandlord: true,
      isFeaturedBoost: boostSelected,
      amenities: ['In-Building Laundry', 'Dishwasher', 'Parking'],
      description: description || 'Beautiful, clean unit in great Halifax location.',
      landlord: {
        name: 'You (New Lister)',
        email: 'you@example.com',
        verifiedSince: '2026',
        responseRate: 'Under 1 hour',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      }
    };

    onListingCreated(createdItem);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Wizard Header */}
        <div className="wizard-header">
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Post on HfxRentals</h3>
          <div className="wizard-steps-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span>Category</span>
            </div>
            <span>→</span>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span>Property Details</span>
            </div>
            <span>→</span>
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span>Boost & Publish</span>
            </div>
          </div>
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="wizard-body">
            <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>What are you listing today?</h4>
            <div className="category-choice-grid">
              <div
                className={`category-choice-card ${listingType === 'rental' ? 'selected' : ''}`}
                onClick={() => setListingType('rental')}
              >
                <div className="category-icon">🏢</div>
                <div className="category-name">Full Rental</div>
                <div className="category-desc">Apartment, flat, or house for standard lease</div>
              </div>

              <div
                className={`category-choice-card ${listingType === 'sublet' ? 'selected' : ''}`}
                onClick={() => setListingType('sublet')}
              >
                <div className="category-icon">⏳</div>
                <div className="category-name">Student Sublet</div>
                <div className="category-desc">Temporary stay (Summer, Fall, Winter 4-8 months)</div>
              </div>

              <div
                className={`category-choice-card ${listingType === 'roommate' ? 'selected' : ''}`}
                onClick={() => setListingType('roommate')}
              >
                <div className="category-icon">👥</div>
                <div className="category-name">Roommate Profile</div>
                <div className="category-desc">Looking for a room or buddying up for a flat</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div className="wizard-body">
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="filter-label">Listing Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunny 2-Bed South End Flat near Dalhousie"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Neighborhood</label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                >
                  {HALIFAX_NEIGHBORHOODS.map(nh => (
                    <option key={nh} value={nh}>{nh}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Street Address (approximate OK)</label>
                <input
                  type="text"
                  placeholder="e.g. Coburg Road, Halifax"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Monthly Rent (CAD $)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Bedrooms & Bathrooms</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ flex: 1 }}>
                    <option value="0">Studio</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Bed</option>
                    <option value="3">3+ Bed</option>
                  </select>
                  <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} style={{ flex: 1 }}>
                    <option value="1">1 Bath</option>
                    <option value="1.5">1.5 Bath</option>
                    <option value="2">2 Bath</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Heating Type (Crucial for winter)</label>
                <select value={heatingType} onChange={(e) => setHeatingType(e.target.value)}>
                  <option value="Heat & Hot Water Included">Heat & Hot Water Included</option>
                  <option value="Heat Pump (Ductless)">Heat Pump (Mini-Split)</option>
                  <option value="Electric Baseboard">Electric Baseboard</option>
                  <option value="Natural Gas">Natural Gas</option>
                  <option value="Oil Radiator">Oil Radiator</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">HRM Winter Parking Status</label>
                <select value={winterParking} onChange={(e) => setWinterParking(e.target.value)}>
                  <option value="Assigned Driveway">Assigned Driveway</option>
                  <option value="Heated Underground">Heated Underground</option>
                  <option value="Off-Street Paved">Off-Street Paved</option>
                  <option value="Street Permit Only (Watch Winter Ban)">Street Permit Only</option>
                  <option value="No Parking">No Parking</option>
                </select>
              </div>
            </div>

            {/* Google Calendar Link Option */}
            <div style={{
              background: 'rgba(2, 128, 144, 0.12)',
              border: '1px solid rgba(2, 128, 144, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: '1.2rem' }}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Enable Google Calendar Viewing Appointments
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-300)' }}>
                  Allows interested tenants to instantly book 20-min in-person or live video slots without email clutter.
                </div>
              </div>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--teal-500)', transform: 'scale(1.2)' }} />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="filter-label">Description & Highlights</label>
              <textarea
                rows={3}
                placeholder="Tell tenants about the building, proximity to bus lines, grocery stores, and move-in availability..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Boost & Publish */}
        {step === 3 && (
          <div className="wizard-body">
            <h4 style={{ fontSize: '1.15rem', marginBottom: 4 }}>Maximize Your Visibility</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-300)', marginBottom: 16 }}>
              Listings in Halifax with verified badges and featured placement get filled 3x faster.
            </p>

            {/* Free Plan */}
            <div
              className={`boost-choice-box ${!boostSelected ? 'active' : ''}`}
              onClick={() => setBoostSelected(false)}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                  Standard Free Listing
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                  Active for 30 days • Direct messaging • Standard search results
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-400)' }}>
                $0 CAD
              </div>
            </div>

            {/* $9.99 Urgent Boost Plan */}
            <div
              className={`boost-choice-box ${boostSelected ? 'active' : ''}`}
              onClick={() => setBoostSelected(true)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color="var(--amber-500)" />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                    Urgent Boost & Social Syndicate
                  </span>
                  <span className="badge badge-amber">Recommended</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-300)', marginTop: 4 }}>
                  ★ Pinned to top of Halifax search results <br />
                  ★ Featured badge with amber highlight <br />
                  ★ Shared to HfxRentals Instagram Stories & student channels
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amber-500)' }}>
                $9.99 CAD
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="wizard-footer">
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep((step - 1) as any)}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep((step + 1) as any)}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit}>
              <Check size={16} /> Publish Listing {boostSelected ? '($9.99)' : '(Free)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
