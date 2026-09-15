import React from 'react';
import type { TabType, HalifaxNeighborhood } from '../types';
import { HALIFAX_NEIGHBORHOODS } from '../data/mockData';
import { Search, X, MapPin, Sparkles } from 'lucide-react';
import '../styles/hero.css';

interface HeroBannerProps {
  activeTab: TabType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (n: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  selectedNeighborhood,
  setSelectedNeighborhood
}) => {
  const getTabDetails = () => {
    switch (activeTab) {
      case 'sublets':
        return {
          pill: 'Halifax Student & Term Hub',
          title: 'Find Your Next ',
          highlight: 'Halifax Sublet',
          subtitle: 'Seasonal sublets tailored for Dalhousie, SMU, and MSVU students. Filter by summer, fall, or winter terms with transparent rent discounts and furnished rooms.'
        };
      case 'roommates':
        return {
          pill: 'HRM Roommate Compatibility Matcher',
          title: 'Find Your Ideal ',
          highlight: 'Halifax Roommate',
          subtitle: 'Connect with verified students and young professionals. Match based on cleanliness, study habits, Dal/SMU campus proximity, and lifestyle preferences.'
        };
      case 'scam-shield':
        return {
          pill: 'Trust, Safety & Remote Verification',
          title: 'Halifax Rental ',
          highlight: 'Scam Shield',
          subtitle: 'Arriving from out of province or abroad? Protect yourself against rental scams with verified student ambassador inspections and landlord identity audits.'
        };
      case 'rentals':
      default:
        return {
          pill: 'Hyper-Local Halifax Housing Platform',
          title: 'Rent Smarter in ',
          highlight: 'Halifax & Dartmouth',
          subtitle: 'Browse verified apartments, heritage flats, and townhouses with Halifax-specific insight: heating breakdown, winter street parking status, and transit commute times.'
        };
    }
  };

  const details = getTabDetails();

  if (activeTab === 'scam-shield') {
    return null; // The ScamShield page has its own dedicated rich header
  }

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>{details.pill}</span>
          </div>

          <h1 className="hero-title">
            {details.title}
            <span className="highlight">{details.highlight}</span>
          </h1>

          <p className="hero-subtitle">
            {details.subtitle}
          </p>

          {/* Search Bar */}
          <div className="hero-search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="hero-search-input"
              placeholder={
                activeTab === 'rentals'
                  ? 'Search by street, neighborhood, or keywords (e.g. Quinpool, Hydrostone, heat pump)...'
                  : activeTab === 'sublets'
                  ? 'Search by campus or term (e.g. Dalhousie, May-Aug, furnished desk)...'
                  : 'Search by university, program, or lifestyle (e.g. Dal CS, quiet study, female)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Quick Neighborhood Chips */}
          <div className="quick-neighborhoods">
            <span className="neighborhood-label">
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              Neighborhoods:
            </span>
            <button
              className={`neighborhood-chip ${selectedNeighborhood === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedNeighborhood('all')}
            >
              All HRM
            </button>
            {HALIFAX_NEIGHBORHOODS.map((nh: HalifaxNeighborhood) => (
              <button
                key={nh}
                className={`neighborhood-chip ${selectedNeighborhood === nh ? 'active' : ''}`}
                onClick={() => setSelectedNeighborhood(selectedNeighborhood === nh ? 'all' : nh)}
              >
                {nh}
              </button>
            ))}
          </div>

          {/* Halifax Live Stats Grid */}
          <div className="hfx-stats-grid">
            <div className="stat-item">
              <span className="stat-value">420+</span>
              <span className="stat-label">Active HRM Units</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">$875</span>
              <span className="stat-label">Avg. Student Room Sublet</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">&lt; 15 min</span>
              <span className="stat-label">Campus Transit Radius</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Scam-Protected Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
