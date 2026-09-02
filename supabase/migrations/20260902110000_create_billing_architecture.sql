-- ============================================================
-- BREWPRINT
-- Billing and Entitlement Architecture
-- Created: 2026-09-02
--
-- Browser clients may READ their own billing and entitlement
-- records.
--
-- Only trusted server-side code may WRITE billing or
-- entitlement records.
-- ============================================================


-- ============================================================
-- 1. BILLING SUBSCRIPTIONS
-- ============================================================

create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  provider text not null
    check (
      provider in (
        'paystack',
        'stripe',
        'apple',
        'google',
        'manual'
      )
    ),

  provider_customer_id text,
  provider_subscription_id text,

  plan text not null
    check (
      plan in (
        'pro_monthly',
        'pro_annual'
      )
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'active',
        'past_due',
        'paused',
        'canceled',
        'expired',
        'incomplete'
      )
    ),

  current_period_start timestamptz,
  current_period_end timestamptz,

  cancel_at_period_end boolean not null default false,

  canceled_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint billing_subscription_period_valid
    check (
      current_period_start is null
      or current_period_end is null
      or current_period_end > current_period_start
    )
);


-- ============================================================
-- 2. BILLING INDEXES
-- ============================================================

create unique index billing_provider_subscription_unique_idx
on public.billing_subscriptions (
  provider,
  provider_subscription_id
)
where provider_subscription_id is not null;


create index billing_subscriptions_user_id_idx
on public.billing_subscriptions (
  user_id
);


create index billing_subscriptions_user_status_idx
on public.billing_subscriptions (
  user_id,
  status
);


-- ============================================================
-- 3. USER ENTITLEMENTS
-- ============================================================

create table public.user_entitlements (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  entitlement text not null
    check (
      entitlement in (
        'brewprint_pro'
      )
    ),

  source text not null
    check (
      source in (
        'paystack',
        'stripe',
        'apple',
        'google',
        'manual',
        'beta',
        'promo'
      )
    ),

  source_reference text,

  starts_at timestamptz not null default now(),

  expires_at timestamptz,

  revoked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint entitlement_period_valid
    check (
      expires_at is null
      or expires_at > starts_at
    )
);


-- ============================================================
-- 4. ENTITLEMENT INDEXES
-- ============================================================

create index user_entitlements_user_id_idx
on public.user_entitlements (
  user_id
);


create index user_entitlements_lookup_idx
on public.user_entitlements (
  user_id,
  entitlement
);


create index user_entitlements_active_lookup_idx
on public.user_entitlements (
  user_id,
  entitlement,
  revoked_at,
  expires_at
);


create unique index user_entitlements_source_reference_unique_idx
on public.user_entitlements (
  source,
  source_reference,
  entitlement
)
where source_reference is not null;


-- ============================================================
-- 5. UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_brewprint_billing_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================================

create trigger set_billing_subscriptions_updated_at
before update
on public.billing_subscriptions
for each row
execute function public.set_brewprint_billing_updated_at();


create trigger set_user_entitlements_updated_at
before update
on public.user_entitlements
for each row
execute function public.set_brewprint_billing_updated_at();


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table public.billing_subscriptions
enable row level security;


alter table public.user_entitlements
enable row level security;


-- ============================================================
-- 8. BILLING READ POLICY
--
-- Users may only read their own subscription records.
--
-- No INSERT, UPDATE or DELETE policy is provided.
-- ============================================================

create policy "Users can view own billing subscriptions"
on public.billing_subscriptions
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 9. ENTITLEMENT READ POLICY
--
-- Users may only read their own entitlement records.
--
-- No INSERT, UPDATE or DELETE policy is provided.
-- ============================================================

create policy "Users can view own entitlements"
on public.user_entitlements
for select
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 10. TABLE PRIVILEGES
-- ============================================================

revoke all
on table public.billing_subscriptions
from public;


revoke all
on table public.user_entitlements
from public;


revoke all
on table public.billing_subscriptions
from anon;


revoke all
on table public.user_entitlements
from anon;


revoke all
on table public.billing_subscriptions
from authenticated;


revoke all
on table public.user_entitlements
from authenticated;


grant select
on table public.billing_subscriptions
to authenticated;


grant select
on table public.user_entitlements
to authenticated;


-- ============================================================
-- 11. FUNCTION PRIVILEGES
--
-- Browser clients do not need to execute this function.
-- PostgreSQL triggers can still execute it internally.
-- ============================================================

revoke all
on function public.set_brewprint_billing_updated_at()
from public;


revoke all
on function public.set_brewprint_billing_updated_at()
from anon;


revoke all
on function public.set_brewprint_billing_updated_at()
from authenticated;