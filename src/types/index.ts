export type TabType = 'rentals' | 'sublets' | 'roommates' | 'scam-shield';

export type HalifaxNeighborhood = 
  | 'South End'
  | 'North End'
  | 'Downtown Halifax'
  | 'West End / Quinpool'
  | 'Downtown Dartmouth'
  | 'North Dartmouth'
  | 'Clayton Park'
  | 'Bedford'
  | 'Fairview';

export type HeatingType = 
  | 'Heat & Hot Water Included'
  | 'Heat Pump (Ductless)'
  | 'Electric Baseboard'
  | 'Natural Gas'
  | 'Oil Radiator';

export type WinterParkingStatus = 
  | 'Heated Underground'
  | 'Assigned Driveway'
  | 'Off-Street Paved'
  | 'Street Permit Only (Watch Winter Ban)'
  | 'No Parking';

export type LeaseType = 
  | 'Periodic (Year-to-Year, Rent Cap Protected)'
  | 'Fixed-Term (Specified End Date)'
  | 'Month-to-Month'
  | 'Lease Assignment / Takeover';

export type CampusTransitTimes = {
  dalStudley: number; // minutes by transit/walk
  dalSexton: number;
  smu: number;
  msvu: number;
  nscc: number;
  ferryTerminal?: number;
};

export interface ViewingSlot {
  id: string;
  date: string; // e.g. "Tomorrow (Sept 16)"
  time: string; // e.g. "4:30 PM - 5:00 PM"
  type: 'In-Person Walkthrough' | 'Live Video Tour (Google Meet)' | 'Open House Window';
  availableSpots: number;
}

export interface RentalListing {
  id: string;
  title: string;
  neighborhood: HalifaxNeighborhood;
  address: string;
  price: number; // per month CAD
  bedrooms: number;
  bathrooms: number;
  propertyType: 'Apartment' | 'Flat / Heritage House' | 'Condo' | 'Townhouse' | 'Basement Suite';
  sqft?: number;
  images: string[];
  heatingType: HeatingType;
  estimatedWinterUtilities: number; // estimated CAD extra per month in cold months
  winterParking: WinterParkingStatus;
  leaseType: LeaseType;
  petPolicy: 'Dogs & Cats Welcome' | 'Cats Only' | 'Small Dogs Under 25lbs' | 'No Pets';
  transitTimes: CampusTransitTimes;
  availableDate: string;
  isVerifiedLandlord: boolean;
  isFeaturedBoost?: boolean;
  amenities: string[];
  description: string;
  viewingSlots?: ViewingSlot[];
  googleCalendarConnected?: boolean;
  landlord: {
    name: string;
    company?: string;
    phone?: string;
    email: string;
    verifiedSince: string;
    responseRate: string;
    avatar: string;
  };
}

export type SubletTerm = 'Summer (May 1 - Aug 31)' | 'Fall (Sept 1 - Dec 31)' | 'Winter (Jan 1 - Apr 30)' | 'Custom / Flexible';

export interface SubletListing {
  id: string;
  title: string;
  neighborhood: HalifaxNeighborhood;
  address: string;
  subletPrice: number; // CAD
  originalRent: number; // CAD
  term: SubletTerm;
  startDate: string;
  endDate: string;
  bedroomsTotal: number;
  bathroomsTotal: number;
  subletScope: 'Private Bedroom in Shared Flat' | 'Entire Apartment';
  isFurnished: boolean;
  furnitureIncluded: string[]; // e.g. ["Double Bed", "Study Desk & Chair", "Dresser"]
  utilitiesIncluded: boolean;
  wifiIncluded: boolean;
  transitTimes: CampusTransitTimes;
  images: string[];
  isUrgentBoost?: boolean;
  isStudentVerified: boolean;
  studentAffiliation?: 'Dalhousie' | 'Saint Mary\'s' | 'MSVU' | 'NSCAD' | 'NSCC';
  description: string;
  viewingSlots?: ViewingSlot[];
  googleCalendarConnected?: boolean;
  lister: {
    name: string;
    university?: string;
    major?: string;
    email: string;
    avatar: string;
  };
}

export interface RoommateProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Non-Binary';
  lookingFor: 'Room to Rent' | 'Buddy Up for a 2-3 Bed Flat' | 'Roommate for My Existing Place';
  targetBudget: number; // CAD max / month
  targetNeighborhoods: HalifaxNeighborhood[];
  targetMoveIn: string;
  university?: 'Dalhousie' | 'Saint Mary\'s' | 'MSVU' | 'NSCAD' | 'NSCC' | 'Working Professional';
  programOrJob: string;
  isStudentVerified: boolean;
  hasFastPassVerified: boolean;
  avatar: string;
  bio: string;
  lifestyle: {
    cleanliness: 'Neat & Tidy' | 'Moderate / Relaxed' | 'Spotless / Chores Chart';
    sleepSchedule: 'Early Bird (Up by 7am)' | 'Night Owl (Up late)' | 'Flexible';
    socialGuests: 'Quiet & Studious' | 'Occasional Weekend Friends' | 'Social & Outgoing';
    dietary: 'Vegetarian / Vegan' | 'Halal Friendly' | 'No Restrictions' | 'Gluten-Free';
    substances: 'Non-Smoker / Non-Drinker' | 'Social Drinker' | '420 Friendly (Outdoor only)';
    petComfort: 'Loves Pets' | 'Has a Cat/Dog' | 'Allergic to Cats/Dogs' | 'No Preference';
    preferredHousehold: 'All Female' | 'All Male' | 'Co-ed Welcome' | 'LGBTQ+ Friendly';
  };
}

export interface FilterState {
  searchQuery: string;
  neighborhood: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string; // 'all' | '0' | '1' | '2' | '3+'
  petFriendlyOnly: boolean;
  heatIncludedOnly: boolean;
  parkingIncludedOnly: boolean;
  verifiedOnly: boolean;
  campusFilter: 'all' | 'dalStudley' | 'dalSexton' | 'smu' | 'msvu' | 'nscc';
  maxTransitMins: number;
  // Sublet specific
  subletTerm: string;
  furnishedOnly: boolean;
  // Roommate specific
  roommateLookingFor: string;
  genderPref: string;
}
