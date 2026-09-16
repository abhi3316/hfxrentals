import React, { useState, useMemo, useEffect } from 'react';
import type { TabType, FilterState, RentalListing, SubletListing, RoommateProfile } from './types';
import { MOCK_RENTALS, MOCK_SUBLETS, MOCK_ROOMMATES } from './data/mockData';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { deleteListingPhotos } from './utils/storage';
import { isListingOwner as checkOwnership } from './utils/ownership';
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
import { AccountSettingsModal } from './components/AccountSettingsModal';
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

// Safe helper to persist to localStorage without hitting quota errors or crashing React
const safeSetLocalStorage = (key: string, data: any) => {
  try {
    // If saving listings, replace heavy data:image/ base64 strings to prevent QuotaExceededError
    const sanitized = Array.isArray(data) ? data.map(item => {
      if (item.images && Array.isArray(item.images)) {
        return {
          ...item,
          images: item.images.map((img: string) =>
            img && typeof img === 'string' && img.startsWith('data:image/')
              ? 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
              : img
          )
        };
      }
      return item;
    }) : data;

    localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (e) {
    console.warn(`localStorage save failed for ${key}:`, e);
  }
};

export const App: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('rentals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  
  // Listings data state: starts clean with 0 mock listings (or local/supabase items)
  // Listings data state: starts clean with 0 mock listings (or local/supabase items)
  const [rentals, setRentals] = useState<RentalListing[]>(() => {
    try {
      const local = localStorage.getItem('hfx_local_rentals');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      console.warn('Failed to parse localStorage rentals:', e);
      return [];
    }
  });
  const [sublets, setSublets] = useState<SubletListing[]>(() => {
    try {
      const local = localStorage.getItem('hfx_local_sublets');
      return local ? JSON.parse(local) : [];
    } catch (e) {
      console.warn('Failed to parse localStorage sublets:', e);
      return [];
    }
  });
  const [roommates, setRoommates] = useState<RoommateProfile[]>(MOCK_ROOMMATES);

  // Modals & Drawers state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isPostListingOpen, setIsPostListingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
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
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchAddr = (r.address || '').toLowerCase().includes(q);
        const matchNeigh = (r.neighborhood || '').toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAddr && !matchNeigh && !matchDesc) return false;
      }
      // Neighborhood
      if (selectedNeighborhood !== 'all' && r.neighborhood !== selectedNeighborhood) return false;
      // Max price
      if ((r.price || 0) > filters.maxPrice) return false;
      // Bedrooms
      if (filters.bedrooms !== 'all') {
        if (filters.bedrooms === '3+') {
          if ((r.bedrooms || 0) < 3) return false;
        } else if (r.bedrooms !== Number(filters.bedrooms)) {
          return false;
        }
      }
      // Heat included
      if (filters.heatIncludedOnly && !(r.heatingType || '').includes('Included')) return false;
      // Parking
      if (filters.parkingIncludedOnly && ((r.winterParking || '') === 'No Parking' || (r.winterParking || '').includes('Permit'))) return false;
      // Pet friendly
      if (filters.petFriendlyOnly && r.petPolicy === 'No Pets') return false;
      // Verified only
      if (filters.verifiedOnly && !r.isVerifiedLandlord) return false;
      // Campus filter
      if (filters.campusFilter !== 'all' && r.transitTimes) {
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
        const matchTitle = (s.title || '').toLowerCase().includes(q);
        const matchNeigh = (s.neighborhood || '').toLowerCase().includes(q);
        const matchDesc = (s.description || '').toLowerCase().includes(q);
        const matchUniv = (s.studentAffiliation || '').toLowerCase().includes(q);
        if (!matchTitle && !matchNeigh && !matchDesc && !matchUniv) return false;
      }
      if (selectedNeighborhood !== 'all' && s.neighborhood !== selectedNeighborhood) return false;
      if ((s.subletPrice || 0) > filters.maxPrice) return false;
      if (filters.subletTerm !== 'all') {
        if (filters.subletTerm === 'summer' && !(s.term || '').includes('Summer')) return false;
        if (filters.subletTerm === 'fall' && !(s.term || '').includes('Fall')) return false;
        if (filters.subletTerm === 'winter' && !(s.term || '').includes('Winter')) return false;
      }
      if (filters.furnishedOnly && !s.isFurnished) return false;
      if (filters.heatIncludedOnly && (!s.utilitiesIncluded || !s.wifiIncluded)) return false;
      if (filters.verifiedOnly && !s.isStudentVerified) return false;
      if (filters.campusFilter !== 'all' && s.transitTimes) {
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
  // Helper to identify if listing belongs to active session
  const isListingOwner = (userId?: string) => checkOwnership(user, userId);

  // Fetch live Supabase listings
  useEffect(() => {
    const client = supabase;
    if (client) {
      const fetchListings = async () => {
        try {
          let data: any[] | null = null;
          try {
            const res = await client.from('listings').select('*, profiles:user_id(full_name, email, avatar_url, role)');
            if (!res.error && res.data) {
              data = res.data;
            }
          } catch {
            // fallback if foreign key relationship is missing
          }
          if (!data) {
            const res = await client.from('listings').select('*');
            data = res.data;
          }

          if (data && Array.isArray(data)) {
            const dbRentals: RentalListing[] = data
              .filter((d: any) => d.category === 'rental')
              .map((d: any) => {
                const isAuthor = user && (d.user_id === user.id || d.user_id === 'local-landlord');
                const authorName = isAuthor 
                  ? user.name 
                  : (d.profiles?.full_name || d.landlord_name || (user?.name ? user.name : 'Halifax Landlord'));
                const authorEmail = isAuthor
                  ? user.email
                  : (d.profiles?.email || d.landlord_email || (user?.email ? user.email : 'landlord@hfxrentals.ca'));
                const authorAvatar = isAuthor
                  ? (user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')
                  : (d.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');

                return {
                  id: d.id,
                  userId: isAuthor ? user.id : d.user_id,
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
                    name: authorName,
                    email: authorEmail,
                    verifiedSince: '2026',
                    responseRate: 'Under 1 hour',
                    avatar: authorAvatar
                  }
                };
              });

            const dbSublets: SubletListing[] = data
              .filter((d: any) => d.category === 'sublet')
              .map((d: any) => {
                const isAuthor = user && (d.user_id === user.id || d.user_id === 'local-landlord');
                const authorName = isAuthor 
                  ? user.name 
                  : (d.profiles?.full_name || d.lister_name || (user?.name ? user.name : 'Student Lister'));
                const authorEmail = isAuthor
                  ? user.email
                  : (d.profiles?.email || d.lister_email || (user?.email ? user.email : 'student@dal.ca'));
                const authorAvatar = isAuthor
                  ? (user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')
                  : (d.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');

                return {
                  id: d.id,
                  userId: isAuthor ? user.id : d.user_id,
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
                    name: authorName,
                    email: authorEmail,
                    university: 'Dalhousie',
                    major: 'Computer Science',
                    avatar: authorAvatar
                  }
                };
              });

            // Synchronize state with Supabase data while preserving local-only custom listings
            setRentals(prev => {
              const localCustom = prev.filter(r => r.id.startsWith('custom-'));
              const combined = [...dbRentals, ...localCustom.filter(lc => !dbRentals.some(db => db.id === lc.id))];
              safeSetLocalStorage('hfx_local_rentals', combined);
              return combined;
            });
            setSublets(prev => {
              const localCustom = prev.filter(s => s.id.startsWith('custom-'));
              const combined = [...dbSublets, ...localCustom.filter(lc => !dbSublets.some(db => db.id === lc.id))];
              safeSetLocalStorage('hfx_local_sublets', combined);
              return combined;
            });
          }
        } catch (e) {
          console.error('Error fetching Supabase listings', e);
        }
      };
      fetchListings();
    }
  }, [user]);

  // Synchronize landlord and lister names with account name
  const handleUsernameUpdated = (newName: string) => {
    if (user) {
      setRentals(prev => {
        const next = prev.map(r => {
          if (
            r.userId === user.id ||
            r.userId === 'local-landlord' ||
            !r.userId ||
            r.landlord.name === 'Verified Landlord' ||
            r.landlord.name === 'Halifax Landlord' ||
            r.landlord.name === 'You (Landlord)'
          ) {
            return {
              ...r,
              userId: user.id,
              landlord: {
                ...r.landlord,
                name: newName,
                avatar: user.avatarUrl || r.landlord.avatar
              }
            };
          }
          return r;
        });
        localStorage.setItem('hfx_local_rentals', JSON.stringify(next));
        return next;
      });

      setSublets(prev => {
        const next = prev.map(s => {
          if (
            s.userId === user.id ||
            s.userId === 'local-landlord' ||
            !s.userId ||
            s.lister.name === 'Student Lister' ||
            s.lister.name === 'You (Landlord)'
          ) {
            return {
              ...s,
              userId: user.id,
              lister: {
                ...s.lister,
                name: newName,
                avatar: user.avatarUrl || s.lister.avatar
              }
            };
          }
          return s;
        });
        localStorage.setItem('hfx_local_sublets', JSON.stringify(next));
        return next;
      });
    }
  };

  // Keep landlord name in sync when user logs in or updates
  useEffect(() => {
    if (user?.name) {
      handleUsernameUpdated(user.name);
    }
  }, [user?.name, user?.id, user?.avatarUrl]);

  // Handle new listing submission
  const handleListingCreated = (item: any) => {
    if (item.subletPrice !== undefined) {
      setSublets(prev => {
        const updated = [item, ...prev];
        safeSetLocalStorage('hfx_local_sublets', updated);
        return updated;
      });
      setActiveTab('sublets');
    } else if (item.lifestyle !== undefined) {
      setRoommates(prev => [item, ...prev]);
      setActiveTab('roommates');
    } else {
      setRentals(prev => {
        const updated = [item, ...prev];
        safeSetLocalStorage('hfx_local_rentals', updated);
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
        safeSetLocalStorage('hfx_local_rentals', next);
        return next;
      });
    } else {
      setSublets(prev => {
        const next = prev.map(s => s.id === updated.id ? (updated as SubletListing) : s);
        safeSetLocalStorage('hfx_local_sublets', next);
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
    if (!user) {
      console.warn('[handleDeleteListing] Blocked: Unauthenticated visitor cannot delete listings.');
      alert('You must be signed in as the listing owner to delete a listing.');
      return;
    }

    // 1. Gather all image URLs from current React state
    const targetListing = rentals.find(r => r.id === listingId) || sublets.find(s => s.id === listingId);
    let imagesToDelete: string[] = targetListing?.images ? [...targetListing.images] : [];
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId);

    // 2. Also check Supabase directly in case the listing has images not cached in local state
    if (supabase) {
      try {
        let query = supabase.from('listings').select('images');
        if (isUUID) {
          query = query.eq('id', listingId);
        } else if (targetListing?.title) {
          query = query.eq('title', targetListing.title);
          if (user?.id) query = query.eq('user_id', user.id);
        }
        const { data: dbItems } = await query;
        if (dbItems && Array.isArray(dbItems)) {
          for (const item of dbItems) {
            if (item?.images && Array.isArray(item.images)) {
              imagesToDelete = Array.from(new Set([...imagesToDelete, ...item.images]));
            }
          }
        }
      } catch (err) {
        console.warn('Could not query listing images before delete', err);
      }
    }

    // 3. Delete listing row from Supabase database FIRST!
    let supabaseDeleted = false;
    let deleteError: any = null;

    if (supabase) {
      try {
        if (isUUID) {
          const res = await supabase.from('listings').delete().eq('id', listingId).select();
          if (res.error) {
            deleteError = res.error;
            console.error('[handleDeleteListing] Supabase delete error by ID:', res.error);
          } else if (res.data && res.data.length > 0) {
            supabaseDeleted = true;
            console.log('[handleDeleteListing] Successfully deleted listing row by ID:', res.data);
          } else {
            console.warn('[handleDeleteListing] 0 rows deleted by ID for UUID:', listingId);
          }
        }

        // Fallback by title if not deleted by UUID or if local ID was used
        if (!supabaseDeleted && targetListing?.title) {
          let fallbackQuery = supabase.from('listings').delete().eq('title', targetListing.title);
          if (user?.id) {
            fallbackQuery = fallbackQuery.eq('user_id', user.id);
          }
          const res = await fallbackQuery.select();
          if (res.data && res.data.length > 0) {
            supabaseDeleted = true;
            console.log('[handleDeleteListing] Deleted listing row via title fallback:', res.data);
          } else if (res.error && !deleteError) {
            deleteError = res.error;
            console.error('[handleDeleteListing] Title fallback delete error:', res.error);
          }
        }
      } catch (err) {
        deleteError = err;
        console.error('[handleDeleteListing] Exception deleting listing in Supabase:', err);
      }

      // Safety check: If this was a remote Supabase item (isUUID) and Supabase failed to delete the row,
      // halt photo/message purge to avoid leaving orphaned corrupt listings.
      if (isUUID && !supabaseDeleted) {
        const errorMsg = deleteError?.message || 'Database permission denied or Row Level Security (RLS) policy restricted deletion.';
        console.error(`[handleDeleteListing] Aborting cascade delete. Listing row ${listingId} was not removed from Supabase:`, errorMsg);
        alert(`Could not delete listing from database: ${errorMsg}\n\nPlease apply the updated SQL policy in your Supabase Dashboard SQL Editor.`);
        return;
      }
    }

    // 4. Purge image files from Supabase Storage bucket
    if (imagesToDelete.length > 0) {
      await deleteListingPhotos(imagesToDelete);
    }

    // 5. Delete all messages for this listing from Supabase database
    if (supabase) {
      try {
        await supabase.from('messages').delete().eq('listing_id', String(listingId));
      } catch (err) {
        console.warn('Could not delete messages in Supabase', err);
      }
    }

    // 6. Update React state & localStorage
    setRentals(prev => {
      const next = prev.filter(r => r.id !== listingId);
      safeSetLocalStorage('hfx_local_rentals', next);
      return next;
    });
    setSublets(prev => {
      const next = prev.filter(s => s.id !== listingId);
      safeSetLocalStorage('hfx_local_sublets', next);
      return next;
    });

    // 7. Remove local message cache from localStorage
    try {
      localStorage.removeItem(`hfx_private_msgs_${listingId}`);
    } catch {}
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
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
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
                filteredRentals.map(rental => {
                  const isOwner = isListingOwner(rental.userId);
                  const displayRental = isOwner && user ? {
                    ...rental,
                    userId: user.id,
                    landlord: {
                      ...(rental.landlord || {}),
                      name: user.name,
                      avatar: user.avatarUrl || rental.landlord?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                    }
                  } : rental;

                  return (
                    <RentalCard
                      key={rental.id}
                      listing={displayRental}
                      isFavorited={favorites.includes(rental.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelectListing={(item) => setSelectedListing(item)}
                      onScheduleViewing={(item) => setSchedulingListing(item)}
                      onOpenChat={(item) => setChatListing(item)}
                      onEditListing={(item) => setEditingListing(item)}
                      onDeleteListing={handleDeleteListing}
                      isOwner={isOwner}
                    />
                  );
                })
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
                filteredSublets.map(sublet => {
                  const isOwner = isListingOwner(sublet.userId);
                  const displaySublet = isOwner && user ? {
                    ...sublet,
                    userId: user.id,
                    lister: {
                      ...(sublet.lister || {}),
                      name: user.name,
                      avatar: user.avatarUrl || sublet.lister?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }
                  } : sublet;

                  return (
                    <SubletCard
                      key={sublet.id}
                      sublet={displaySublet}
                      isFavorited={favorites.includes(sublet.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelectSublet={(item) => setSelectedListing(item)}
                      onScheduleViewing={(item) => setSchedulingListing(item)}
                      onOpenChat={(item) => setChatListing(item)}
                      onEditListing={(item) => setEditingListing(item)}
                      onDeleteListing={handleDeleteListing}
                      isOwner={isOwner}
                    />
                  );
                })
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
      {selectedListing && (() => {
        const isOwner = isListingOwner(selectedListing.userId);
        const displaySelected = isOwner && user ? ('price' in selectedListing ? {
          ...selectedListing,
          userId: user.id,
          landlord: {
            ...selectedListing.landlord,
            name: user.name,
            avatar: user.avatarUrl || selectedListing.landlord.avatar
          }
        } : {
          ...selectedListing,
          userId: user.id,
          lister: {
            ...selectedListing.lister,
            name: user.name,
            avatar: user.avatarUrl || selectedListing.lister.avatar
          }
        }) : selectedListing;

        return (
          <ListingDetailModal
            listing={displaySelected}
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
            isOwner={isOwner}
          />
        );
      })()}

      {schedulingListing && (
        <ViewingSchedulerModal
          listing={schedulingListing}
          onClose={() => setSchedulingListing(null)}
        />
      )}

      {chatListing && (() => {
        const isOwner = isListingOwner(chatListing.userId);
        const displayChat = isOwner && user ? ('price' in chatListing ? {
          ...chatListing,
          userId: user.id,
          landlord: {
            ...chatListing.landlord,
            name: user.name,
            avatar: user.avatarUrl || chatListing.landlord.avatar
          }
        } : {
          ...chatListing,
          userId: user.id,
          lister: {
            ...chatListing.lister,
            name: user.name,
            avatar: user.avatarUrl || chatListing.lister.avatar
          }
        }) : chatListing;

        return (
          <ChatModal
            listing={displayChat}
            onClose={() => setChatListing(null)}
            onOpenViewingScheduler={(item) => {
              setChatListing(null);
              setSchedulingListing(item);
            }}
          />
        );
      })()}

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

      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        onUsernameUpdated={handleUsernameUpdated}
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
