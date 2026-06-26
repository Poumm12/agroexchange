-- ═══════════════════════════════════════════════════════════════
-- PHASE B — Multi-role users, privacy controls, messaging
-- Idempotent: safe to re-run. Run AFTER 001 + 002.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Multi-role support ────────────────────────────────────
-- Keep legacy `role` column for backward-compat; add `roles` array.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS roles TEXT[] NOT NULL DEFAULT ARRAY['farmer'];

-- Backfill roles[] from the existing single role for current users
UPDATE public.profiles
  SET roles = ARRAY[role]
  WHERE (roles IS NULL OR array_length(roles, 1) IS NULL) AND role IS NOT NULL;

-- ─── 2. Privacy controls + profile extras ─────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_phone     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_email     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_location  BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS username       TEXT,
  ADD COLUMN IF NOT EXISTS successful_deals INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_business   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_transporter BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_insurer    BOOLEAN NOT NULL DEFAULT FALSE;

-- Unique username (nullable until set)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (lower(username)) WHERE username IS NOT NULL;

-- ─── 3. Messaging: conversations + messages ───────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_b      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id  UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  last_message      TEXT DEFAULT '',
  last_message_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- canonical ordering so (a,b) and (b,a) collapse to one row
  CONSTRAINT conversations_distinct CHECK (user_a <> user_b)
);

-- One conversation per unordered pair (+ optional listing context)
CREATE UNIQUE INDEX IF NOT EXISTS conversations_pair_key
  ON public.conversations (
    LEAST(user_a, user_b),
    GREATEST(user_a, user_b),
    COALESCE(listing_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body            TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS messages_recipient_unread_idx ON public.messages (recipient_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS conversations_user_a_idx ON public.conversations (user_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS conversations_user_b_idx ON public.conversations (user_b, last_message_at DESC);

-- ─── 4. RLS for messaging ─────────────────────────────────────
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read conversations" ON public.conversations;
CREATE POLICY "Participants read conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

DROP POLICY IF EXISTS "Users create conversations" ON public.conversations;
CREATE POLICY "Users create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

DROP POLICY IF EXISTS "Participants update conversations" ON public.conversations;
CREATE POLICY "Participants update conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

DROP POLICY IF EXISTS "Participants read messages" ON public.messages;
CREATE POLICY "Participants read messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Recipients mark read" ON public.messages;
CREATE POLICY "Recipients mark read" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- ─── 5. Trigger: on new message → bump conversation + notify ──
CREATE OR REPLACE FUNCTION public.on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation preview
  UPDATE public.conversations
    SET last_message = LEFT(NEW.body, 120),
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;

  -- Create a notification for the recipient (reuses existing system)
  INSERT INTO public.notifications (user_id, type, title, message, read)
  VALUES (
    NEW.recipient_id,
    'message',
    'Νέο μήνυμα',
    'Λάβατε νέο μήνυμα',
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_new_message ON public.messages;
CREATE TRIGGER trg_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.on_new_message();

-- ─── 6. Update profile-creation trigger to set roles[] ────────
-- (the handle_new_user function in 001 sets full_name/avatar; extend for roles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_roles TEXT[];
BEGIN
  -- roles may arrive as a comma string in metadata: "farmer,transporter"
  IF NEW.raw_user_meta_data ? 'roles' THEN
    meta_roles := string_to_array(NEW.raw_user_meta_data->>'roles', ',');
  ELSIF NEW.raw_user_meta_data ? 'role' THEN
    meta_roles := ARRAY[NEW.raw_user_meta_data->>'role'];
  ELSE
    meta_roles := ARRAY['farmer'];
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, roles)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    meta_roles[1],
    meta_roles
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 7. Successful deals counter on deal completion ───────────
CREATE OR REPLACE FUNCTION public.on_deal_completed_phaseb()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.profiles SET successful_deals = successful_deals + 1
      WHERE id IN (NEW.buyer_id, NEW.seller_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deal_completed_phaseb ON public.deals;
CREATE TRIGGER trg_deal_completed_phaseb
  AFTER UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.on_deal_completed_phaseb();
