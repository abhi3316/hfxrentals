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
5. **Authentication & Supabase PostgreSQL Database**:
   * Open-source backend integration (`src/lib/supabase.ts`, `src/context/AuthContext.tsx`).
   * Dual mode: Live Supabase Auth + Database when credentials provided, or instant local demo mode with 1-click profiles.
   * Automatic university student email detection (`@dal.ca`, `@smu.ca`, `@msvu.ca`, `@nscc.ca`).
   * Database schema file `supabase-schema.sql` (profiles, listings, viewings, RLS policies).
6. **Scam Shield & Trust Layer**:
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

## Architectural Decision Log & AWS Migration Matrix

> [!IMPORTANT]
> **Permanent Working Guideline**: Whenever introducing, designing, or implementing ANY new feature, utility, library, or third-party service, the agent MUST explicitly assess and report:
> 1. **AWS Native Equivalent**: What AWS service replaces this.
> 2. **Migration Difficulty Rating**: (Trivial / Low / Medium / High).
> 3. **Migration Friction & Effort**: Exactly what changes in code or configuration to move it to AWS.

### Current Component Migration Difficulty Matrix

| Utility / Component | Current / Recommended Tool | AWS Native Equivalent | Migration Difficulty | Migration Notes & Friction |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Hosting** | Vercel (or local Vite) | **AWS Amplify** or **S3 + CloudFront** | 🟢 **Trivial (< 15 mins)** | `amplify.yml` and `deploy-aws-s3.sh` already built in the repo. Zero code changes required. |
| **Transactional & Update Emails** | React Email + Resend / Brevo (or Novu) | **Amazon SES (Simple Email Service)** | 🟢 **Low (1-2 hours)** | Switch the SMTP/API credentials to SES. Email templates (`React Email`) are 100% portable. Cost drops to $0.10 / 1,000 emails. |
| **Listing Photo Storage** | Supabase Storage Bucket | **Amazon S3 + CloudFront** | 🟢 **Low (1-2 hours)** | Replace Supabase upload hook with S3 presigned PUT URL. Standard object storage. |
| **Database (PostgreSQL)** | Supabase Managed Postgres | **Amazon RDS for PostgreSQL** or **Aurora Serverless** | 🟢 **Low (1-2 hours)** | 100% SQL compatible. `supabase-schema.sql` imports directly into Amazon RDS with zero syntax modifications. |
| **Authentication** | Supabase Auth (Google OAuth + Email) | **AWS Cognito User Pools** | 🟡 **Medium (3-5 hours)** | Switching from Supabase Auth to Cognito requires replacing the AuthContext client SDK with `@aws-amplify/auth` or AWS Cognito Identity SDK. (Google OAuth setup remains identical). |
| **Cron / Scheduled Alerts** | Supabase Scheduled Functions / Cron | **AWS EventBridge + AWS Lambda** | 🟢 **Low (1-2 hours)** | EventBridge cron expression triggers a Lambda function querying DB and dispatching SES emails. |
| **Calendar Viewing Scheduler** | Google Calendar link generation | **Same (Client-side URL generator)** | 🟢 **Trivial (0 mins)** | Pure frontend client-side utility (`calendar.google.com/render`); 100% independent of cloud provider. |
