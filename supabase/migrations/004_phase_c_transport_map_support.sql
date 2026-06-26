-- ═══════════════════════════════════════════════════════════════
-- PHASE C — Transport network, map POIs, AI assistant & support
-- Idempotent. Run AFTER 001 + 002 + 003.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Transport listings (separate from product listings) ───
-- A transporter advertises a route/service they offer.
CREATE TABLE IF NOT EXISTS public.transport_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title           TEXT NOT NULL,
  from_location   TEXT NOT NULL,
  to_location     TEXT NOT NULL,
  vehicle_type    TEXT DEFAULT '',
  capacity_tons   NUMERIC(10,2) DEFAULT 0,
  price_per_trip  NUMERIC(12,2) DEFAULT 0,
  available_from  DATE,
  description     TEXT DEFAULT '',
  company_photo   TEXT,
  truck_photo     TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transport_listings_route_idx ON public.transport_listings (from_location, to_location);
CREATE INDEX IF NOT EXISTS transport_listings_user_idx  ON public.transport_listings (user_id);

-- ─── 2. Route requests (demand: "I need transport A → B") ─────
CREATE TABLE IF NOT EXISTS public.route_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  from_location   TEXT NOT NULL,
  to_location     TEXT NOT NULL,
  product         TEXT DEFAULT '',
  quantity_tons   NUMERIC(10,2) DEFAULT 0,
  preferred_date  DATE,
  notes           TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS route_requests_route_idx  ON public.route_requests (from_location, to_location);
CREATE INDEX IF NOT EXISTS route_requests_status_idx ON public.route_requests (status, created_at DESC);

