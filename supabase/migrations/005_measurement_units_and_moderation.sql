-- ═══════════════════════════════════════════════════════════════
-- PHASE D — Measurement units & content moderation
-- Idempotent. Run AFTER 001–004. Backward compatible.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Measurement unit on listings ──────────────────────────
-- Existing numeric columns (price_per_ton/quantity_tons) keep their
-- values; measurement_unit describes what those numbers mean.
-- Default 'ton' preserves the meaning of all existing rows.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS measurement_unit TEXT NOT NULL DEFAULT 'ton'
    CHECK (measurement_unit IN ('kg','ton','g'));

-- Transport listings (Phase C) — what unit the capacity refers to
ALTER TABLE public.transport_listings
  ADD COLUMN IF NOT EXISTS measurement_unit TEXT NOT NULL DEFAULT 'ton'
    CHECK (measurement_unit IN ('kg','ton','g'));

-- Route requests (Phase C) — unit for requested quantity
ALTER TABLE public.route_requests
  ADD COLUMN IF NOT EXISTS measurement_unit TEXT NOT NULL DEFAULT 'ton'
    CHECK (measurement_unit IN ('kg','ton','g'));

-- Offers — unit context for the offered price/quantity
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS measurement_unit TEXT NOT NULL DEFAULT 'ton'
    CHECK (measurement_unit IN ('kg','ton','g'));

-- ─── 2. Moderation: reported content + logs (future admin) ────
CREATE TABLE IF NOT EXISTS public.content_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content_type  TEXT NOT NULL CHECK (content_type IN ('listing','transport_listing','route_request','message','review','profile','comment')),
  content_id    UUID,
  reason        TEXT NOT NULL DEFAULT '',
  details       TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','actioned','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON public.content_reports (status, created_at DESC);

-- Moderation log: every automated/manual moderation decision
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor         TEXT NOT NULL DEFAULT 'system' CHECK (actor IN ('system','admin')),
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content_type  TEXT NOT NULL,
  content_id    UUID,
  action        TEXT NOT NULL CHECK (action IN ('blocked_profanity','flagged','approved','removed','warned')),
  reason        TEXT DEFAULT '',
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS moderation_logs_content_idx ON public.moderation_logs (content_type, content_id);
CREATE INDEX IF NOT EXISTS moderation_logs_created_idx ON public.moderation_logs (created_at DESC);

-- Flag columns on moderatable tables (future-ready; default false)
ALTER TABLE public.listings           ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.transport_listings ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.reviews            ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── 3. RLS ───────────────────────────────────────────────────
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can report; users read their own reports
DROP POLICY IF EXISTS "Reports insert" ON public.content_reports;
CREATE POLICY "Reports insert" ON public.content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);
DROP POLICY IF EXISTS "Reports read own" ON public.content_reports;
CREATE POLICY "Reports read own" ON public.content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Moderation logs: no client access (service role / admin only — managed server-side)
-- (RLS enabled with no permissive policy = locked to service role.)
