import React, { useState } from 'react';
import { HALIFAX_NEIGHBORHOODS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { compressImage, type OptimizedImage } from '../utils/imageOptimizer';
import { uploadMultipleListingPhotos } from '../utils/storage';
import { AddressAutocomplete } from './AddressAutocomplete';
import { X, Check, Sparkles, ArrowRight, ArrowLeft, Camera, UploadCloud, Loader2, Lock } from 'lucide-react';
import '../styles/modal.css';

interface PostListingModalProps {
  onClose: () => void;
  onListingCreated: (newListing: any) => void;
  onOpenAuth?: () => void;
}

export const PostListingModal: React.FC<PostListingModalProps> = ({
  onClose,
  onListingCreated,
  onOpenAuth
}) => {
  const { user } = useAuth();
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

  // Photos & Upload state
  const [photos, setPhotos] = useState<OptimizedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 8 - photos.length;
    if (availableSlots <= 0) return;

    const filesToCompress = Array.from(files).slice(0, availableSlots);
    setIsCompressing(true);

    try {
      const results: OptimizedImage[] = [];
      for (const f of filesToCompress) {
        try {
          const opt = await compressImage(f);
          results.push(opt);
        } catch (err) {
          console.warn('Error compressing photo', f.name, err);
        }
      }
      setPhotos(prev => [...prev, ...results]);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const currentUserId = user.id;
    const currentUserName = user.name;
    const currentUserEmail = user.email;
    const currentUserAvatar = user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

    setIsUploading(true);
    setUploadStatusText('Uploading optimized property photos...');

    let finalImages: string[] = [];
    if (photos.length > 0) {
      try {
        finalImages = await uploadMultipleListingPhotos(
          photos.map(p => ({ file: p.file, dataUrl: p.dataUrl })),
          (completed, total) => setUploadStatusText(`Uploading photos (${completed} of ${total})...`)
        );
      } catch (err) {
        console.warn('Upload error, using previews', err);
        finalImages = photos.map(p => p.previewUrl || p.dataUrl);
      }
    } else {
      finalImages = [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ];
    }
    setIsUploading(false);

    const parsedPrice = Number(price) > 0 ? Number(price) : (listingType === 'roommate' ? 950 : (listingType === 'sublet' ? 1200 : 1850));
    const parsedBedrooms = !isNaN(Number(bedrooms)) ? Number(bedrooms) : 2;
    const parsedBathrooms = !isNaN(Number(bathrooms)) ? Number(bathrooms) : 1;

    const createdItem: any = {
      id: `custom-${Date.now()}`,
      userId: currentUserId,
      title: title || (listingType === 'rental' ? 'Spacious Halifax Apartment' : listingType === 'sublet' ? 'Cozy Student Sublet' : `${currentUserName}'s Roommate Search`),
      neighborhood,
      address: address || 'South End, Halifax, NS',
      bedrooms: parsedBedrooms,
      bathrooms: parsedBathrooms,
      propertyType: 'Apartment',
      images: finalImages,
      description: description || 'Beautiful, clean unit in great Halifax location.'
    };

    if (listingType === 'rental') {
      createdItem.price = parsedPrice;
      createdItem.heatingType = heatingType || 'Heat & Hot Water Included';
      createdItem.estimatedWinterUtilities = 65;
      createdItem.winterParking = winterParking || 'Assigned Driveway';
      createdItem.leaseType = 'Periodic (Year-to-Year, Rent Cap Protected)';
      createdItem.petPolicy = 'Dogs & Cats Welcome';
      createdItem.transitTimes = {
        dalStudley: 12,
        dalSexton: 15,
        smu: 14,
        msvu: 24,
        nscc: 28
      };
      createdItem.availableDate = 'Immediate';
      createdItem.isVerifiedLandlord = true;
      createdItem.isFeaturedBoost = boostSelected;
      createdItem.amenities = ['In-Building Laundry', 'Dishwasher', 'Parking'];
      createdItem.landlord = {
        name: currentUserName,
        email: currentUserEmail,
        verifiedSince: '2026',
        responseRate: 'Under 1 hour',
        avatar: currentUserAvatar
      };
    } else if (listingType === 'sublet') {
      createdItem.subletPrice = parsedPrice;
      createdItem.originalRent = Math.round(parsedPrice * 1.15);
      createdItem.term = 'Summer (May 1 - Aug 31)';
      createdItem.startDate = 'May 1, 2026';
      createdItem.endDate = 'August 31, 2026';
      createdItem.bedroomsTotal = parsedBedrooms;
      createdItem.bathroomsTotal = parsedBathrooms;
      createdItem.subletScope = 'Entire Apartment';
      createdItem.isFurnished = true;
      createdItem.furnitureIncluded = ['Bed & Mattress', 'Study Desk', 'Sofa'];
      createdItem.utilitiesIncluded = true;
      createdItem.wifiIncluded = true;
      createdItem.isStudentVerified = true;
      createdItem.studentAffiliation = user?.universityAffiliation || 'Dalhousie';
      createdItem.transitTimes = {
        dalStudley: 10,
        dalSexton: 12,
        smu: 15,
        msvu: 22,
        nscc: 25
      };
      createdItem.lister = {
        name: currentUserName,
        email: currentUserEmail,
        university: user?.universityAffiliation || 'Dalhousie',
        major: 'Computer Science',
        avatar: currentUserAvatar
      };
    } else if (listingType === 'roommate') {
      createdItem.name = currentUserName;
      createdItem.age = 21;
      createdItem.gender = 'Co-ed Welcome';
      createdItem.lookingFor = 'Room to Rent';
      createdItem.targetBudget = parsedPrice;
      createdItem.targetNeighborhoods = [neighborhood];
      createdItem.targetMoveIn = 'Immediate / Flexible';
      createdItem.university = user?.universityAffiliation || 'Dalhousie';
      createdItem.programOrJob = 'Student / Professional';
      createdItem.isStudentVerified = true;
      createdItem.hasFastPassVerified = false;
      createdItem.avatar = currentUserAvatar;
      createdItem.bio = description || 'Friendly, considerate roommate looking for housing in Halifax.';
      createdItem.lifestyle = {
        cleanliness: 'Neat & Tidy',
        sleepSchedule: 'Flexible',
        socialGuests: 'Quiet & Studious',
        dietary: 'No Restrictions',
        substances: 'Non-Smoker / Non-Drinker',
        petComfort: 'Loves Pets',
        preferredHousehold: 'Co-ed Welcome'
      };
    }

    // Attempt Supabase insert if connected (for rental/sublet)
    if (supabase && user && listingType !== 'roommate') {
      try {
        const { data: inserted, error: insertError } = await supabase.from('listings').insert({
          user_id: user.id,
          category: listingType === 'sublet' ? 'sublet' : 'rental',
          title: createdItem.title,
          neighborhood: createdItem.neighborhood,
          address: createdItem.address,
          price: createdItem.price || createdItem.subletPrice,
          bedrooms: createdItem.bedrooms || createdItem.bedroomsTotal || 1,
          bathrooms: createdItem.bathrooms || createdItem.bathroomsTotal || 1,
          heating_type: createdItem.heatingType || 'Heat & Hot Water Included',
          winter_parking: createdItem.winterParking || 'Assigned Driveway',
          description: createdItem.description,
          images: createdItem.images
        }).select().single();

        if (inserted?.id) {
          createdItem.id = inserted.id;
        }
        if (insertError) {
          console.warn('Supabase insert warning:', insertError.message);
        }
      } catch (err) {
        console.warn('Could not save listing to Supabase, saving to state', err);
      }
    }

    onListingCreated(createdItem);
    onClose();
  };

  // Defense-in-depth barrier: Require authentication to view post wizard or publish listings
  if (!user) {
    return (
      <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="post-auth-barrier-title">
        <div
          className="modal-content"
          style={{ maxWidth: 460, textAlign: 'center', padding: '32px 24px', position: 'relative' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(0, 168, 150, 0.15)',
              border: '1px solid rgba(0, 168, 150, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--teal-400)',
              margin: '0 auto 16px auto'
            }}
          >
            <Lock size={26} />
          </div>

          <h3 id="post-auth-barrier-title" style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: 8, fontWeight: 600 }}>
            Sign In Required to Post
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--slate-300)', lineHeight: 1.5, marginBottom: 20 }}>
            You must be signed in to post a rental listing, student sublet, or roommate profile on HfxRentals. This protects our community against scams and fraudulent listings.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Sign In to Post
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="filter-label">Street Address</label>
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
                  placeholder="e.g. 1459 Robie St or Coburg Rd"
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

            {/* Property Photos Section */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Camera size={16} color="var(--teal-400)" />
                  <span>Property Photos ({photos.length}/8)</span>
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--slate-400)' }}>
                  Auto-compressed to WebP (~150KB)
                </span>
              </div>

              {/* Upload Dropzone */}
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 16px',
                  border: '2px dashed rgba(0, 168, 150, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(7, 19, 33, 0.6)',
                  cursor: photos.length >= 8 ? 'not-allowed' : 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'center'
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoSelect}
                  disabled={photos.length >= 8 || isCompressing}
                  style={{ display: 'none' }}
                />
                {isCompressing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal-300)' }}>
                    <Loader2 size={22} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.88rem' }}>Optimizing photos in browser...</span>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0, 168, 150, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-400)', marginBottom: 8 }}>
                      <UploadCloud size={22} />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                      {photos.length === 0 ? 'Click to select property photos or drag & drop' : 'Add more photos'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 4 }}>
                      Select up to 8 photos from your phone or desktop (JPEG, PNG, WebP)
                    </div>
                  </>
                )}
              </label>

              {/* Photos Previews Grid */}
              {photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginTop: 4 }}>
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        aspectRatio: '4/3',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid var(--teal-500)' : '1px solid var(--glass-border)',
                        background: 'var(--navy-900)'
                      }}
                    >
                      <img
                        src={p.previewUrl || p.dataUrl}
                        alt={`Upload ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {idx === 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            background: 'var(--teal-500)',
                            color: '#071321',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 4
                          }}
                        >
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'rgba(7, 19, 33, 0.85)',
                          color: '#f87171',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Remove photo"
                      >
                        <X size={13} />
                      </button>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(7, 19, 33, 0.75)',
                          fontSize: '0.62rem',
                          color: 'var(--slate-300)',
                          padding: '2px 4px',
                          textAlign: 'center'
                        }}
                      >
                        {Math.round(p.compressedSize / 1024)} KB
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>{uploadStatusText || 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <Check size={16} /> Publish Listing {boostSelected ? '($9.99)' : '(Free)'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
