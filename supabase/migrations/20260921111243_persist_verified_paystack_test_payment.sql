-- Persist an initial verified Paystack TEST payment atomically.
-- Call only after server-side Paystack verification.
-- Does not modify production billing tables.

begin;

create function public.persist_verified_paystack_test_payment(
  p_user_id uuid,
  p_reference text,
  p_transaction_id text,
  p_paid_at timestamptz,
  p_amount integer,
  p_currency text,
  p_plan_code text,
  p_paystack_plan_code text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
set timezone = 'UTC'
as $function$
declare
  v_attempt public.billing_payment_attempts%rowtype;
  v_subscription public.billing_test_subscriptions%rowtype;
  v_entitlement public.billing_test_entitlements%rowtype;
  v_expires_at timestamptz;
  v_expected_amount integer;
begin
  if p_user_id is null
    or p_reference is null
    or p_transaction_id is null
    or p_paid_at is null
    or p_amount is null
    or p_currency is null
    or p_plan_code is null
    or p_paystack_plan_code is null
  then
    raise exception 'Missing verified payment fields';
  end if;

  -- Reject imprecise, malformed or out-of-range provider IDs.
  if p_transaction_id !~ '^[1-9][0-9]{0,19}$' then
    raise exception 'Invalid transaction identifier';
  end if;

  if p_transaction_id::numeric > 18446744073709551615 then
    raise exception 'Invalid transaction identifier';
  end if;

  if not isfinite(p_paid_at)
    or p_paid_at > now() + interval '5 minutes'
  then
    raise exception 'Invalid payment timestamp';
  end if;

  -- Concurrent calls for this attempt serialize here.
  select *
  into v_attempt
  from public.billing_payment_attempts
  where reference = p_reference
    and user_id = p_user_id
    and environment = 'test'
  for update;

  if not found then
    raise exception 'Payment attempt not found';
  end if;

  v_expected_amount := case v_attempt.plan_code
    when 'pro_monthly' then 5900
    when 'pro_annual' then 49900
    else null
  end;

  if v_expected_amount is null
    or v_attempt.amount is distinct from v_expected_amount
    or p_amount is distinct from v_attempt.amount
    or p_currency is distinct from 'ZAR'
    or p_currency is distinct from v_attempt.currency
    or p_plan_code is distinct from v_attempt.plan_code
    or p_paystack_plan_code is distinct from v_attempt.paystack_plan_code
  then
    raise exception 'Verified payment does not match checkout';
  end if;

  if p_paid_at < v_attempt.created_at - interval '5 minutes' then
    raise exception 'Payment predates checkout';
  end if;

  v_expires_at := p_paid_at + case v_attempt.plan_code
    when 'pro_monthly' then interval '1 month'
    when 'pro_annual' then interval '1 year'
  end;

  -- A repeat must match the original persisted payment exactly.
  if v_attempt.status = 'succeeded' then
    if v_attempt.provider_transaction_id
      is distinct from p_transaction_id
    then
      raise exception 'Payment identifier conflicts with saved result';
    end if;

    select *
    into v_subscription
    from public.billing_test_subscriptions
    where initial_attempt_id = v_attempt.id
    for update;

    if not found then
      raise exception 'Saved subscription is missing';
    end if;

    select *
    into v_entitlement
    from public.billing_test_entitlements
    where subscription_id = v_subscription.id
      and payment_reference = p_reference
    for update;

    if not found then
      raise exception 'Saved entitlement is missing';
    end if;

    if v_entitlement.provider_transaction_id
        is distinct from p_transaction_id
      or v_entitlement.starts_at is distinct from p_paid_at
      or v_entitlement.expires_at is distinct from v_expires_at
    then
      raise exception 'Payment conflicts with saved entitlement';
    end if;

    -- No writes on replay. Preserve expiry and revocation.
    return jsonb_build_object(
      'persisted', true,
      'reused', true,
      'subscriptionId', v_subscription.id,
      'entitlementId', v_entitlement.id
    );
  end if;

  if v_attempt.provider_transaction_id is not null
    and v_attempt.provider_transaction_id <> p_transaction_id
  then
    raise exception 'Payment identifier conflicts with checkout';
  end if;

  -- A later provider-confirmed success may follow failed/abandoned.
  -- Unique constraints reject reuse of another payment's identifiers.
  insert into public.billing_test_subscriptions (
    initial_attempt_id,
    environment,
    status,
    current_period_start,
    current_period_end
  )
  values (
    v_attempt.id,
    'test',
    case when v_expires_at > now() then 'active' else 'expired' end,
    p_paid_at,
    v_expires_at
  )
  returning * into v_subscription;

  insert into public.billing_test_entitlements (
    subscription_id,
    environment,
    entitlement,
    provider_transaction_id,
    payment_reference,
    starts_at,
    expires_at,
    verified_at
  )
  values (
    v_subscription.id,
    'test',
    'brewprint_pro',
    p_transaction_id,
    p_reference,
    p_paid_at,
    v_expires_at,
    now()
  )
  returning * into v_entitlement;

  update public.billing_payment_attempts
  set
    status = 'succeeded',
    provider_transaction_id = p_transaction_id,
    verified_at = now()
  where id = v_attempt.id;

  return jsonb_build_object(
    'persisted', true,
    'reused', false,
    'subscriptionId', v_subscription.id,
    'entitlementId', v_entitlement.id
  );
end;
$function$;

revoke all on function
  public.persist_verified_paystack_test_payment(
    uuid, text, text, timestamptz, integer, text, text, text
  )
from public, anon, authenticated;

grant execute on function
  public.persist_verified_paystack_test_payment(
    uuid, text, text, timestamptz, integer, text, text, text
  )
to service_role;

commit;