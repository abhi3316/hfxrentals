-- ==============================================================================
-- HfxRentals - Supabase PostgreSQL Database Schema
-- ==============================================================================
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'renter' CHECK (role IN ('renter', 'landlord', 'student')),
  avatar_url TEXT,
  phone TEXT,
  university TEXT,
  is_verified_student BOOLEAN DEFAULT FALSE,
  has_fast_pass BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enforce unique username/display name across profiles (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_full_name 
  ON public.profiles (LOWER(TRIM(full_name)));

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'renter'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Listings Table (Full Rentals & Sublets)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rental', 'sublet')),
  title TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_rent NUMERIC,
  sublet_term TEXT,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms NUMERIC NOT NULL DEFAULT 1,
  property_type TEXT DEFAULT 'Apartment',
  heating_type TEXT DEFAULT 'Heat & Hot Water Included',
  estimated_winter_utilities NUMERIC DEFAULT 50,
  winter_parking TEXT DEFAULT 'Assigned Driveway',
  lease_type TEXT DEFAULT 'Periodic (Year-to-Year, Rent Cap Protected)',
  pet_policy TEXT DEFAULT 'Dogs & Cats Welcome',
  is_furnished BOOLEAN DEFAULT FALSE,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  google_calendar_enabled BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Viewings Table (Google Calendar Synced Appointments)
CREATE TABLE IF NOT EXISTS public.viewings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  renter_name TEXT NOT NULL,
  renter_email TEXT NOT NULL,
  renter_phone TEXT NOT NULL,
  slot_date TEXT NOT NULL,
  slot_time TEXT NOT NULL,
  viewing_type TEXT NOT NULL CHECK (viewing_type IN ('In-Person Walkthrough', 'Live Video Tour (Google Meet)', 'Open House Window')),
  has_fast_pass_attached BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewings viewable by listing owner and renter"
  ON public.viewings FOR SELECT
  USING (
    auth.uid() = renter_id OR 
    EXISTS (SELECT 1 FROM public.listings WHERE listings.id = viewings.listing_id AND listings.user_id = auth.uid())
  );

CREATE POLICY "Anyone authenticated can book a viewing"
  ON public.viewings FOR INSERT
  WITH CHECK (true);

-- 5. Messages Table (Direct Tenant-to-Landlord In-App Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Messages select policy" ON public.messages;
CREATE POLICY "Messages select policy"
  ON public.messages FOR SELECT
  TO public, anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;
CREATE POLICY "Messages insert policy"
  ON public.messages FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Messages update policy" ON public.messages;
CREATE POLICY "Messages update policy"
  ON public.messages FOR UPDATE
  TO public, anon, authenticated
  USING (true);

-- Enable real-time broadcast for messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 6. Storage Bucket for Listing Photos
-- Creates a public bucket 'listing-photos' for property photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for listing-photos
CREATE POLICY "Public Access to Listing Photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own listing photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-photos'
    AND auth.uid() = owner
  );

DROP POLICY IF EXISTS "Users can delete their own listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete for listing-photos" ON storage.objects;

CREATE POLICY "Allow delete for listing-photos"
  ON storage.objects FOR DELETE
  TO public, anon, authenticated
  USING (
    bucket_id = 'listing-photos'
  );

-- 7. Automatic Database Trigger to purge photos from storage.objects on listing deletion
CREATE OR REPLACE FUNCTION public.delete_listing_storage_photos()
RETURNS TRIGGER AS $$
DECLARE
  img_url TEXT;
  file_path TEXT;
BEGIN
  IF OLD.images IS NOT NULL THEN
    FOREACH img_url IN ARRAY OLD.images LOOP
      IF img_url LIKE '%/listing-photos/%' THEN
        file_path := split_part(split_part(img_url, '/listing-photos/', 2), '?', 1);
        DELETE FROM storage.objects 
        WHERE bucket_id = 'listing-photos' AND name = file_path;
      END IF;
    END LOOP;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_delete_listing_photos ON public.listings;
CREATE TRIGGER trg_delete_listing_photos
BEFORE DELETE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.delete_listing_storage_photos();
