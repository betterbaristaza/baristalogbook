-- Brewprint: durable Paystack TEST checkout attempts.
-- Amounts are stored in cents.
-- Only trusted server code may access this table.
-- This migration does not grant entitlements.

create table public.billing_payment_attempts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    references auth.users(id)
    on delete set null,

  environment text not null default 'test'
    check (environment = 'test'),

  idempotency_key uuid not null,

  reference text not null unique
    default ('bp-test-' || gen_random_uuid()::text)
    check (
      reference ~ '^bp-test-[A-Za-z0-9.=-]+$'
    ),

  plan_code text not null
    check (
      plan_code in ('pro_monthly', 'pro_annual')
    ),

  amount integer not null,

  currency text not null default 'ZAR'
    check (currency = 'ZAR'),

  paystack_plan_code text not null
    check (
      paystack_plan_code ~ '^PLN_[A-Za-z0-9]+$'
    ),

  status text not null default 'created'
    check (
      status in (
        'created',
        'initializing',
        'pending',
        'unknown',
        'succeeded',
        'failed',
        'abandoned'
      )
    ),

  authorization_url text,

  -- Store provider IDs as text to avoid JavaScript integer rounding.
  provider_transaction_id text unique
    check (
      provider_transaction_id ~ '^[0-9]+$'
    ),

  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint payment_attempt_plan_amount_valid
    check (
      (plan_code = 'pro_monthly' and amount = 5900)
      or
      (plan_code = 'pro_annual' and amount = 49900)
    ),

  constraint payment_attempt_idempotency_unique
    unique (user_id, environment, idempotency_key),

  constraint payment_attempt_success_verified
    check (
      status <> 'succeeded'
      or (
        verified_at is not null
        and provider_transaction_id is not null
      )
    )
);

-- Block parallel unresolved checkouts for the same account,
-- including attempts using different plans or retry keys.
-- A timeout remains unresolved until the server reconciles it.
create unique index billing_payment_attempts_one_open_per_user
  on public.billing_payment_attempts (user_id, environment)
  where
    user_id is not null
    and status in (
      'created',
      'initializing',
      'pending',
      'unknown'
    );

create index billing_payment_attempts_user_created_idx
  on public.billing_payment_attempts (
    user_id,
    created_at desc
  );

create trigger set_billing_payment_attempts_updated_at
  before update on public.billing_payment_attempts
  for each row
  execute function public.set_brewprint_billing_updated_at();

alter table public.billing_payment_attempts
  enable row level security;

-- No browser policies or grants.
revoke all on table public.billing_payment_attempts
  from public, anon, authenticated, service_role;

grant select, insert, update, delete
  on table public.billing_payment_attempts
  to service_role;

comment on table public.billing_payment_attempts is
  'Server-only Paystack TEST checkout attempts. No card data, secrets, or raw provider payloads.';