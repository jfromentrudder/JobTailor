-- Add subscription tier to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'plus'));

-- Create subscription_plans reference table
CREATE TABLE public.subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    monthly_limit INTEGER NOT NULL,
    allowed_providers TEXT[] NOT NULL,
    allowed_models TEXT[] NOT NULL,
    price_monthly_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed plan data
INSERT INTO public.subscription_plans (id, name, monthly_limit, allowed_providers, allowed_models, price_monthly_cents) VALUES
  ('free', 'Free', 5, ARRAY['openai'], ARRAY['gpt-4o-mini'], 0),
  ('pro', 'Pro', 50, ARRAY['openai', 'anthropic'], ARRAY['gpt-4o-mini', 'gpt-4o', 'claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001'], 999),
  ('plus', 'Plus', 200, ARRAY['openai', 'anthropic'], ARRAY['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001'], 1999);

-- RLS for subscription_plans (read-only for all authenticated)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select" ON public.subscription_plans
    FOR SELECT USING (true);

-- Future billing table (schema only, no payment logic yet)
CREATE TABLE public.billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT REFERENCES public.subscription_plans(id),
    amount_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_provider TEXT, -- 'stripe', 'paddle', etc. - flexible for future
    payment_provider_id TEXT, -- stripe_payment_intent_id, paddle_transaction_id, etc.
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_select" ON public.billing_history
    FOR SELECT USING (auth.uid() = user_id);
