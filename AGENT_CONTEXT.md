# AGENT_CONTEXT.md: HfxRentals

## Project Overview
* **Name**: HfxRentals
* **Purpose**: Hyper-local housing, student sublet, and roommate matching web application specifically tailored for the Halifax Regional Municipality (HRM), Nova Scotia.
* **Target Audience**: Students at Dalhousie University, Saint Mary's University (SMU), Mount Saint Vincent (MSVU), NSCAD, NSCC; working professionals; and local Halifax landlords/property managers.

## Key Modules & Unique Value Propositions
1. **Full Rentals Module**:
   * Halifax-specific filters: Heat & Hot Water included vs baseboard/oil, HRM winter street parking ban status (underground, driveway, street permit), and campus transit commute times.
   * True Cost Calculator: Base rent + estimated monthly winter utilities.
2. **Student Sublets Module**:
   * Academic term cycles: Summer (May 1 - Aug 31), Fall (Sept 1 - Dec 31), Winter (Jan 1 - Apr 30).
   * Subsidized rent discount badges, furnished item checklists, and university student verification.
3. **Roommate Matching Module ("Roomie Match HRM")**:
   * Lifestyle compatibility tags: Cleanliness, sleep schedule, dietary/kitchen preferences, pets, social habits, household gender preference.
   * Student email verification (`@dal.ca`, `@smu.ca`) and Verified Renter Fast-Pass™.
4. **Google Calendar Viewing Scheduler**:
   * Instant slot booking synced to landlord calendar (`ViewingSchedulerModal.tsx`).
   * Support for In-Person Walkthroughs and Live Video Tours (Google Meet / FaceTime) for remote students.
   * One-click "Add to Google Calendar" link generation (`https://calendar.google.com/calendar/render?...`) and .ics export.
5. **Scam Shield & Trust Layer**:
   * Remote student in-person inspection bookings ($69), Land registry ownership audits ($39), and Halifax rental scam warnings.
6. **Monetization Touchpoints**:
   * Microtransactions: $9.99 Urgent Sublet & Featured boosts.
   * Affiliate partnerships: Embedded instant Tenant Insurance quotes (mandatory in most HRM leases).
   * Verification products: Fast-Pass™ ($19) and remote physical inspections ($69).

## Tech Stack & Architecture
* **Frontend**: React 19 + TypeScript + Vite.
* **Styling**: Vanilla CSS design system with Atlantic maritime palette (Deep Navy `#071321`, Seafoam Emerald `#00a896`, Harbour Amber `#f4a261`, Glassmorphism, Google Fonts `Outfit` & `Plus Jakarta Sans`).
* **Icons**: `lucide-react`.
* **State Management**: React Hooks (`useState`, `useMemo`), clean unidirectional data flow.
* **Deployment Options**:
  * Vercel: Preconfigured via `vercel.json` (instant edge preview).
  * AWS Amplify: Preconfigured via `amplify.yml`.
  * AWS S3 + CloudFront: Production static build script `deploy-aws-s3.sh`.
  * Local development: `npm run dev` at `http://localhost:5173`.

## File Structure
```
hfxrentals/
├── index.html                   # SEO metadata, OpenGraph tags, Google Fonts
├── package.json                 # Scripts: dev, build, preview
├── tsconfig.json                # TypeScript configuration
├── amplify.yml                  # AWS Amplify deployment specification
├── deploy-aws-s3.sh             # AWS S3 + CloudFront deployment bash script
├── aws-deploy-guide.md          # Step-by-step AWS hosting instructions
├── AGENT_CONTEXT.md             # Sub-agent synchronization context
└── src/
    ├── main.tsx                 # App mount & global style loading
    ├── App.tsx                  # Root application, routing, modals, layout
    ├── types/
    │   └── index.ts             # TypeScript domain definitions
    ├── data/
    │   └── mockData.ts          # Authentic Halifax listings, sublets, roommate profiles
    ├── components/
    │   ├── Navbar.tsx           # Header with tabs, brand, favorites counter, post ad
    │   ├── HeroBanner.tsx       # Dynamic search, market stats, neighborhood chips
    │   ├── FilterBar.tsx        # Local Halifax toggles, campus slider, price ranges
    │   ├── RentalCard.tsx       # True-cost utility metrics, winter parking indicators
    │   ├── SubletCard.tsx       # Term tags, discount badges, furnished checklist
    │   ├── RoommateCard.tsx     # Lifestyle radar, verified student badge, messaging
    │   ├── ListingDetailModal.tsx # Photo gallery, commute table, inquiry form
    │   ├── PostListingModal.tsx # 3-step wizard with category choice & boost upsells
    │   ├── InsuranceWidget.tsx  # Tenant insurance affiliate revenue banner
    │   ├── ScamShieldBanner.tsx # Anti-fraud hub & remote inspection bookings
    │   └── FavoritesDrawer.tsx  # Slide-over saved listings manager
    └── styles/
        ├── index.css            # Maritime tokens, reset, typography, buttons
        ├── navbar.css           # Sticky glass header, active tabs
        ├── hero.css             # Hero layout, search bar, HRM stats
        ├── filters.css          # Dynamic filter controls & local pills
        ├── listings.css         # Grid layout, cards, badges, true-cost chips
        ├── modal.css            # Modals, photo hero, post wizard, favorites drawer
        └── monetization.css     # Insurance banner, scam shield cards, red flags
```
