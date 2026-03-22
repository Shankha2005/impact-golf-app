-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase Auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS (Stripe)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing', 'inactive')),
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- USER CHARITY PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_charity_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE RESTRICT,
  contribution_percent INTEGER NOT NULL DEFAULT 10 CHECK (contribution_percent >= 10 AND contribution_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXTEND CHARITIES (slug, events)
-- ============================================
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.charities ADD COLUMN IF NOT EXISTS upcoming_events JSONB DEFAULT '[]';

-- ============================================
-- DRAWS - add jackpot_rollover
-- ============================================
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS jackpot_rollover DECIMAL DEFAULT 0;
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS pool_5_match DECIMAL DEFAULT 0;
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS pool_4_match DECIMAL DEFAULT 0;
ALTER TABLE public.draws ADD COLUMN IF NOT EXISTS pool_3_match DECIMAL DEFAULT 0;

-- ============================================
-- WINNERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  amount DECIMAL NOT NULL DEFAULT 0,
  proof_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_state TEXT NOT NULL DEFAULT 'pending' CHECK (payment_state IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRAW PARTICIPATIONS (who entered which draw)
-- ============================================
CREATE TABLE IF NOT EXISTS public.draw_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  scores INTEGER[] NOT NULL, -- user's 5 scores at time of draw
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, draw_id)
);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions: users can read own
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- User charity: users can read/update own
CREATE POLICY "Users can manage own charity prefs" ON public.user_charity_preferences FOR ALL USING (auth.uid() = user_id);

-- Scores: users can read/insert/update/delete own
CREATE POLICY "Users can manage own scores" ON public.scores FOR ALL USING (auth.uid() = user_id);

-- Winners: users can read own
CREATE POLICY "Users can read own winners" ON public.winners FOR SELECT USING (auth.uid() = user_id);

-- Draw participations: users can read own, insert own
CREATE POLICY "Users can read own participations" ON public.draw_participations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own participations" ON public.draw_participations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Charities: public read
CREATE POLICY "Charities are publicly readable" ON public.charities FOR SELECT TO anon, authenticated USING (true);

-- Draws: public read for published
CREATE POLICY "Published draws are readable" ON public.draws FOR SELECT TO anon, authenticated USING (status = 'published');

-- Service role bypass (for API routes using service key)
-- Admin operations will use service role key in server-side API routes

-- ============================================
-- TRIGGER: Create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'subscriber');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
