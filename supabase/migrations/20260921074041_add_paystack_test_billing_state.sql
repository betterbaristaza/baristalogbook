-- Brewprint: isolated Paystack TEST billing state.
-- Production billing and entitlement tables remain unchanged.
--
-- Ownership:
-- subscription -> initial payment attempt -> user_id.
-- Account deletion clears the attempt's user_id.
-- Retained records cannot then grant access to an account.
--
-- Entitlements represent individual verified payment periods.
-- Renewal payments receive separate entitlement records.
-- Verification and webhook processing will write these records
-- together within a database transaction.

begin;

create table public.billing_test_subscriptions (
  id uuid primary key default gen_random_uuid(),

  initial_attempt_id uuid not null unique
    references public.billing_payment_attempts(id)
    on delete restrict,

  environment text not null default 'test'
    check (environment = 'test'),

  provider_customer_code text
    check (provider_customer_code ~ '^CUS_[A-Za-z0-9]+$'),

  provider_subscription_code text unique
    check (provider_subscription_code ~ '^SUB_[A-Za-z0-9]+$'),

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

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint billing_test_subscription_period_valid
    check (
      (
        current_period_start is null
        and current_period_end is null
      )
      or (
        current_period_start is not null
        and current_period_end is not null
        and isfinite(current_period_start)
        and isfinite(current_period_end)
        and current_period_end > current_period_start
      )
    )
);

create table public.billing_test_entitlements (
  id uuid primary key default gen_random_uuid(),

  subscription_id uuid not null
    references public.billing_test_subscriptions(id)
    on delete restrict,

  environment text not null default 'test'
    check (environment = 'test'),

  entitlement text not null default 'brewprint_pro'
    check (entitlement = 'brewprint_pro'),

  -- Text avoids JavaScript precision loss for large provider IDs.
  provider_transaction_id text not null unique
    check (provider_transaction_id ~ '^[0-9]+$'),

  payment_reference text not null unique
    check (
      length(payment_reference) > 0
      and payment_reference ~ '^[A-Za-z0-9.=-]+$'
    ),

  starts_at timestamptz not null,
  expires_at timestamptz not null,
  verified_at timestamptz not null,
  revoked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint billing_test_entitlement_period_valid
    check (
      isfinite(starts_at)
      and isfinite(expires_at)
      and expires_at > starts_at
    ),

  constraint billing_test_entitlement_verification_valid
    check (isfinite(verified_at)),

  constraint billing_test_entitlement_revocation_valid
    check (
      revoked_at is null
      or isfinite(revoked_at)
    )
);

create index billing_test_entitlements_subscription_idx
  on public.billing_test_entitlements(subscription_id);

create trigger set_billing_test_subscriptions_updated_at
before update on public.billing_test_subscriptions
for each row
execute function public.set_brewprint_billing_updated_at();

create trigger set_billing_test_entitlements_updated_at
before update on public.billing_test_entitlements
for each row
execute function public.set_brewprint_billing_updated_at();

alter table public.billing_test_subscriptions
  enable row level security;

alter table public.billing_test_entitlements
  enable row level security;

-- No browser policies or browser grants.
revoke all on table
  public.billing_test_subscriptions,
  public.billing_test_entitlements
from public, anon, authenticated, service_role;

grant select, insert, update, delete on table
  public.billing_test_subscriptions,
  public.billing_test_entitlements
to service_role;

commit;