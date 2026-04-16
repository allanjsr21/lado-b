-- ================================================================
-- LADO ₿ — Schema do banco de dados (Supabase / PostgreSQL)
-- ================================================================
-- Este arquivo define toda a estrutura de dados da área de membros.
-- Cada tabela tem Row Level Security (RLS) habilitado para que
-- cada usuário só possa ler/escrever seus próprios dados.
--
-- Ordem de execução: rodar de cima para baixo.
-- ================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 1. USERS — sincronizado com Clerk via webhook
-- ================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- Email verificado para liberar o link de indicação
  referral_email_verified BOOLEAN DEFAULT FALSE,
  referral_email_verified_at TIMESTAMPTZ,

  -- Código único de indicação (gerado quando verifica email)
  ref_code TEXT UNIQUE,

  -- Quem indicou este usuário (NULL se veio orgânico)
  referred_by UUID REFERENCES public.users(id),

  -- Integração Beehiiv (subscription_id do assinante na plataforma)
  beehiiv_subscription_id TEXT UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_ref_code ON public.users(ref_code);
CREATE INDEX idx_users_referred_by ON public.users(referred_by);

-- ================================================================
-- 2. READINGS — registro de cada edição aberta pelo usuário
-- ================================================================
-- Alimentada pelo webhook do Beehiiv quando o usuário abre a edição.
-- Uma linha por usuário por edição.
CREATE TABLE IF NOT EXISTS public.readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  beehiiv_post_id TEXT NOT NULL,
  post_title TEXT,
  read_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, beehiiv_post_id)
);

CREATE INDEX idx_readings_user_date ON public.readings(user_id, read_at DESC);

-- ================================================================
-- 3. STREAKS — contador diário de leituras consecutivas
-- ================================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 4. MISSIONS — conquistas disponíveis
-- ================================================================
-- Tabela fixa com as missões. O progresso fica em user_missions.
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_emoji TEXT,
  target_days INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Missões padrão
INSERT INTO public.missions (slug, name, description, icon_emoji, target_days, sort_order) VALUES
  ('starter-pack', 'Starter Pack', 'leia 7 edições seguidas', '✅', 7, 1),
  ('criador-de-habitos', 'Criador de Hábitos', 'abra o LADO ₿ por 21 dias', '📅', 21, 2),
  ('tons-de-informacao', 'Tons de Informação', 'abra o LADO ₿ por 50 dias', '😉', 50, 3),
  ('yellow-crew', 'Yellow Crew', 'abra o LADO ₿ por 100 dias', '😎', 100, 4),
  ('colunista-invisivel', 'Colunista Invisível', 'abra o LADO ₿ por 150 dias', '🙈', 150, 5)
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- 5. USER_MISSIONS — progresso de cada usuário em cada missão
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, mission_id)
);

CREATE INDEX idx_user_missions_user ON public.user_missions(user_id);

-- ================================================================
-- 6. REFERRALS — indicações registradas
-- ================================================================
-- Cada linha é uma pessoa que se cadastrou via link de indicação.
-- status: 'pending' (cadastrou mas não confirmou email)
--         'valid'   (cadastrou E confirmou email — conta pro indicador)
--         'invalid' (fraude detectada / cancelado)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'invalid')),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- ================================================================
-- 7. OTP_CODES — códigos de verificação enviados por email
-- ================================================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'referral' CHECK (purpose IN ('referral', 'email_change')),
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_user_active ON public.otp_codes(user_id, expires_at) WHERE used_at IS NULL;

-- ================================================================
-- 8. COUPONS — cupons de parceiros (gerenciado via admin)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name TEXT NOT NULL,
  partner_logo_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  link_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 9. GIVEAWAYS — sorteios ativos
-- ================================================================
CREATE TABLE IF NOT EXISTS public.giveaways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prize TEXT NOT NULL,
  banner_url TEXT,
  rules TEXT,
  min_referrals INTEGER DEFAULT 1,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 10. GIVEAWAY_ENTRIES — participantes de cada sorteio
-- ================================================================
CREATE TABLE IF NOT EXISTS public.giveaway_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referrals_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(giveaway_id, user_id)
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
-- Habilita RLS em todas as tabelas sensíveis
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuário só vê seus próprios dados
-- (auth.uid() vem do Supabase Auth; adaptar para Clerk via JWT custom)
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can read own readings" ON public.readings
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can read own streak" ON public.streaks
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can read own missions" ON public.user_missions
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can read own referrals" ON public.referrals
  FOR SELECT USING (referrer_id IN (
    SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Coupons e missions são públicos para leitura (todos leem)
-- Giveaways também
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are public" ON public.coupons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Missions are public" ON public.missions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Giveaways are public" ON public.giveaways FOR SELECT USING (is_active = TRUE);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Gera ref_code único quando o email for verificado
CREATE OR REPLACE FUNCTION generate_ref_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_email_verified = TRUE AND OLD.referral_email_verified = FALSE AND NEW.ref_code IS NULL THEN
    -- Gera código aleatório de 10 caracteres alfanuméricos
    NEW.ref_code := lower(substring(encode(gen_random_bytes(8), 'hex') from 1 for 10));
    NEW.referral_email_verified_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_ref_code
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION generate_ref_code();

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- FIM
-- ================================================================
