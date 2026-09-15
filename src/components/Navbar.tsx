import React, { useState } from 'react';
import type { TabType } from '../types';
import { useAuth } from '../context/AuthContext';
import { Compass, PlusCircle, Heart, ShieldCheck, Home, Calendar, Users, User, LogOut, ChevronDown } from 'lucide-react';
import '../styles/navbar.css';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenPostListing: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  onOpenFavorites,
  onOpenPostListing,
  onOpenAuth
}) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

            {/* Auth Login / User Dropdown */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--navy-800)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', maxWidth: 100, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--slate-400)" />
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '120%',
                      right: 0,
                      width: 220,
                      background: 'var(--navy-850)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                      padding: '8px 0',
                      zIndex: 110
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{user.email}</div>
                      <span className="badge badge-teal" style={{ marginTop: 4, textTransform: 'capitalize' }}>
                        {user.role} {user.universityAffiliation ? `• ${user.universityAffiliation}` : ''}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => { onOpenFavorites(); setIsDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        color: 'var(--slate-300)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'transparent'
                      }}
                    >
                      <Heart size={14} /> My Saved Places
                    </button>

                    <button
                      type="button"
                      onClick={() => { logout(); setIsDropdownOpen(false); }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderTop: '1px solid var(--glass-border)',
                        marginTop: 4,
                        background: 'transparent'
                      }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onOpenAuth}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
