import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type PlanCode = 'pro_monthly' | 'pro_annual';
type Admin = SupabaseClient;

interface Attempt {
  id: string;
  reference: string;
  plan_code: PlanCode;
  status: string;
  authorization_url: string | null;
}

const TABLE = 'billing_payment_attempts';
const COLUMNS = 'id, reference, plan_code, status, authorization_url';
const BLOCKING = ['created', 'initializing', 'pending', 'unknown', 'succeeded'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);

    return url.origin === 'https://checkout.paystack.com'
      && !url.username
      && !url.password
      && url.pathname !== '/';
  } catch {
    return false;
  }
}

function getTestCallbackUrl(): string | null {
  const configured = process.env.PAYSTACK_TEST_CALLBACK_URL;

  if (!configured || configured !== configured.trim()) {
    return null;
  }

  try {
    const callback = new URL(configured);

    if (
      callback.protocol !== 'https:'
      || callback.username
      || callback.password
      || callback.port
      || callback.pathname !== '/payments/return'
      || callback.search
      || callback.hash
    ) {
      return null;
    }

    // Only deployment configuration selects the destination.
    // Never derive it from request headers or client input.
    return callback.href;
  } catch {
    return null;
  }
}

async function findBlocking(admin: Admin, userId: string) {
  const { data, error } = await admin
    .from(TABLE)
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('environment', 'test')
    .in('status', BLOCKING)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error('attempt_lookup_failed');

  return data as Attempt | null;
}

function respondWithAttempt(
  res: any,
  attempt: Attempt,
  planCode: PlanCode
) {
  if (attempt.plan_code !== planCode) {
    return res.status(409).json({
      error:
        'Another plan has an unresolved checkout. Resolve it before changing plans.',
    });
  }

  if (
    attempt.status === 'pending'
    && safeCheckoutUrl(attempt.authorization_url)
  ) {
    return res.status(200).json({
      authorizationUrl: attempt.authorization_url,
      reference: attempt.reference,
      reused: true,
    });
  }

  return res.status(409).json({
    error:
      'This payment attempt needs verification before another checkout can start.',
  });
}

