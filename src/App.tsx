import React, { useState, useMemo, useEffect } from 'react';
import type { TabType, FilterState, RentalListing, SubletListing, RoommateProfile } from './types';
import { MOCK_RENTALS, MOCK_SUBLETS, MOCK_ROOMMATES } from './data/mockData';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { RentalCard } from './components/RentalCard';
import { SubletCard } from './components/SubletCard';
import { RoommateCard } from './components/RoommateCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { ViewingSchedulerModal } from './components/ViewingSchedulerModal';
import { PostListingModal } from './components/PostListingModal';
import { EditListingModal } from './components/EditListingModal';
import { ChatModal } from './components/ChatModal';
import { AuthModal } from './components/AuthModal';
import { InsuranceWidget } from './components/InsuranceWidget';
import { ScamShieldBanner } from './components/ScamShieldBanner';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { SearchX, Compass, PlusCircle, Database } from 'lucide-react';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('rentals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  
  // Listings data state: starts clean with 0 mock listings (or local/supabase items)
  const [rentals, setRentals] = useState<RentalListing[]>(() => {
    const local = localStorage.getItem('hfx_local_rentals');
    return local ? JSON.parse(local) : [];
  });
  const [sublets, setSublets] = useState<SubletListing[]>(() => {
    const local = localStorage.getItem('hfx_local_sublets');
    return local ? JSON.parse(local) : [];
  });
  const [roommates, setRoommates] = useState<RoommateProfile[]>(MOCK_ROOMMATES);

  // Modals & Drawers state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPostListingOpen, setIsPostListingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<RentalListing | SubletListing | null>(null);
  const [schedulingListing, setSchedulingListing] = useState<RentalListing | SubletListing | null>(null);
  const [chatListing, setChatListing] = useState<RentalListing | SubletListing | null>(null);
  const [editingListing, setEditingListing] = useState<RentalListing | SubletListing | null>(null);

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

  // Fetch listings from Supabase on mount
  useEffect(() => {
    const client = supabase;
    if (client) {
      const fetchListings = async () => {
        try {
          const { data, error } = await client.from('listings').select('*');
          if (!error && data && data.length > 0) {
            const dbRentals: RentalListing[] = data
              .filter((d: any) => d.category === 'rental')
              .map((d: any) => ({
                id: d.id,
                userId: d.user_id,
                title: d.title,
                neighborhood: d.neighborhood,
                address: d.address,
                price: Number(d.price),
                bedrooms: d.bedrooms,
                bathrooms: d.bathrooms,
                propertyType: d.property_type || 'Apartment',
                images: d.images?.length > 0 ? d.images : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
                heatingType: d.heating_type || 'Heat & Hot Water Included',
                estimatedWinterUtilities: d.estimated_winter_utilities || 50,
                winterParking: d.winter_parking || 'Assigned Driveway',
                leaseType: d.lease_type || 'Periodic (Year-to-Year, Rent Cap Protected)',
                petPolicy: d.pet_policy || 'Dogs & Cats Welcome',
                transitTimes: { dalStudley: 12, dalSexton: 15, smu: 14, msvu: 24, nscc: 28 },
                availableDate: 'Immediate',
                isVerifiedLandlord: true,
                amenities: d.amenities || ['In-Building Laundry', 'Parking'],
                description: d.description || '',
                landlord: {
                  name: 'Halifax Landlord',
                  email: 'landlord@example.com',
                  verifiedSince: '2026',
                  responseRate: 'Under 1 hour',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                }
              }));

            const dbSublets: SubletListing[] = data
              .filter((d: any) => d.category === 'sublet')
              .map((d: any) => ({
                id: d.id,
                userId: d.user_id,
                title: d.title,
                neighborhood: d.neighborhood,
                address: d.address,
                subletPrice: Number(d.price),
                originalRent: Math.round(Number(d.price) * 1.15),
                term: d.sublet_term || 'Summer (May 1 - Aug 31)',
                startDate: 'May 1, 2026',
                endDate: 'August 31, 2026',
                bedroomsTotal: d.bedrooms,
                bathroomsTotal: d.bathrooms,
                subletScope: 'Entire Apartment',
                isFurnished: d.is_furnished || true,
                furnitureIncluded: ['Bed & Mattress', 'Study Desk', 'Sofa'],
                utilitiesIncluded: true,
                wifiIncluded: true,
                transitTimes: { dalStudley: 10, dalSexton: 12, smu: 15, msvu: 22, nscc: 25 },
                images: d.images?.length > 0 ? d.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
                isStudentVerified: true,
                studentAffiliation: 'Dalhousie',
                description: d.description || '',
                lister: {
                  name: 'Student Lister',
                  email: 'student@dal.ca',
                  university: 'Dalhousie',
                  major: 'Computer Science',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
              }));

            if (dbRentals.length > 0) setRentals(dbRentals);
            if (dbSublets.length > 0) setSublets(dbSublets);
          }
        } catch (e) {
          console.error('Error fetching Supabase listings', e);
        }
      };
      fetchListings();
    }
  }, []);

  // Handle new listing submission
  const handleListingCreated = (item: any) => {
    if (item.subletPrice !== undefined) {
      setSublets(prev => {
        const updated = [item, ...prev];
        localStorage.setItem('hfx_local_sublets', JSON.stringify(updated));
        return updated;
      });
      setActiveTab('sublets');
    } else if (item.lifestyle !== undefined) {
      setRoommates(prev => [item, ...prev]);
      setActiveTab('roommates');
    } else {
      setRentals(prev => {
        const updated = [item, ...prev];
        localStorage.setItem('hfx_local_rentals', JSON.stringify(updated));
        return updated;
      });
      setActiveTab('rentals');
    }
  };

  // Handle listing edit
  const handleSaveListing = async (updated: RentalListing | SubletListing) => {
    if ('price' in updated) {
      setRentals(prev => {
        const next = prev.map(r => r.id === updated.id ? (updated as RentalListing) : r);
        localStorage.setItem('hfx_local_rentals', JSON.stringify(next));
        return next;
      });
    } else {
      setSublets(prev => {
        const next = prev.map(s => s.id === updated.id ? (updated as SubletListing) : s);
        localStorage.setItem('hfx_local_sublets', JSON.stringify(next));
        return next;
      });
    }

    if (supabase) {
      try {
        await supabase.from('listings').update({
          title: updated.title,
          neighborhood: updated.neighborhood,
          address: updated.address,
          price: 'price' in updated ? (updated as RentalListing).price : (updated as SubletListing).subletPrice,
          description: updated.description,
          images: updated.images
        }).eq('id', updated.id);
      } catch (err) {
        console.warn('Could not update in Supabase', err);
      }
    }
  };

  // Handle listing delete
  const handleDeleteListing = async (listingId: string) => {
    setRentals(prev => {
      const next = prev.filter(r => r.id !== listingId);
      localStorage.setItem('hfx_local_rentals', JSON.stringify(next));
      return next;
    });
    setSublets(prev => {
      const next = prev.filter(s => s.id !== listingId);
      localStorage.setItem('hfx_local_sublets', JSON.stringify(next));
      return next;
    });

    if (supabase) {
      try {
        await supabase.from('listings').delete().eq('id', listingId);
      } catch (err) {
        console.warn('Could not delete in Supabase', err);
      }
    }
  };

  // Load sample demo data on demand
  const handleLoadSampleData = () => {
    setRentals(MOCK_RENTALS);
    setSublets(MOCK_SUBLETS);
    localStorage.setItem('hfx_local_rentals', JSON.stringify(MOCK_RENTALS));
    localStorage.setItem('hfx_local_sublets', JSON.stringify(MOCK_SUBLETS));
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
        onOpenAuth={() => setIsAuthOpen(true)}
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
                    onOpenChat={(item) => setChatListing(item)}
                    onEditListing={(item) => setEditingListing(item)}
                    onDeleteListing={handleDeleteListing}
                    isOwner={user ? rental.userId === user.id : true}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <SearchX className="empty-state-icon" />
                  <h3 className="empty-state-title">
                    {rentals.length === 0 ? 'No rentals posted yet' : 'No rentals match your filters'}
                  </h3>
                  <p className="empty-state-desc">
                    {rentals.length === 0
                      ? 'Be the first Halifax landlord or property manager to post an available unit on HfxRentals!'
                      : 'Try adjusting your maximum budget or toggling off specific filters like heating or winter parking.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => setIsPostListingOpen(true)}>
                      <PlusCircle size={16} />
                      Post a Rental Listing
                    </button>
                    {rentals.length === 0 ? (
                      <button className="btn btn-secondary" onClick={handleLoadSampleData}>
                        <Database size={15} />
                        Load Sample Halifax Units
                      </button>
                    ) : (
                      <button className="btn btn-secondary" onClick={handleResetFilters}>
                        Reset All Filters
                      </button>
                    )}
                  </div>
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
                    onOpenChat={(item) => setChatListing(item)}
                    onEditListing={(item) => setEditingListing(item)}
                    onDeleteListing={handleDeleteListing}
                    isOwner={user ? sublet.userId === user.id : true}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <SearchX className="empty-state-icon" />
                  <h3 className="empty-state-title">
                    {sublets.length === 0 ? 'No student sublets posted yet' : 'No sublets match your filters'}
                  </h3>
                  <p className="empty-state-desc">
                    {sublets.length === 0
                      ? 'Are you heading away for a co-op or summer term? Sublet your room to Dalhousie, SMU, or MSVU students.'
                      : 'No active student sublets match this term or price. Try changing the academic term filter.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => setIsPostListingOpen(true)}>
                      <PlusCircle size={16} />
                      Post a Sublet
                    </button>
                    {sublets.length === 0 ? (
                      <button className="btn btn-secondary" onClick={handleLoadSampleData}>
                        <Database size={15} />
                        Load Sample Halifax Units
                      </button>
                    ) : (
                      <button className="btn btn-secondary" onClick={handleResetFilters}>
                        Reset Filters
                      </button>
                    )}
                  </div>
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
          onOpenChat={(item) => {
            setSelectedListing(null);
            setChatListing(item);
          }}
          onEditListing={(item) => {
            setSelectedListing(null);
            setEditingListing(item);
          }}
          onDeleteListing={handleDeleteListing}
          isOwner={user ? selectedListing.userId === user.id : true}
        />
      )}

      {schedulingListing && (
        <ViewingSchedulerModal
          listing={schedulingListing}
          onClose={() => setSchedulingListing(null)}
        />
      )}

      {chatListing && (
        <ChatModal
          listing={chatListing}
          onClose={() => setChatListing(null)}
          onOpenViewingScheduler={(item) => {
            setChatListing(null);
            setSchedulingListing(item);
          }}
        />
      )}

      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSave={handleSaveListing}
          onDelete={handleDeleteListing}
        />
      )}

      {isPostListingOpen && (
        <PostListingModal
          onClose={() => setIsPostListingOpen(false)}
          onListingCreated={handleListingCreated}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

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
