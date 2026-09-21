import { createClient } from '@supabase/supabase-js';

const REFERENCE = /^bp-test-[A-Za-z0-9.=-]{1,160}$/;

const PAYMENT_STATUSES = new Set([
  'abandoned',
  'failed',
  'ongoing',
  'pending',
  'processing',
  'queued',
  'reversed',
  'success',
]);

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      return asObject(JSON.parse(value));
    } catch {
      return null;
    }
  }

  return asObject(value);
}

function validTransactionId(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0;
  }

  return typeof value === 'string' && /^[1-9][0-9]*$/.test(value);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers?.authorization;

  if (
    typeof authorization !== 'string'
    || !/^Bearer \S+$/i.test(authorization)
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = parseObject(req.body);
  const reference = body?.reference;

  if (
    typeof reference !== 'string'
    || !REFERENCE.test(reference)
  ) {
    return res.status(400).json({
      error: 'Invalid payment reference.',
    });
  }

  const url = process.env.SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!url || !serverKey || !secret?.startsWith('sk_test_')) {
    console.error('paystack_verify: configuration_invalid');
    return res.status(503).json({
      error: 'TEST payment verification is not configured.',
    });
  }

  try {
    const admin = createClient(url, serverKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(authorization.slice(7));

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Ownership is checked before contacting Paystack.
    // Missing references and another user's references return the same error.
    const { data: attempt, error: lookupError } = await admin
      .from('billing_payment_attempts')
      .select(
        'reference, user_id, environment, plan_code, amount, currency, paystack_plan_code'
      )
      .eq('reference', reference)
      .eq('user_id', user.id)
      .eq('environment', 'test')
      .maybeSingle();

    if (lookupError) {
      throw new Error('attempt_lookup_failed');
    }

    if (!attempt) {
      return res.status(404).json({
        error: 'Payment attempt not found.',
      });
    }

    const expectedAmount =
      attempt.plan_code === 'pro_monthly'
        ? 5900
        : attempt.plan_code === 'pro_annual'
          ? 49900
          : null;

    if (
      expectedAmount === null
      || attempt.amount !== expectedAmount
      || attempt.currency !== 'ZAR'
      || attempt.environment !== 'test'
      || attempt.user_id !== user.id
    ) {
      throw new Error('saved_attempt_invalid');
    }

    const response = await fetch(
      'https://api.paystack.co/transaction/verify/'
        + encodeURIComponent(attempt.reference),
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + secret,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15000),
        redirect: 'error',
      }
    );

    const payload = asObject(await response.json());
    const payment = asObject(payload?.data);

    if (!response.ok || payload?.status !== true || !payment) {
      throw new Error('provider_verification_unavailable');
    }

    const metadata = parseObject(payment.metadata);

    if (
      payment.domain !== 'test'
      || payment.reference !== attempt.reference
      || payment.amount !== attempt.amount
      || payment.currency !== attempt.currency
      || metadata?.brewprint_user_id !== user.id
      || metadata?.brewprint_plan_code !== attempt.plan_code
      || metadata?.brewprint_environment !== 'test'
    ) {
      console.error('paystack_verify: transaction_mismatch');
      return res.status(409).json({
        error: 'Payment details do not match the saved checkout.',
      });
    }

    if (
      typeof payment.status !== 'string'
      || !PAYMENT_STATUSES.has(payment.status)
    ) {
      throw new Error('provider_status_invalid');
    }

    if (payment.status === 'success') {
      const plan = asObject(payment.plan);
      const planObject = asObject(payment.plan_object);
      const providerPlan =
        typeof payment.plan === 'string'
          ? payment.plan
          : plan?.plan_code ?? planObject?.plan_code;

      if (
        providerPlan !== attempt.paystack_plan_code
        || !validTransactionId(payment.id)
        || typeof payment.paid_at !== 'string'
        || !Number.isFinite(Date.parse(payment.paid_at))
      ) {
        console.error('paystack_verify: success_details_invalid');
        return res.status(409).json({
          error: 'Payment confirmation is incomplete or inconsistent.',
        });
      }
    }

    // Inspection only. No attempt, subscription or entitlement writes.
    // A failed or abandoned result does not unlock another checkout here.
       let entitlementApplied = false;
    let persistenceReused = false;

    if (payment.status === 'success') {
      // All provider and ownership checks above must pass first.
      // Numeric IDs have already passed the safe-integer check.
      const { data: saved, error: saveError } = await admin.rpc(
        'persist_verified_paystack_test_payment',
        {
          p_user_id: user.id,
          p_reference: attempt.reference,
          p_transaction_id: String(payment.id),
          p_paid_at: payment.paid_at,
          p_amount: attempt.amount,
          p_currency: attempt.currency,
          p_plan_code: attempt.plan_code,
          p_paystack_plan_code: attempt.paystack_plan_code,
        }
      );

      const result = asObject(saved);

      if (
        saveError
        || result?.persisted !== true
        || typeof result.reused !== 'boolean'
      ) {
        console.error('paystack_verify: persistence_unconfirmed');

        // The transaction might have committed before a response was lost.
        // Retrying the same reference safely retrieves the saved result.
        return res.status(503).json({
          error:
            'Payment was verified, but saving could not be confirmed. Retry verification for this same payment.',
        });
      }

      entitlementApplied = true;
      persistenceReused = result.reused;
    }

    // entitlementApplied means a TEST entitlement record exists.
    // It does not mean the entitlement is currently active:
    // expiration and revocation must be checked when reading access.
    // Production entitlements remain unchanged.
    return res.status(200).json({
      environment: 'test',
      reference: attempt.reference,
      planCode: attempt.plan_code,
      paymentStatus: payment.status,
      paymentVerified: payment.status === 'success',
      entitlementApplied,
      persistenceReused,
    });
  } catch {
    console.error('paystack_verify: verification_unavailable');

    return res.status(503).json({
      error: 'Unable to verify payment right now. Please try again shortly.',
    });
  }
}