-- ─── 3. Support tickets (AI → admin handoff) ──────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT DEFAULT '',
  message         TEXT NOT NULL,
  source          TEXT NOT NULL DEFAULT 'ai_assistant' CHECK (source IN ('ai_assistant','contact_form','other')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  ai_transcript   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets (status, created_at DESC);

-- ─── 4. Map points of interest (agricultural infrastructure) ──
CREATE TABLE IF NOT EXISTS public.map_points (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('silo','mill','warehouse','cooperative','distribution','transport_company')),
  city            TEXT DEFAULT '',
  region          TEXT DEFAULT '',
  lat             NUMERIC(9,6),
  lng             NUMERIC(9,6),
  description     TEXT DEFAULT '',
  -- optional link to a transporter profile (for transport_company points)
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  phone           TEXT DEFAULT '',
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS map_points_category_idx ON public.map_points (category);
CREATE INDEX IF NOT EXISTS map_points_city_idx     ON public.map_points (city);

-- ─── 5. RLS ───────────────────────────────────────────────────
ALTER TABLE public.transport_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_points         ENABLE ROW LEVEL SECURITY;

-- Transport listings: public read, owner write
DROP POLICY IF EXISTS "Transport listings public read" ON public.transport_listings;
CREATE POLICY "Transport listings public read" ON public.transport_listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Transport listings owner insert" ON public.transport_listings;
CREATE POLICY "Transport listings owner insert" ON public.transport_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Transport listings owner update" ON public.transport_listings;
CREATE POLICY "Transport listings owner update" ON public.transport_listings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Transport listings owner delete" ON public.transport_listings;
CREATE POLICY "Transport listings owner delete" ON public.transport_listings FOR DELETE USING (auth.uid() = user_id);

-- Route requests: public read (so transporters can discover), owner write
DROP POLICY IF EXISTS "Route requests public read" ON public.route_requests;
CREATE POLICY "Route requests public read" ON public.route_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Route requests owner insert" ON public.route_requests;
CREATE POLICY "Route requests owner insert" ON public.route_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Route requests owner update" ON public.route_requests;
CREATE POLICY "Route requests owner update" ON public.route_requests FOR UPDATE USING (auth.uid() = user_id);

-- Support tickets: insert by anyone (incl. anon), read own only
DROP POLICY IF EXISTS "Support tickets insert" ON public.support_tickets;
CREATE POLICY "Support tickets insert" ON public.support_tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Support tickets read own" ON public.support_tickets;
CREATE POLICY "Support tickets read own" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

-- Map points: public read; writes via service role (admin/seed) only
DROP POLICY IF EXISTS "Map points public read" ON public.map_points;
CREATE POLICY "Map points public read" ON public.map_points FOR SELECT USING (true);

-- ─── 6. Trigger: new route request → notify matching transporters
-- A "matching" transporter has a transport_listing whose from/to matches
-- (case-insensitive substring), reusing the existing notifications table.
CREATE OR REPLACE FUNCTION public.on_new_route_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, read)
  SELECT DISTINCT tl.user_id,
         'transport',
         'Νέα ζήτηση διαδρομής',
         'Νέα ζήτηση μεταφοράς: ' || NEW.from_location || ' → ' || NEW.to_location,
         FALSE
  FROM public.transport_listings tl
  WHERE tl.status = 'active'
    AND tl.user_id <> NEW.user_id
    AND (
      lower(tl.from_location) LIKE '%' || lower(NEW.from_location) || '%'
      OR lower(tl.to_location) LIKE '%' || lower(NEW.to_location) || '%'
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_new_route_request ON public.route_requests;
CREATE TRIGGER trg_on_new_route_request
  AFTER INSERT ON public.route_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_new_route_request();

-- ─── 7. Seed a few demo map points (idempotent) ───────────────
INSERT INTO public.map_points (name, category, city, region, lat, lng, description, verified)
SELECT * FROM (VALUES
  ('Σιλό Θεσσαλίας',            'silo',          'Λάρισα',       'Θεσσαλία',          39.6390, 22.4191, 'Αποθήκευση σιτηρών μεγάλης χωρητικότητας', TRUE),
  ('Μύλοι Αγρινίου',           'mill',          'Αγρίνιο',      'Δυτική Ελλάδα',     38.6219, 21.4076, 'Άλεση σιτηρών και ζωοτροφών', TRUE),
  ('Αποθήκη Σερρών',           'warehouse',     'Σέρρες',       'Κεντρική Μακεδονία', 41.0853, 23.5476, 'Ξηρή αποθήκευση προϊόντων', FALSE),
  ('Αγροτικός Συνεταιρισμός Ξάνθης', 'cooperative', 'Ξάνθη',   'Ανατολική Μακεδονία', 41.1340, 24.8880, 'Συνεταιρισμός παραγωγών βαμβακιού', TRUE),
  ('Κέντρο Διανομής Αττικής',  'distribution',  'Αθήνα',        'Αττική',            38.0000, 23.7300, 'Κεντρική διανομή προς λιανική', TRUE),
  ('Μεταφορές Βορρά ΑΕ',        'transport_company','Θεσσαλονίκη','Κεντρική Μακεδονία', 40.6401, 22.9444, 'Πανελλαδικό δίκτυο μεταφορών', TRUE),
  ('Σιλό Ορεστιάδας',          'silo',          'Ορεστιάδα',    'Ανατολική Μακεδονία', 41.5022, 26.5300, 'Αποθήκευση καλαμποκιού', FALSE),
  ('Μύλοι Κρήτης',             'mill',          'Ηράκλειο',     'Κρήτη',             35.3387, 25.1442, 'Επεξεργασία ελαιολάδου & σιτηρών', TRUE)
) AS v(name, category, city, region, lat, lng, description, verified)
WHERE NOT EXISTS (SELECT 1 FROM public.map_points LIMIT 1);

-- ─── 8. Seed demo transport listings (linked to seeded transporters) ──
-- Runs only if there are profiles with transporter role and no listings yet.
DO $$
DECLARE
  trans_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.transport_listings LIMIT 1) THEN
    SELECT id INTO trans_id FROM public.profiles
      WHERE 'transporter' = ANY(roles) OR role = 'transporter' LIMIT 1;
    IF trans_id IS NOT NULL THEN
      INSERT INTO public.transport_listings (user_id, title, from_location, to_location, vehicle_type, capacity_tons, price_per_trip, description, status)
      VALUES
        (trans_id, 'Μεταφορά σιτηρών Θεσσαλία→Αττική', 'Λάρισα', 'Αθήνα', 'Φορτηγό MAN 18t', 20, 340, 'Τακτικά δρομολόγια, ασφαλισμένο φορτίο.', 'active'),
        (trans_id, 'Βόρεια Ελλάδα express', 'Θεσσαλονίκη', 'Ξάνθη', 'Φορτηγό Volvo 25t', 25, 220, 'Καθημερινά δρομολόγια Βορείου Ελλάδος.', 'active');
    END IF;
  END IF;
END $$;
