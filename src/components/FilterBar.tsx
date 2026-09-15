import React from 'react';
import type { TabType, FilterState } from '../types';
import { CAMPUS_OPTIONS } from '../data/mockData';
import { Flame, Car, PawPrint, ShieldCheck, Bus, RotateCcw } from 'lucide-react';
import '../styles/filters.css';

interface FilterBarProps {
  activeTab: TabType;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  filters,
  setFilters,
  totalResults,
  onResetFilters
}) => {
  if (activeTab === 'scam-shield') {
    return null;
  }

  const handleToggle = (key: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="filter-bar-container">
      <div className="filters-row">
        {/* Bedrooms / Scope */}
        {activeTab === 'rentals' && (
          <div className="filter-group">
            <label className="filter-label">Bedrooms</label>
            <select
              className="filter-select"
              value={filters.bedrooms}
              onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
            >
              <option value="all">Any Bedrooms</option>
              <option value="0">Studio / Bachelor</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
            </select>
          </div>
        )}

        {/* Sublet Term */}
        {activeTab === 'sublets' && (
          <div className="filter-group">
            <label className="filter-label">Academic Term</label>
            <select
              className="filter-select"
              value={filters.subletTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, subletTerm: e.target.value }))}
            >
              <option value="all">Any Academic Term</option>
              <option value="summer">Summer (May 1 - Aug 31)</option>
              <option value="fall">Fall (Sept 1 - Dec 31)</option>
              <option value="winter">Winter (Jan 1 - Apr 30)</option>
            </select>
          </div>
        )}

        {/* Roommate Search Type */}
        {activeTab === 'roommates' && (
          <div className="filter-group">
            <label className="filter-label">Looking For</label>
            <select
              className="filter-select"
              value={filters.roommateLookingFor}
              onChange={(e) => setFilters(prev => ({ ...prev, roommateLookingFor: e.target.value }))}
            >
              <option value="all">All Roommate Searches</option>
              <option value="buddy">Buddy Up for a 2-3 Bed Flat</option>
              <option value="room">Needs a Room to Rent</option>
              <option value="existing">Has a Room Available</option>
            </select>
          </div>
        )}

        {/* Price Slider / Max Budget */}
        <div className="filter-group">
          <label className="filter-label">
            {activeTab === 'rentals' ? 'Max Monthly Rent' : 'Max Budget'} (CAD ${filters.maxPrice})
          </label>
          <input
            type="range"
            min="600"
            max="4000"
            step="50"
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="campus-slider"
          />
        </div>

        {/* Campus Commute Target */}
        <div className="filter-group" style={{ minWidth: 220 }}>
          <label className="filter-label">
            <Bus size={13} style={{ display: 'inline', marginRight: 4 }} />
            Campus Transit Distance
          </label>
          <select
            className="filter-select"
            value={filters.campusFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, campusFilter: e.target.value as any }))}
          >
            {CAMPUS_OPTIONS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {filters.campusFilter !== 'all' && (
          <div className="filter-group" style={{ minWidth: 160 }}>
            <label className="filter-label">Max Transit Time: &lt; {filters.maxTransitMins} mins</label>
            <input
              type="range"
              min="5"
              max="45"
              step="5"
              value={filters.maxTransitMins}
              onChange={(e) => setFilters(prev => ({ ...prev, maxTransitMins: Number(e.target.value) }))}
              className="campus-slider"
            />
          </div>
        )}

        {/* Actions */}
        <div className="filter-actions">
          <span className="results-count-badge">
            {totalResults} {activeTab === 'rentals' ? 'units' : activeTab === 'sublets' ? 'sublets' : 'profiles'}
          </span>
          <button
            className="clear-filters-btn"
            onClick={onResetFilters}
            title="Reset filters"
          >
            <RotateCcw size={14} style={{ display: 'inline', marginRight: 4 }} />
            Reset
          </button>
        </div>
      </div>

      {/* Halifax Specific Toggle Pills */}
      <div className="halifax-toggles">
        {activeTab === 'rentals' && (
          <>
            <button
              className={`toggle-pill ${filters.heatIncludedOnly ? 'active' : ''}`}
              onClick={() => handleToggle('heatIncludedOnly')}
            >
              <Flame size={15} />
              <span>Heat & Hot Water Included</span>
            </button>

            <button
              className={`toggle-pill ${filters.parkingIncludedOnly ? 'active' : ''}`}
              onClick={() => handleToggle('parkingIncludedOnly')}
            >
              <Car size={15} />
              <span>HRM Winter Parking Guaranteed</span>
            </button>

            <button
              className={`toggle-pill ${filters.petFriendlyOnly ? 'active' : ''}`}
              onClick={() => handleToggle('petFriendlyOnly')}
            >
              <PawPrint size={15} />
              <span>Pet Friendly</span>
            </button>
          </>
        )}

        {activeTab === 'sublets' && (
          <>
            <button
              className={`toggle-pill ${filters.furnishedOnly ? 'active' : ''}`}
              onClick={() => handleToggle('furnishedOnly')}
            >
              <span>🛏️ Fully Furnished (Bed + Desk)</span>
            </button>

            <button
              className={`toggle-pill ${filters.heatIncludedOnly ? 'active' : ''}`}
              onClick={() => handleToggle('heatIncludedOnly')}
            >
              <Flame size={15} />
              <span>All Utilities & Wi-Fi Included</span>
            </button>
          </>
        )}

        {activeTab === 'roommates' && (
          <>
            <button
              className={`toggle-pill amber-active ${filters.verifiedOnly ? 'active' : ''}`}
              onClick={() => handleToggle('verifiedOnly')}
            >
              <ShieldCheck size={15} />
              <span>Fast-Pass™ Verified Only</span>
            </button>

            <button
              className={`toggle-pill ${filters.genderPref === 'female' ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, genderPref: prev.genderPref === 'female' ? 'all' : 'female' }))}
            >
              <span>👩 All-Female Households</span>
            </button>

            <button
              className={`toggle-pill ${filters.petFriendlyOnly ? 'active' : ''}`}
              onClick={() => handleToggle('petFriendlyOnly')}
            >
              <PawPrint size={15} />
              <span>Pet Lover</span>
            </button>
          </>
        )}

        <button
          className={`toggle-pill ${filters.verifiedOnly && activeTab !== 'roommates' ? 'active' : ''}`}
          onClick={() => handleToggle('verifiedOnly')}
        >
          <ShieldCheck size={15} />
          <span>Verified Landlords / Students Only</span>
        </button>
      </div>
    </div>
  );
};
