import type { RentalListing, SubletListing, RoommateProfile } from '../types';

export const HALIFAX_NEIGHBORHOODS = [
  'South End',
  'North End',
  'Downtown Halifax',
  'West End / Quinpool',
  'Downtown Dartmouth',
  'North Dartmouth',
  'Clayton Park',
  'Bedford',
  'Fairview'
] as const;

export const CAMPUS_OPTIONS = [
  { id: 'all', name: 'Any Campus / Area' },
  { id: 'dalStudley', name: 'Dalhousie - Studley Campus (South End)' },
  { id: 'dalSexton', name: 'Dalhousie - Sexton Campus (Downtown / Engineering)' },
  { id: 'smu', name: 'Saint Mary\'s University - SMU (South End)' },
  { id: 'msvu', name: 'Mount Saint Vincent University - MSVU (Bedford Hwy)' },
  { id: 'nscc', name: 'NSCC - Ivany Campus (Dartmouth Waterfront)' }
];

export const MOCK_RENTALS: RentalListing[] = [
  {
    id: 'hfx-rent-01',
    title: 'Sunlit South End Flat near Dalhousie Studley Campus',
    neighborhood: 'South End',
    address: '1340 LeMarchant Street, Halifax, NS',
    price: 2150,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Flat / Heritage House',
    sqft: 850,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Heat & Hot Water Included',
    estimatedWinterUtilities: 45,
    winterParking: 'Assigned Driveway',
    leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
    petPolicy: 'Cats Only',
    transitTimes: {
      dalStudley: 4,
      dalSexton: 14,
      smu: 12,
      msvu: 28,
      nscc: 32,
      ferryTerminal: 16
    },
    availableDate: 'Sept 1, 2026',
    isVerifiedLandlord: true,
    isFeaturedBoost: true,
    googleCalendarConnected: true,
    viewingSlots: [
      { id: 'vs-1', date: 'Tomorrow (Wednesday)', time: '4:30 PM - 5:00 PM', type: 'In-Person Walkthrough', availableSpots: 2 },
      { id: 'vs-2', date: 'Thursday', time: '5:30 PM - 6:00 PM', type: 'Live Video Tour (Google Meet)', availableSpots: 1 },
      { id: 'vs-3', date: 'Saturday', time: '1:00 PM - 3:00 PM', type: 'Open House Window', availableSpots: 5 }
    ],
    amenities: ['In-Building Laundry', 'Hardwood Floors', 'Dishwasher', 'Shared Backyard Garden', 'Storage Locker'],
    description: 'Charming upper flat in a quintessential South End Victorian. Massive windows with high ceilings, freshly updated kitchen with stainless appliances. Only 3 blocks from the Dalhousie Killam Library and sub-15 minutes walk to Spring Garden Road.',
    landlord: {
      name: 'Robert & Eleanor MacLeod',
      company: 'South End Properties Ltd.',
      email: 'macleod.rentals@halifaxflats.ca',
      verifiedSince: '2021',
      responseRate: 'Under 1 hour',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-02',
    title: 'Modern Hydrostone Condo with Harbour View & Heat Pump',
    neighborhood: 'North End',
    address: '5530 Agricola Street, Halifax, NS',
    price: 1850,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Condo',
    sqft: 640,
    images: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Heat Pump (Ductless)',
    estimatedWinterUtilities: 85,
    winterParking: 'Heated Underground',
    leaseType: 'Fixed-Term (Specified End Date)',
    petPolicy: 'Dogs & Cats Welcome',
    transitTimes: {
      dalStudley: 18,
      dalSexton: 12,
      smu: 22,
      msvu: 24,
      nscc: 25,
      ferryTerminal: 14
    },
    availableDate: 'Immediate / Oct 1',
    isVerifiedLandlord: true,
    isFeaturedBoost: false,
    amenities: ['Air Conditioning (Heat Pump)', 'In-Unit Washer & Dryer', 'Fitness Center', 'Rooftop Terrace', 'Underground Bike Storage'],
    description: 'Boutique concrete construction right in the heart of Agricola North End. Walk downstairs to local bakeries, craft breweries, and Halifax Transit #7 and #8 routes. Very low winter electric heating bills thanks to modern mini-split heat pump.',
    landlord: {
      name: 'Sarah Chen (Paramount PM)',
      company: 'Paramount Property Management',
      email: 'schen@paramountpm.ca',
      verifiedSince: '2019',
      responseRate: 'Within 3 hours',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-03',
    title: 'Spacious 3-Bedroom Student House off Quinpool Road',
    neighborhood: 'West End / Quinpool',
    address: '6210 Harvard Street, Halifax, NS',
    price: 2850,
    bedrooms: 3,
    bathrooms: 1.5,
    propertyType: 'Flat / Heritage House',
    sqft: 1250,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Oil Radiator',
    estimatedWinterUtilities: 290,
    winterParking: 'Off-Street Paved',
    leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
    petPolicy: 'Dogs & Cats Welcome',
    transitTimes: {
      dalStudley: 10,
      dalSexton: 16,
      smu: 16,
      msvu: 22,
      nscc: 30,
      ferryTerminal: 20
    },
    availableDate: 'Sept 1, 2026',
    isVerifiedLandlord: true,
    isFeaturedBoost: false,
    amenities: ['Private Driveway (2 cars)', 'Laundry in Basement', 'Backyard Deck for BBQ', 'Dishwasher', 'Near Superstore & NSLC'],
    description: 'Perfect setup for 3 students or working roommates looking to share. Big kitchen with full dishwasher, large living room, and a rear deck. 5-minute walk to Atlantic Superstore on Quinpool, Oxford bus lines, and 10-minute walk to Dalhousie.',
    landlord: {
      name: 'Mark Henderson',
      company: 'Quinpool Residential Co.',
      email: 'm.henderson@quinpoolrentals.com',
      verifiedSince: '2022',
      responseRate: 'Within 2 hours',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-04',
    title: 'Downtown Dartmouth Waterfront 1-Bed (Ferry to Halifax DT in 12m)',
    neighborhood: 'Downtown Dartmouth',
    address: '88 Alderney Drive, Dartmouth, NS',
    price: 1595,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Condo',
    sqft: 590,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b2b93e000?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Natural Gas',
    estimatedWinterUtilities: 60,
    winterParking: 'Heated Underground',
    leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
    petPolicy: 'Cats Only',
    transitTimes: {
      dalStudley: 26,
      dalSexton: 14,
      smu: 28,
      msvu: 34,
      nscc: 10,
      ferryTerminal: 3
    },
    availableDate: 'Nov 1, 2026',
    isVerifiedLandlord: true,
    isFeaturedBoost: true,
    amenities: ['3-Minute Walk to Alderney Ferry', 'Underground Parking Included', 'Floor-to-Ceiling Windows', 'In-Unit Washer/Dryer'],
    description: 'Live in vibrant Downtown Dartmouth across from Alderney Landing! Walk 3 minutes to the ferry terminal and enjoy a 12-minute scenic commute directly to downtown Halifax waterfront. Exceptional local coffee shops (Two If By Sea), cideries, and parks.',
    landlord: {
      name: 'Dartmouth Coastal Living',
      company: 'Harbourfront Holdings',
      email: 'leasing@dartmouthwaterfront.ca',
      verifiedSince: '2020',
      responseRate: 'Under 1 hour',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-05',
    title: 'Cozy 2-Bedroom Suite on Bedford Highway near MSVU',
    neighborhood: 'Bedford',
    address: '1240 Bedford Highway, Halifax, NS',
    price: 1750,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    sqft: 810,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Heat & Hot Water Included',
    estimatedWinterUtilities: 40,
    winterParking: 'Assigned Driveway',
    leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
    petPolicy: 'Dogs & Cats Welcome',
    transitTimes: {
      dalStudley: 32,
      dalSexton: 28,
      smu: 35,
      msvu: 6,
      nscc: 30,
      ferryTerminal: 25
    },
    availableDate: 'Immediate',
    isVerifiedLandlord: true,
    isFeaturedBoost: false,
    amenities: ['Waterfront Basin Views', 'Heat & Hot Water Included', 'Express Bus #8 to Downtown Halifax', 'Quiet Building'],
    description: 'Overlooking the Bedford Basin, just a 5-minute direct bus or 15-minute walk to Mount Saint Vincent University (MSVU). Quiet residential area, heat and hot water included in rent, excellent for students or young working couples.',
    landlord: {
      name: 'Peter MacIntyre',
      email: 'bedfordbasinliving@gmail.com',
      verifiedSince: '2023',
      responseRate: 'Within 6 hours',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-06',
    title: 'Spring Garden Luxury Studio with Balcony & City Views',
    neighborhood: 'Downtown Halifax',
    address: '5650 Spring Garden Road, Halifax, NS',
    price: 1695,
    bedrooms: 0,
    bathrooms: 1,
    propertyType: 'Condo',
    sqft: 480,
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Electric Baseboard',
    estimatedWinterUtilities: 110,
    winterParking: 'No Parking',
    leaseType: 'Fixed-Term (Specified End Date)',
    petPolicy: 'No Pets',
    transitTimes: {
      dalStudley: 10,
      dalSexton: 6,
      smu: 12,
      msvu: 26,
      nscc: 22,
      ferryTerminal: 8
    },
    availableDate: 'Oct 1, 2026',
    isVerifiedLandlord: true,
    isFeaturedBoost: false,
    amenities: ['Private Balcony', '24/7 Security Concierge', 'Gym & Sauna in Building', 'Walk to Halifax Central Library'],
    description: 'Ultimate convenience on Spring Garden Road. Literally steps from restaurants, cinema, Halifax Central Library, and Dalhousie Sexton Engineering campus. Clean minimalist studio with private balcony and granite countertops.',
    landlord: {
      name: 'Atlantic Urban Living',
      company: 'Southwest Properties Partner',
      email: 'rent@atlanticurban.ca',
      verifiedSince: '2018',
      responseRate: 'Under 1 hour',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-07',
    title: 'Affordable 2-Bed Flat in Clayton Park near Transit Hub',
    neighborhood: 'Clayton Park',
    address: '150 Lacewood Drive, Halifax, NS',
    price: 1650,
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'Apartment',
    sqft: 780,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Heat & Hot Water Included',
    estimatedWinterUtilities: 40,
    winterParking: 'Off-Street Paved',
    leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
    petPolicy: 'Cats Only',
    transitTimes: {
      dalStudley: 24,
      dalSexton: 26,
      smu: 28,
      msvu: 14,
      nscc: 35,
      ferryTerminal: 25
    },
    availableDate: 'Immediate',
    isVerifiedLandlord: false,
    isFeaturedBoost: false,
    amenities: ['Lacewood Transit Terminal across street', 'Heat Included', 'Assigned Parking Stalls', 'Close to Canada Games Centre'],
    description: 'Great value in Clayton Park West! Directly beside the Lacewood Transit terminal offering express bus lines to universities and downtown. Grocery shopping (Sobeys) and Canada Games Centre pool/gym within walking distance.',
    landlord: {
      name: 'George Papadopoulos',
      email: 'george.claytonpark@hotmail.com',
      verifiedSince: '2024',
      responseRate: 'Within 5 hours',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'hfx-rent-08',
    title: 'Executive 3-Bed Townhouse in South End with Garage',
    neighborhood: 'South End',
    address: '1080 Wellington Street, Halifax, NS',
    price: 3300,
    bedrooms: 3,
    bathrooms: 2.5,
    propertyType: 'Townhouse',
    sqft: 1650,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    heatingType: 'Natural Gas',
    estimatedWinterUtilities: 140,
    winterParking: 'Heated Underground',
    leaseType: 'Periodic (Year-to-Year, Rent Cap Protected)',
    petPolicy: 'Dogs & Cats Welcome',
    transitTimes: {
      dalStudley: 8,
      dalSexton: 10,
      smu: 6,
      msvu: 28,
      nscc: 25,
      ferryTerminal: 12
    },
    availableDate: 'Oct 1, 2026',
    isVerifiedLandlord: true,
    isFeaturedBoost: true,
    amenities: ['Attached Heated Garage', 'Private Fenced Yard', 'Primary Ensuite with Soaker Tub', 'Gas Fireplace'],
    description: 'Premier South End townhome between Dalhousie and Saint Mary\'s campuses. High-end granite kitchen, dual heat pump heating/cooling, and an attached garage that completely solves the winter street parking bans.',
    landlord: {
      name: 'Victoria Maritime Realty',
      company: 'Victoria Property Holdings',
      email: 'info@victoriamaritime.ca',
      verifiedSince: '2017',
      responseRate: 'Under 1 hour',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80'
    }
  }
];

export const MOCK_SUBLETS: SubletListing[] = [
  {
    id: 'sublet-01',
    title: 'Bright Summer Sublet 3m from Dal Quad (Furnished Bed + Desk)',
    neighborhood: 'South End',
    address: '1410 Edward Street, Halifax, NS',
    subletPrice: 795,
    originalRent: 1050,
    term: 'Summer (May 1 - Aug 31)',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    bedroomsTotal: 3,
    bathroomsTotal: 1,
    subletScope: 'Private Bedroom in Shared Flat',
    isFurnished: true,
    furnitureIncluded: ['Double Bed with Mattress', 'Large Study Desk & Ergonomic Chair', 'Bookshelf', 'Closet Organizer', 'Desk Lamp'],
    utilitiesIncluded: true,
    wifiIncluded: true,
    transitTimes: {
      dalStudley: 3,
      dalSexton: 14,
      smu: 12,
      msvu: 28,
      nscc: 30
    },
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
    ],
    isUrgentBoost: true,
    isStudentVerified: true,
    studentAffiliation: 'Dalhousie',
    googleCalendarConnected: true,
    viewingSlots: [
      { id: 'sub-vs-1', date: 'Today (Tuesday)', time: '6:00 PM - 6:30 PM', type: 'Live Video Tour (Google Meet)', availableSpots: 1 },
      { id: 'sub-vs-2', date: 'Friday', time: '3:00 PM - 3:30 PM', type: 'In-Person Walkthrough', availableSpots: 2 }
    ],
    description: 'Going back to Calgary for summer co-op! Subletting my spacious private room in a 3-bedroom flat. Two quiet Dalhousie engineering students staying in the other rooms. High-speed Bell Fibe Wi-Fi and all utilities fully included. Great summer base.',
    lister: {
      name: 'Liam Fraser',
      university: 'Dalhousie University',
      major: 'Computer Science (3rd Year)',
      email: 'liam.fraser@dal.ca',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'sublet-02',
    title: 'Entire 1-Bed North End Loft for Summer (Hydrostone Area)',
    neighborhood: 'North End',
    address: '2600 Gottingen Street, Halifax, NS',
    subletPrice: 1450,
    originalRent: 1800,
    term: 'Summer (May 1 - Aug 31)',
    startDate: '2026-05-01',
    endDate: '2026-08-31',
    bedroomsTotal: 1,
    bathroomsTotal: 1,
    subletScope: 'Entire Apartment',
    isFurnished: true,
    furnitureIncluded: ['Queen Bed', 'Sofa & Smart TV', 'Dining Table for 4', 'Patio Chairs', 'Fully Stocked Kitchen'],
    utilitiesIncluded: true,
    wifiIncluded: true,
    transitTimes: {
      dalStudley: 18,
      dalSexton: 10,
      smu: 22,
      msvu: 22,
      nscc: 20
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    isUrgentBoost: true,
    isStudentVerified: true,
    studentAffiliation: 'NSCAD',
    description: 'Subletting my whole private 1-bedroom loft while I do an artist residency in Montreal. Includes private balcony, dishwasher, in-unit laundry, and plants that need light watering. Walk to good cafes and restaurants.',
    lister: {
      name: 'Maya Tremblay',
      university: 'NSCAD University',
      major: 'Fine Arts (Master\'s)',
      email: 'maya.t@nscad.ca',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'sublet-03',
    title: 'Cozy Room in 2-Bed Flat near Saint Mary\'s University (SMU)',
    neighborhood: 'South End',
    address: '920 Tower Road, Halifax, NS',
    subletPrice: 850,
    originalRent: 1000,
    term: 'Fall (Sept 1 - Dec 31)',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    bedroomsTotal: 2,
    bathroomsTotal: 1,
    subletScope: 'Private Bedroom in Shared Flat',
    isFurnished: true,
    furnitureIncluded: ['Double Bed', 'Study Desk', 'Dresser', 'Built-in Closet'],
    utilitiesIncluded: true,
    wifiIncluded: true,
    transitTimes: {
      dalStudley: 8,
      dalSexton: 12,
      smu: 4,
      msvu: 30,
      nscc: 28
    },
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4b49?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    isUrgentBoost: false,
    isStudentVerified: true,
    studentAffiliation: 'Saint Mary\'s',
    description: 'Doing a fall study-abroad semester in Germany. Subletting my room in a peaceful Tower Road flat. My roommate is a 4th year SMU Finance major who is clean, polite, and studies a lot. 4-minute walk to SMU campus and Point Pleasant Park.',
    lister: {
      name: 'Amir Al-Hassan',
      university: 'Saint Mary\'s University',
      major: 'Sobey School of Business',
      email: 'amir.alhassan@smu.ca',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  },
  {
    id: 'sublet-04',
    title: 'Winter Term Room with Private Bath on Quinpool',
    neighborhood: 'West End / Quinpool',
    address: '6100 Quinpool Road, Halifax, NS',
    subletPrice: 920,
    originalRent: 1100,
    term: 'Winter (Jan 1 - Apr 30)',
    startDate: '2027-01-01',
    endDate: '2027-04-30',
    bedroomsTotal: 2,
    bathroomsTotal: 2,
    subletScope: 'Private Bedroom in Shared Flat',
    isFurnished: true,
    furnitureIncluded: ['Queen Bed', 'Standing Desk', 'Monitor', 'Walk-in Closet'],
    utilitiesIncluded: true,
    wifiIncluded: true,
    transitTimes: {
      dalStudley: 10,
      dalSexton: 14,
      smu: 16,
      msvu: 20,
      nscc: 28
    },
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    isUrgentBoost: false,
    isStudentVerified: true,
    studentAffiliation: 'Dalhousie',
    description: 'Away for 4-month co-op in Ottawa. You get your own private ensuite bathroom! Modern kitchen with dishwasher and heat pump. 1 block from Quinpool Superstore and bus stops.',
    lister: {
      name: 'Chloe MacDonald',
      university: 'Dalhousie University',
      major: 'Nursing (3rd Year)',
      email: 'chloe.m@dal.ca',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    }
  }
];

export const MOCK_ROOMMATES: RoommateProfile[] = [
  {
    id: 'roomie-01',
    name: 'Aisha Patel',
    age: 21,
    gender: 'Female',
    lookingFor: 'Buddy Up for a 2-3 Bed Flat',
    targetBudget: 950,
    targetNeighborhoods: ['South End', 'West End / Quinpool'],
    targetMoveIn: 'Sept 1, 2026',
    university: 'Dalhousie',
    programOrJob: '3rd Year Microbiology',
    isStudentVerified: true,
    hasFastPassVerified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Hi! I\'m Aisha. I study long hours at Killam library, love baking banana bread on weekends, and keep common spaces very tidy. Looking for 1 or 2 female roommates to team up and sign a nice 2 or 3-bedroom flat in the South End or Quinpool area.',
    lifestyle: {
      cleanliness: 'Spotless / Chores Chart',
      sleepSchedule: 'Early Bird (Up by 7am)',
      socialGuests: 'Occasional Weekend Friends',
      dietary: 'Vegetarian / Vegan',
      substances: 'Non-Smoker / Non-Drinker',
      petComfort: 'Loves Pets',
      preferredHousehold: 'All Female'
    }
  },
  {
    id: 'roomie-02',
    name: 'Marcus Bell',
    age: 23,
    gender: 'Male',
    lookingFor: 'Room to Rent',
    targetBudget: 850,
    targetNeighborhoods: ['North End', 'Downtown Halifax', 'West End / Quinpool'],
    targetMoveIn: 'Oct 1, 2026',
    university: 'Working Professional',
    programOrJob: 'Junior Software Developer at Cove Halifax',
    isStudentVerified: false,
    hasFastPassVerified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Halifax local working in ocean tech downtown. Into bouldering at Seven Bays, trail running at Point Pleasant, and quiet evenings playing guitar (with headphones). Very reliable with rent and utilities.',
    lifestyle: {
      cleanliness: 'Neat & Tidy',
      sleepSchedule: 'Flexible',
      socialGuests: 'Quiet & Studious',
      dietary: 'No Restrictions',
      substances: 'Social Drinker',
      petComfort: 'Has a Cat/Dog',
      preferredHousehold: 'Co-ed Welcome'
    }
  },
  {
    id: 'roomie-03',
    name: 'Devon Tremblay',
    age: 20,
    gender: 'Non-Binary',
    lookingFor: 'Buddy Up for a 2-3 Bed Flat',
    targetBudget: 800,
    targetNeighborhoods: ['North End', 'Downtown Dartmouth'],
    targetMoveIn: 'Sept 1, 2026',
    university: 'NSCAD',
    programOrJob: 'Design & Interdisciplinary Arts',
    isStudentVerified: true,
    hasFastPassVerified: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Art student at NSCAD. Plant collector, vintage thrifter, and tea enthusiast. Seeking an LGBTQ+ friendly household where everyone respects boundaries and communication is easy and kind.',
    lifestyle: {
      cleanliness: 'Moderate / Relaxed',
      sleepSchedule: 'Night Owl (Up late)',
      socialGuests: 'Occasional Weekend Friends',
      dietary: 'Vegetarian / Vegan',
      substances: '420 Friendly (Outdoor only)',
      petComfort: 'Loves Pets',
      preferredHousehold: 'LGBTQ+ Friendly'
    }
  },
  {
    id: 'roomie-04',
    name: 'Tariq Mansoor',
    age: 22,
    gender: 'Male',
    lookingFor: 'Roommate for My Existing Place',
    targetBudget: 900,
    targetNeighborhoods: ['South End'],
    targetMoveIn: 'Immediate',
    university: 'Saint Mary\'s',
    programOrJob: 'Master of Applied Economics (SMU)',
    isStudentVerified: true,
    hasFastPassVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'I currently have a lease on a 2-bedroom flat on Victoria Road ($1,800 total, split $900 each with heat included). My roommate graduated and moved away. Looking for a respectful, quiet student to take the 2nd bedroom.',
    lifestyle: {
      cleanliness: 'Neat & Tidy',
      sleepSchedule: 'Early Bird (Up by 7am)',
      socialGuests: 'Quiet & Studious',
      dietary: 'Halal Friendly',
      substances: 'Non-Smoker / Non-Drinker',
      petComfort: 'No Preference',
      preferredHousehold: 'All Male'
    }
  }
];
