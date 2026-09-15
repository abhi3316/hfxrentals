import React, { useState } from 'react';
import type { RentalListing, SubletListing, ViewingSlot } from '../types';
import { X, Calendar, Clock, Video, MapPin, CheckCircle, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import '../styles/modal.css';

interface ViewingSchedulerModalProps {
  listing: RentalListing | SubletListing;
  onClose: () => void;
}

export const ViewingSchedulerModal: React.FC<ViewingSchedulerModalProps> = ({
  listing,
  onClose
}) => {
  // Default sample slots if not explicitly defined on listing
  const defaultSlots: ViewingSlot[] = [
    { id: 'def-1', date: 'Tomorrow (Wednesday)', time: '4:30 PM - 5:00 PM', type: 'In-Person Walkthrough', availableSpots: 2 },
    { id: 'def-2', date: 'Thursday', time: '5:30 PM - 6:00 PM', type: 'Live Video Tour (Google Meet)', availableSpots: 1 },
    { id: 'def-3', date: 'Saturday', time: '1:00 PM - 2:30 PM', type: 'Open House Window', availableSpots: 4 }
  ];

  const availableSlots = listing.viewingSlots && listing.viewingSlots.length > 0
    ? listing.viewingSlots
    : defaultSlots;

  const [selectedSlot, setSelectedSlot] = useState<ViewingSlot>(availableSlots[0]);
  const [viewingType, setViewingType] = useState<'In-Person' | 'Video'>('In-Person');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attachFastPass, setAttachFastPass] = useState(true);
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const isRental = 'price' in listing;
  const listerName = isRental ? (listing as RentalListing).landlord.name : (listing as SubletListing).lister.name;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  // Generate Google Calendar Link
  const gcalUrl = (() => {
    const title = encodeURIComponent(`Viewing: ${listing.title} with ${listerName}`);
    const details = encodeURIComponent(
      `Viewing booked via HfxRentals.\nFormat: ${viewingType === 'Video' ? 'Live Video Tour (Google Meet)' : 'In-Person Walkthrough'}\nAddress: ${listing.address}\nContact: ${email} (${phone})`
    );
    const location = encodeURIComponent(viewingType === 'Video' ? 'Google Meet Video Call' : listing.address);
    // Simple placeholder date in Google Calendar format
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  })();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="wizard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Calendar size={20} color="var(--teal-400)" />
            <span className="badge badge-teal">
              Google Calendar Live Sync
            </span>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Schedule a Viewing
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginTop: 2 }}>
            Instant confirmation with {listerName} for <strong style={{ color: '#ffffff' }}>{listing.address}</strong>
          </p>
        </div>

        {confirmed ? (
          /* Confirmation Screen */
          <div className="wizard-body" style={{ textAlign: 'center', padding: '36px 28px' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(0, 168, 150, 0.2)',
              border: '2px solid var(--teal-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--teal-400)'
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Viewing Confirmed!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-300)', maxWidth: 460, margin: '0 auto 20px auto' }}>
              We have reserved your slot for <strong>{selectedSlot.date} at {selectedSlot.time}</strong> ({viewingType === 'Video' ? 'Live Video Tour' : 'In-Person'}).
              A calendar invitation has been sent to <strong>{email}</strong>.
            </p>

            <div style={{ background: 'var(--navy-800)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginBottom: 4 }}>Appointment Summary:</div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>{listing.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--teal-400)', marginTop: 4 }}>
                {viewingType === 'Video' ? '📹 Google Meet link will be in your calendar invite' : `📍 Meet at building lobby: ${listing.address}`}
              </div>
              {attachFastPass && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.78rem', color: 'var(--amber-500)' }}>
                  <Sparkles size={12} />
                  <span>Your Verified Renter Fast-Pass™ priority status was attached!</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '10px 20px' }}
              >
                <Calendar size={16} />
                Add to Google Calendar
                <ExternalLink size={14} />
              </a>

              <button className="btn btn-secondary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleConfirm}>
            <div className="wizard-body">
              {/* Step 1: Format choice */}
              <div>
                <label className="filter-label" style={{ marginBottom: 8, display: 'block' }}>
                  Choose Viewing Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    className={`btn ${viewingType === 'In-Person' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setViewingType('In-Person')}
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    <MapPin size={16} />
                    In-Person Walkthrough
                  </button>

                  <button
                    type="button"
                    className={`btn ${viewingType === 'Video' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setViewingType('Video')}
                    style={{ padding: '10px', fontSize: '0.85rem' }}
                  >
                    <Video size={16} />
                    Live Video Tour (Google Meet)
                  </button>
                </div>
              </div>

              {/* Step 2: Available Slots */}
              <div>
                <label className="filter-label" style={{ marginBottom: 8, display: 'block' }}>
                  Select Available Time Slot (Synced from Landlord's Calendar)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {availableSlots.map(slot => (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: selectedSlot.id === slot.id ? 'rgba(0, 168, 150, 0.15)' : 'var(--navy-800)',
                        border: `1px solid ${selectedSlot.id === slot.id ? 'var(--teal-500)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={16} color={selectedSlot.id === slot.id ? 'var(--teal-400)' : 'var(--slate-400)'} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                            {slot.date} • {slot.time}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                            {slot.type}
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                        {slot.availableSpots} spot{slot.availableSpots > 1 ? 's' : ''} open
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Attendee Details */}
              <div className="form-row-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="filter-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="filter-label">Email (for Calendar Invite)</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@dal.ca"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Cell Phone (for SMS Reminder)</label>
                <input
                  type="tel"
                  required
                  placeholder="(902) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Fast-Pass priority badge checkbox */}
              <div
                onClick={() => setAttachFastPass(!attachFastPass)}
                style={{
                  background: 'rgba(244, 162, 97, 0.1)',
                  border: '1px solid rgba(244, 162, 97, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={attachFastPass}
                  onChange={() => {}}
                  style={{ accentColor: 'var(--amber-500)', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--amber-500)' }}>
                    Attach Verified Renter Fast-Pass™ Status
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-300)' }}>
                    Prioritizes your booking over unverified inquiries.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="filter-label">Questions or Move-in Date Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inquiring for Sept 1 move-in, Dalhousie medical student..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                <AlertCircle size={14} color="var(--teal-400)" />
                <span>No-show prevention: Landlord will receive your phone number to confirm 1 hour prior.</span>
              </div>
            </div>

            <div className="wizard-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Calendar size={16} />
                Confirm & Sync to Calendar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
