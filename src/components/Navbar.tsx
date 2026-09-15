import React from 'react';
import type { TabType } from '../types';
import { Compass, PlusCircle, Heart, ShieldCheck, Home, Calendar, Users } from 'lucide-react';
import '../styles/navbar.css';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenPostListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  onOpenFavorites,
  onOpenPostListing
}) => {
  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar" aria-label="Main Navigation">
          {/* Brand */}
          <div className="brand" onClick={() => setActiveTab('rentals')} role="button" tabIndex={0}>
            <div className="brand-icon">
              <Compass size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title">HFX Rentals</span>
              <span className="brand-subtitle">Halifax & HRM Housing</span>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="nav-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'rentals'}
              className={`nav-tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
              onClick={() => setActiveTab('rentals')}
            >
              <Home size={16} />
              <span>Rentals</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'sublets'}
              className={`nav-tab-btn ${activeTab === 'sublets' ? 'active' : ''}`}
              onClick={() => setActiveTab('sublets')}
            >
              <Calendar size={16} />
              <span>Sublets</span>
              <span className="nav-tab-badge">Terms</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'roommates'}
              className={`nav-tab-btn ${activeTab === 'roommates' ? 'active' : ''}`}
              onClick={() => setActiveTab('roommates')}
            >
              <Users size={16} />
              <span>Roommates</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'scam-shield'}
              className={`nav-tab-btn ${activeTab === 'scam-shield' ? 'active' : ''}`}
              onClick={() => setActiveTab('scam-shield')}
            >
              <ShieldCheck size={16} />
              <span>Scam Shield</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            <button
              className="fav-btn"
              onClick={onOpenFavorites}
              aria-label="Saved listings"
              title="Saved listings"
            >
              <Heart size={20} />
              {favoritesCount > 0 && (
                <span className="fav-count">{favoritesCount}</span>
              )}
            </button>

            <button
              className="post-ad-btn"
              onClick={onOpenPostListing}
            >
              <PlusCircle size={18} />
              <span>Post a Listing</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
