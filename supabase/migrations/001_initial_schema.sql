-- ═══════════════════════════════════════════════════════════════
-- AGROEXCHANGE – Full Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── PROFILES (extends auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer','buyer','transporter','admin')),
  location        TEXT DEFAULT '',
  phone           TEXT DEFAULT '',
  bio             TEXT DEFAULT '',
  trust_score     INT  NOT NULL DEFAULT 50,
  total_deals     INT  NOT NULL DEFAULT 0,
  total_value     NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_sales     INT  NOT NULL DEFAULT 0,
  total_purchases INT  NOT NULL DEFAULT 0,
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count    INT  NOT NULL DEFAULT 0,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LISTINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT DEFAULT '',
  price_per_ton   NUMERIC(10,2) NOT NULL,
  quantity_tons   NUMERIC(10,2) NOT NULL,
  location        TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','expired','draft')),
  image_url       TEXT,
  badge           TEXT,
  view_count      INT NOT NULL DEFAULT 0,
  offer_count     INT NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── OFFERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id      UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id        UUID REFERENCES public.profiles(id) NOT NULL,
  seller_id       UUID REFERENCES public.profiles(id) NOT NULL,
  price_per_ton   NUMERIC(10,2) NOT NULL,
  quantity_tons   NUMERIC(10,2) NOT NULL,
  total_value     NUMERIC(14,2) GENERATED ALWAYS AS (price_per_ton * quantity_tons) STORED,
  message         TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','countered','completed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DEALS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deals (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_id        UUID REFERENCES public.offers(id) NOT NULL,
  buyer_id        UUID REFERENCES public.profiles(id) NOT NULL,
  seller_id       UUID REFERENCES public.profiles(id) NOT NULL,
  listing_id      UUID REFERENCES public.listings(id) NOT NULL,
  price_per_ton   NUMERIC(10,2) NOT NULL,
  quantity_tons   NUMERIC(10,2) NOT NULL,
  total_value     NUMERIC(14,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','disputed')),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TRANSPORTERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transporters (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  vehicle_type    TEXT NOT NULL DEFAULT 'Φορτηγό',
  capacity_tons   NUMERIC(8,2) NOT NULL DEFAULT 10,
  license_plate   TEXT DEFAULT '',
  from_location   TEXT NOT NULL DEFAULT '',
  to_location     TEXT NOT NULL DEFAULT '',
  price_per_trip  NUMERIC(10,2) NOT NULL DEFAULT 0,
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count    INT NOT NULL DEFAULT 0,
  total_trips     INT NOT NULL DEFAULT 0,
  description     TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id     UUID REFERENCES public.profiles(id) NOT NULL,
  reviewed_id     UUID REFERENCES public.profiles(id),
  transporter_id  UUID REFERENCES public.transporters(id),
  deal_id         UUID REFERENCES public.deals(id),
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_target CHECK (reviewed_id IS NOT NULL OR transporter_id IS NOT NULL)
);

-- ─── TRANSPORT BOOKINGS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transport_bookings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transporter_id  UUID REFERENCES public.transporters(id) NOT NULL,
  user_id         UUID REFERENCES public.profiles(id) NOT NULL,
  from_location   TEXT NOT NULL,
  to_location     TEXT NOT NULL,
  cargo_tons      NUMERIC(8,2) NOT NULL,
  agreed_price    NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes           TEXT DEFAULT '',
  scheduled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type            TEXT NOT NULL DEFAULT 'system',
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT FALSE,
  link            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MARKET PRICES (cache) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.market_prices (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  commodity       TEXT NOT NULL,
  symbol          TEXT NOT NULL UNIQUE,
  price           NUMERIC(12,4) NOT NULL,
  change_pct      NUMERIC(6,3) NOT NULL DEFAULT 0,
  unit            TEXT NOT NULL DEFAULT '€/τόν',
  source          TEXT NOT NULL DEFAULT 'demo',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NEWS (cache) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.news_articles (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id     TEXT UNIQUE,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL DEFAULT '',
  content         TEXT DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'Αγορά',
  source          TEXT NOT NULL DEFAULT '',
  image_url       TEXT,
  url             TEXT,
  is_hot          BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RANKINGS (materialized view helper) ─────────────────────
CREATE TABLE IF NOT EXISTS public.yearly_awards (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year            INT NOT NULL,
  award_type      TEXT NOT NULL,
  user_id         UUID REFERENCES public.profiles(id) NOT NULL,
  value           NUMERIC(14,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(year, award_type)
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_listings_user       ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status     ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category   ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created    ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_buyer        ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller       ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing      ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer         ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller        ON deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_news_category       ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_published      ON news_articles(published_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_awards      ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Profiles are public" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- LISTINGS policies
CREATE POLICY "Listings are public" ON listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON listings FOR DELETE USING (auth.uid() = user_id);

-- OFFERS policies
CREATE POLICY "Users see own offers" ON offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Authenticated users can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Offer parties can update" ON offers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- DEALS policies
CREATE POLICY "Deal parties can view" ON deals FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- TRANSPORTERS policies
CREATE POLICY "Transporters are public" ON transporters FOR SELECT USING (true);
CREATE POLICY "Own transporter profile" ON transporters FOR ALL USING (auth.uid() = user_id);

-- REVIEWS policies
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can review" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- TRANSPORT BOOKINGS policies
CREATE POLICY "Own bookings" ON transport_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Create bookings" ON transport_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS policies
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- MARKET PRICES public
CREATE POLICY "Market prices are public" ON market_prices FOR SELECT USING (true);

-- NEWS public
CREATE POLICY "News are public" ON news_articles FOR SELECT USING (true);

-- YEARLY AWARDS public
CREATE POLICY "Awards are public" ON yearly_awards FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update trust score when deal completes
CREATE OR REPLACE FUNCTION public.update_user_stats_on_deal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles SET
      total_deals     = total_deals + 1,
      total_value     = total_value + NEW.total_value,
      total_sales     = total_sales + 1,
      trust_score     = LEAST(100, trust_score + 2),
      updated_at      = NOW()
    WHERE id = NEW.seller_id;

    UPDATE profiles SET
      total_deals     = total_deals + 1,
      total_value     = total_value + NEW.total_value,
      total_purchases = total_purchases + 1,
      trust_score     = LEAST(100, trust_score + 2),
      updated_at      = NOW()
    WHERE id = NEW.buyer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_deal_completed ON deals;
CREATE TRIGGER on_deal_completed
  AFTER UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_deal();

-- Update rating when review is added
CREATE OR REPLACE FUNCTION public.update_rating_on_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.reviewed_id IS NOT NULL THEN
    UPDATE profiles SET
      rating       = (SELECT AVG(rating) FROM reviews WHERE reviewed_id = NEW.reviewed_id),
      rating_count = (SELECT COUNT(*)    FROM reviews WHERE reviewed_id = NEW.reviewed_id),
      trust_score  = LEAST(100, trust_score + 1),
      updated_at   = NOW()
    WHERE id = NEW.reviewed_id;
  END IF;

  IF NEW.transporter_id IS NOT NULL THEN
    UPDATE transporters SET
      rating       = (SELECT AVG(rating) FROM reviews WHERE transporter_id = NEW.transporter_id),
      rating_count = (SELECT COUNT(*)    FROM reviews WHERE transporter_id = NEW.transporter_id),
      total_trips  = total_trips + 1,
      updated_at   = NOW()
    WHERE id = NEW.transporter_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_added ON reviews;
CREATE TRIGGER on_review_added
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_rating_on_review();

-- Notify user on new offer
CREATE OR REPLACE FUNCTION public.notify_on_new_offer()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_title TEXT;
BEGIN
  SELECT title INTO v_title FROM listings WHERE id = NEW.listing_id;
  INSERT INTO notifications(user_id, type, title, message, link)
  VALUES (
    NEW.seller_id, 'offer',
    'Νέα Προσφορά',
    'Λάβατε νέα προσφορά για: ' || v_title,
    '/dashboard/offers'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_offer_created ON offers;
CREATE TRIGGER on_offer_created
  AFTER INSERT ON offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_offer();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER set_updated_at_profiles      BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_listings      BEFORE UPDATE ON listings      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_offers        BEFORE UPDATE ON offers        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_transporters  BEFORE UPDATE ON transporters  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═══════════════════════════════════════════════════════════════
-- SUPABASE STORAGE — Avatar bucket policies
-- Run AFTER creating the 'avatars' bucket in Supabase Dashboard
-- Storage → New Bucket → Name: avatars → Public: true
-- ═══════════════════════════════════════════════════════════════

-- Allow authenticated users to upload their own avatar
-- (bucket must exist first — create in Dashboard)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN

    DROP POLICY IF EXISTS "Avatar upload own" ON storage.objects;
    CREATE POLICY "Avatar upload own"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '/', 1));

    DROP POLICY IF EXISTS "Avatar update own" ON storage.objects;
    CREATE POLICY "Avatar update own"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '/', 1));

    DROP POLICY IF EXISTS "Avatar delete own" ON storage.objects;
    CREATE POLICY "Avatar delete own"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'avatars' AND auth.uid()::text = split_part(name, '/', 1));

    DROP POLICY IF EXISTS "Avatars are public" ON storage.objects;
    CREATE POLICY "Avatars are public"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'avatars');

  END IF;
END $$;
