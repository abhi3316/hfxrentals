import React, { useState, useMemo } from 'react';
import type { TabType, FilterState, RentalListing, SubletListing, RoommateProfile } from './types';
import { MOCK_RENTALS, MOCK_SUBLETS, MOCK_ROOMMATES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { RentalCard } from './components/RentalCard';
import { SubletCard } from './components/SubletCard';
import { RoommateCard } from './components/RoommateCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { ViewingSchedulerModal } from './components/ViewingSchedulerModal';
import { PostListingModal } from './components/PostListingModal';
import { InsuranceWidget } from './components/InsuranceWidget';
import { ScamShieldBanner } from './components/ScamShieldBanner';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { SearchX, Compass } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  neighborhood: 'all',
  minPrice: 0,
  maxPrice: 3500,
  bedrooms: 'all',
  petFriendlyOnly: false,
  heatIncludedOnly: false,
  parkingIncludedOnly: false,
  verifiedOnly: false,
  campusFilter: 'all',
  maxTransitMins: 30,
  subletTerm: 'all',
  furnishedOnly: false,
  roommateLookingFor: 'all',
  genderPref: 'all'
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('rentals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  
  // Listings data state
  const [rentals, setRentals] = useState<RentalListing[]>(MOCK_RENTALS);
  const [sublets, setSublets] = useState<SubletListing[]>(MOCK_SUBLETS);
  const [roommates, setRoommates] = useState<RoommateProfile[]>(MOCK_ROOMMATES);

  // Modals & Drawers state
  const [favorites, setFavorites] = useState<string[]>(['hfx-rent-01', 'sublet-01']);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPostListingOpen, setIsPostListingOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<RentalListing | SubletListing | null>(null);
  const [schedulingListing, setSchedulingListing] = useState<RentalListing | SubletListing | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
    setSelectedNeighborhood('all');
  };

  // Filtered Rentals
  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchAddr = r.address.toLowerCase().includes(q);
        const matchNeigh = r.neighborhood.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        if (!matchTitle && !matchAddr && !matchNeigh && !matchDesc) return false;
      }
      // Neighborhood
      if (selectedNeighborhood !== 'all' && r.neighborhood !== selectedNeighborhood) return false;
      // Max price
      if (r.price > filters.maxPrice) return false;
      // Bedrooms
      if (filters.bedrooms !== 'all') {
        if (filters.bedrooms === '3+') {
          if (r.bedrooms < 3) return false;
        } else if (r.bedrooms !== Number(filters.bedrooms)) {
          return false;
        }
      }
      // Heat included
      if (filters.heatIncludedOnly && !r.heatingType.includes('Included')) return false;
      // Parking
      if (filters.parkingIncludedOnly && (r.winterParking === 'No Parking' || r.winterParking.includes('Permit'))) return false;
      // Pet friendly
      if (filters.petFriendlyOnly && r.petPolicy === 'No Pets') return false;
      // Verified only
      if (filters.verifiedOnly && !r.isVerifiedLandlord) return false;
      // Campus filter
      if (filters.campusFilter !== 'all') {
        const transitTime = r.transitTimes[filters.campusFilter as keyof typeof r.transitTimes] || 999;
        if (transitTime > filters.maxTransitMins) return false;
      }
      return true;
    });
  }, [rentals, searchQuery, selectedNeighborhood, filters]);

  // Filtered Sublets
  const filteredSublets = useMemo(() => {
    return sublets.filter(s => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchNeigh = s.neighborhood.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchUniv = s.studentAffiliation?.toLowerCase().includes(q);
        if (!matchTitle && !matchNeigh && !matchDesc && !matchUniv) return false;
      }
      if (selectedNeighborhood !== 'all' && s.neighborhood !== selectedNeighborhood) return false;
      if (s.subletPrice > filters.maxPrice) return false;
      if (filters.subletTerm !== 'all') {
        if (filters.subletTerm === 'summer' && !s.term.includes('Summer')) return false;
        if (filters.subletTerm === 'fall' && !s.term.includes('Fall')) return false;
        if (filters.subletTerm === 'winter' && !s.term.includes('Winter')) return false;
      }
      if (filters.furnishedOnly && !s.isFurnished) return false;
      if (filters.heatIncludedOnly && (!s.utilitiesIncluded || !s.wifiIncluded)) return false;
      if (filters.verifiedOnly && !s.isStudentVerified) return false;
      if (filters.campusFilter !== 'all') {
        const transitTime = s.transitTimes[filters.campusFilter as keyof typeof s.transitTimes] || 999;
        if (transitTime > filters.maxTransitMins) return false;
      }
      return true;
    });
  }, [sublets, searchQuery, selectedNeighborhood, filters]);

  // Filtered Roommates
  const filteredRoommates = useMemo(() => {
    return roommates.filter(rm => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = rm.name.toLowerCase().includes(q);
        const matchBio = rm.bio.toLowerCase().includes(q);
        const matchJob = rm.programOrJob.toLowerCase().includes(q);
        if (!matchName && !matchBio && !matchJob) return false;
      }
      if (selectedNeighborhood !== 'all' && !rm.targetNeighborhoods.includes(selectedNeighborhood as any)) return false;
      if (rm.targetBudget > filters.maxPrice) return false;
      if (filters.roommateLookingFor !== 'all') {
        if (filters.roommateLookingFor === 'buddy' && !rm.lookingFor.includes('Buddy Up')) return false;
        if (filters.roommateLookingFor === 'room' && !rm.lookingFor.includes('Room to Rent')) return false;
        if (filters.roommateLookingFor === 'existing' && !rm.lookingFor.includes('Existing Place')) return false;
      }
      if (filters.genderPref === 'female' && rm.lifestyle.preferredHousehold !== 'All Female') return false;
      if (filters.petFriendlyOnly && rm.lifestyle.petComfort === 'Allergic to Cats/Dogs') return false;
      if (filters.verifiedOnly && !rm.hasFastPassVerified) return false;
      return true;
    });
  }, [roommates, searchQuery, selectedNeighborhood, filters]);

  // Saved items list
  const favoritedListings = useMemo(() => {
    const rMatch = rentals.filter(r => favorites.includes(r.id));
    const sMatch = sublets.filter(s => favorites.includes(s.id));
    return [...rMatch, ...sMatch];
  }, [rentals, sublets, favorites]);

  // Handle new listing submission
  const handleListingCreated = (item: any) => {
    if (item.subletPrice !== undefined) {
      setSublets(prev => [item, ...prev]);
      setActiveTab('sublets');
    } else if (item.lifestyle !== undefined) {
      setRoommates(prev => [item, ...prev]);
      setActiveTab('roommates');
    } else {
      setRentals(prev => [item, ...prev]);
      setActiveTab('rentals');
    }
  };

  const totalResults = activeTab === 'rentals'
    ? filteredRentals.length
    : activeTab === 'sublets'
    ? filteredSublets.length
    : filteredRoommates.length;

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenPostListing={() => setIsPostListingOpen(true)}
      />

      <main>
        <HeroBanner
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedNeighborhood={selectedNeighborhood}
          setSelectedNeighborhood={setSelectedNeighborhood}
        />

        <div className="container">
          {/* Tenant Insurance Banner (visible on rentals & sublets) */}
          {activeTab !== 'scam-shield' && <InsuranceWidget />}

          {/* Dynamic Filter Bar */}
          <FilterBar
            activeTab={activeTab}
            filters={filters}
            setFilters={setFilters}
            totalResults={totalResults}
            onResetFilters={handleResetFilters}
          />

          {/* Listings Container */}
          {activeTab === 'rentals' && (
            <div className="listings-grid">
              {filteredRentals.length > 0 ? (
                filteredRentals.map(rental => (
                  <RentalCard
                    key={rental.id}
                    listing={rental}
                    isFavorited={favorites.includes(rental.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectListing={(item) => setSelectedListing(item)}
                    onScheduleViewing={(item) => setSchedulingListing(item)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <SearchX className="empty-state-icon" />
                  <h3 className="empty-state-title">No rentals match your filters</h3>
                  <p className="empty-state-desc">
                    Try adjusting your maximum budget or toggling off specific filters like heating or winter parking.
                  </p>
                  <button className="btn btn-secondary" onClick={handleResetFilters}>
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sublets' && (
            <div className="listings-grid">
              {filteredSublets.length > 0 ? (
                filteredSublets.map(sublet => (
                  <SubletCard
                    key={sublet.id}
                    sublet={sublet}
                    isFavorited={favorites.includes(sublet.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectSublet={(item) => setSelectedListing(item)}
                    onScheduleViewing={(item) => setSchedulingListing(item)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <SearchX className="empty-state-icon" />
                  <h3 className="empty-state-title">No sublets found</h3>
                  <p className="empty-state-desc">
                    No active student sublets match this term or price. Try changing the academic term filter.
                  </p>
                  <button className="btn btn-secondary" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roommates' && (
            <div className="listings-grid">
              {filteredRoommates.length > 0 ? (
                filteredRoommates.map(profile => (
                  <RoommateCard
                    key={profile.id}
                    profile={profile}
                    onOpenMessage={(prof) => alert(`Direct message dialog with ${prof.name} opened. Their email is verified!`)}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <SearchX className="empty-state-icon" />
                  <h3 className="empty-state-title">No roommate profiles match</h3>
                  <p className="empty-state-desc">
                    Try expanding your budget slider or clearing household preference tags.
                  </p>
                  <button className="btn btn-secondary" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scam-shield' && (
            <ScamShieldBanner />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--navy-900)', borderTop: '1px solid var(--glass-border)', padding: '50px 0 30px 0', marginTop: '60px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ maxWidth: '360px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Compass size={22} color="var(--teal-400)" />
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>HFX Rentals</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', lineHeight: 1.6 }}>
                The community-first rental, sublet, and roommate matching ecosystem for the Halifax Regional Municipality (HRM). Built to end rental scams, hidden winter heating costs, and seasonal housing shortages.
              </p>
            </div>

            <div>
              <h5 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '0.9rem' }}>Halifax Campuses</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--slate-400)' }}>
                <li>Dalhousie University (Studley & Sexton)</li>
                <li>Saint Mary's University (SMU)</li>
                <li>Mount Saint Vincent University (MSVU)</li>
                <li>NSCC (Ivany & Leeds Campuses)</li>
              </ul>
            </div>

            <div>
              <h5 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '0.9rem' }}>HRM Tenant Resources</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--slate-400)' }}>
                <li>Nova Scotia Residential Tenancies Act Guide</li>
                <li>HRM Winter Street Parking Ban Rules</li>
                <li>Halifax Transit Bus & Ferry Schedules</li>
                <li>Standard NS Sublet Agreement Form</li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            <div>© 2026 HfxRentals. Made for the Halifax & Dartmouth community.</div>
            <div>Designed for low-cost hosting on AWS (S3, CloudFront & Amplify).</div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOpenScamShield={() => {
            setSelectedListing(null);
            setActiveTab('scam-shield');
          }}
          onOpenViewingScheduler={(item) => {
            setSelectedListing(null);
            setSchedulingListing(item);
          }}
        />
      )}

      {schedulingListing && (
        <ViewingSchedulerModal
          listing={schedulingListing}
          onClose={() => setSchedulingListing(null)}
        />
      )}

      {isPostListingOpen && (
        <PostListingModal
          onClose={() => setIsPostListingOpen(false)}
          onListingCreated={handleListingCreated}
        />
      )}

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoritedListings}
        onRemoveFavorite={toggleFavorite}
        onSelectListing={(item) => setSelectedListing(item)}
      />
    </div>
  );
};