async function paystack(
  secret: string,
  path: string,
  body?: object
) {
  const response = await fetch('https://api.paystack.co' + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: 'Bearer ' + secret,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
    redirect: 'error',
  });

  const payload = await response.json();

  if (!response.ok || payload?.status !== true || !payload.data) {
    throw new Error('provider_request_failed');
  }

  return payload.data;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const authorization = req.headers?.authorization;

  if (
    typeof authorization !== 'string'
    || !/^Bearer \S+$/i.test(authorization)
  ) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      error: 'Invalid request body',
    });
  }

  const { planCode, idempotencyKey } = body;

  if (planCode !== 'pro_monthly' && planCode !== 'pro_annual') {
    return res.status(400).json({
      error: 'Invalid plan',
    });
  }

  if (
    idempotencyKey !== undefined
    && (
      typeof idempotencyKey !== 'string'
      || !UUID.test(idempotencyKey)
    )
  ) {
    return res.status(400).json({
      error: 'Invalid checkout request key',
    });
  }

  const url = process.env.SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const callbackUrl = getTestCallbackUrl();

  const monthly = planCode === 'pro_monthly';
  const amount = monthly ? 5900 : 49900;
  const interval = monthly ? 'monthly' : 'annually';

  const providerPlan = monthly
    ? process.env.PAYSTACK_PLAN_PRO_MONTHLY
    : process.env.PAYSTACK_PLAN_PRO_ANNUAL;

  if (
    !url
    || !serverKey
    || !callbackUrl
    || !secret?.startsWith('sk_test_')
    || !providerPlan
    || !/^PLN_[A-Za-z0-9]+$/.test(providerPlan)
  ) {
    console.error('paystack_initialize: configuration_invalid');

    return res.status(503).json({
      error: 'TEST payment service is not configured.',
    });
  }

  let admin: Admin | undefined;
  let reserved: Attempt | null = null;
  let ownerId: string | undefined;

  try {
    admin = createClient(url, serverKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error,
    } = await admin.auth.getUser(authorization.slice(7));

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid session',
      });
    }

    if (!user.email || !user.email_confirmed_at) {
      return res.status(403).json({
        error: 'Verify your email before starting checkout.',
      });
    }

    ownerId = user.id;

    if (idempotencyKey) {
      const previous = await admin
        .from(TABLE)
        .select(COLUMNS)
        .eq('user_id', user.id)
        .eq('environment', 'test')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (previous.error) {
        throw new Error('attempt_lookup_failed');
      }

      if (previous.data) {
        return respondWithAttempt(
          res,
          previous.data as Attempt,
          planCode
        );
      }
    }

    const existing = await findBlocking(admin, user.id);

    if (existing) {
      return respondWithAttempt(res, existing, planCode);
    }

    // Paystack's plan overrides the initialize amount.
    // Validate the provider plan before creating an attempt.
    const plan = await paystack(
      secret,
      '/plan/' + encodeURIComponent(providerPlan)
    );

    if (
      plan.domain !== 'test'
      || plan.plan_code !== providerPlan
      || plan.amount !== amount
      || plan.currency !== 'ZAR'
      || plan.interval !== interval
    ) {
      console.error('paystack_initialize: provider_plan_mismatch');

      return res.status(503).json({
        error: 'TEST payment plan configuration does not match.',
      });
    }

    // Only the request that wins this INSERT may initialize checkout.
    const inserted = await admin
      .from(TABLE)
      .insert({
        user_id: user.id,
        environment: 'test',
        idempotency_key: idempotencyKey ?? randomUUID(),
        reference: 'bp-test-' + randomUUID(),
        plan_code: planCode,
        amount,
        currency: 'ZAR',
        paystack_plan_code: providerPlan,
        status: 'initializing',
      })
      .select(COLUMNS)
      .single();

    if (inserted.error) {
      if (inserted.error.code === '23505') {
        const winner = await findBlocking(admin, user.id);

        if (winner) {
          return respondWithAttempt(res, winner, planCode);
        }

        return res.status(409).json({
          error: 'Checkout request already exists. Refresh your account.',
        });
      }

      throw new Error('attempt_insert_failed');
    }

    reserved = inserted.data as Attempt;

    const checkout = await paystack(
      secret,
      '/transaction/initialize',
      {
        email: user.email,
        amount: String(amount),
        currency: 'ZAR',
        plan: providerPlan,
        reference: reserved.reference,
        callback_url: callbackUrl,
        metadata: JSON.stringify({
          brewprint_user_id: user.id,
          brewprint_plan_code: planCode,
          brewprint_environment: 'test',
        }),
      }
    );

    if (
      checkout.reference !== reserved.reference
      || !safeCheckoutUrl(checkout.authorization_url)
    ) {
      throw new Error('provider_response_invalid');
    }

    const saved = await admin
      .from(TABLE)
      .update({
        authorization_url: checkout.authorization_url,
        status: 'pending',
      })
      .eq('id', reserved.id)
      .eq('user_id', user.id)
      .eq('status', 'initializing')
      .select(COLUMNS)
      .maybeSingle();

    if (saved.error || !saved.data) {
      throw new Error('attempt_save_failed');
    }

    // A saved checkout URL is not proof of payment.
    // No Pro access is granted here.
    return res.status(200).json({
      authorizationUrl: saved.data.authorization_url,
      reference: saved.data.reference,
      reused: false,
    });
  } catch {
    // Do not log exceptions, provider payloads, tokens,
    // email addresses or checkout URLs.
    console.error(
      reserved
        ? 'paystack_initialize: reconciliation_required'
        : 'paystack_initialize: request_failed'
    );

    if (admin && reserved && ownerId) {
      try {
        const result = await admin
          .from(TABLE)
          .update({ status: 'unknown' })
          .eq('id', reserved.id)
          .eq('user_id', ownerId)
          .eq('status', 'initializing');

        if (result.error) {
          console.error('paystack_initialize: uncertainty_update_failed');
        }
      } catch {
        console.error('paystack_initialize: uncertainty_update_failed');
      }
    }

    return res.status(503).json({
      error: reserved
        ? 'Checkout could not be confirmed. The saved attempt must be checked before starting another.'
        : 'Unable to start checkout. Please try again shortly.',
    });
  }
}