import React from 'react';
import type { RoommateProfile } from '../types';
import { GraduationCap, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import '../styles/listings.css';

interface RoommateCardProps {
  profile: RoommateProfile;
  onOpenMessage: (profile: RoommateProfile) => void;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({
  profile,
  onOpenMessage
}) => {
  return (
    <article className="listing-card roommate-card">
      {/* Header */}
      <div className="roommate-header">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="roommate-avatar-large"
        />
        <div className="roommate-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 className="roommate-name">{profile.name}, {profile.age}</h3>
            {profile.hasFastPassVerified && (
              <span className="badge badge-amber" title="Verified ID & Credit Fast-Pass">
                <Sparkles size={11} /> Fast-Pass™
              </span>
            )}
          </div>

          <div className="roommate-program">{profile.programOrJob}</div>

          {profile.isStudentVerified && (
            <span className="badge badge-teal" style={{ marginTop: 4 }}>
              <GraduationCap size={11} /> {profile.university} Verified
            </span>
          )}

          <div className="roommate-budget-badge">
            Target Budget: Up to ${profile.targetBudget}/mo
          </div>
        </div>
      </div>

      {/* Target search */}
      <div className="card-location" style={{ marginBottom: 12 }}>
        <MapPin size={13} />
        <span>Target: {profile.targetNeighborhoods.join(', ')} • Move-in: {profile.targetMoveIn}</span>
      </div>

      {/* Bio */}
      <p className="roommate-bio">
        "{profile.bio}"
      </p>

      {/* Lifestyle Compatibility Tags */}
      <div className="lifestyle-tags-grid">
        <span className="lifestyle-pill">🧹 {profile.lifestyle.cleanliness}</span>
        <span className="lifestyle-pill">⏰ {profile.lifestyle.sleepSchedule}</span>
        <span className="lifestyle-pill">🥗 {profile.lifestyle.dietary}</span>
        <span className="lifestyle-pill">👥 {profile.lifestyle.socialGuests}</span>
        <span className="lifestyle-pill">🐾 {profile.lifestyle.petComfort}</span>
        <span className="lifestyle-pill">🏠 {profile.lifestyle.preferredHousehold}</span>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <span className="badge badge-blue">
          {profile.lookingFor}
        </span>

        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => onOpenMessage(profile)}
        >
          <MessageCircle size={15} />
          Message
        </button>
      </div>
    </article>
  );
};
