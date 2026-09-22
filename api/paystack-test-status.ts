import { createClient } from '@supabase/supabase-js';

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Authorization');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers?.authorization;

  if (
    typeof authorization !== 'string'
    || !/^Bearer \S+$/i.test(authorization)
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = process.env.SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!url || !serverKey || !secret?.startsWith('sk_test_')) {
    return res.status(503).json({
      error: 'TEST billing status is not configured.',
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

    const checkedAt = new Date().toISOString();

    // Both joins are required. Ownership comes from the saved attempt,
    // never from a user ID supplied by the browser.
    const { data, error } = await admin
      .from('billing_test_entitlements')
      .select(`
        environment,
        entitlement,
        starts_at,
        expires_at,
        revoked_at,
        subscription:billing_test_subscriptions!inner(
          environment,
          attempt:billing_payment_attempts!inner(
            user_id,
            environment,
            plan_code,
            status
          )
        )
      `)
      .eq('environment', 'test')
      .eq('entitlement', 'brewprint_pro')
      .is('revoked_at', null)
      .lte('starts_at', checkedAt)
      .gt('expires_at', checkedAt)
      .eq('subscription.environment', 'test')
      .eq('subscription.attempt.environment', 'test')
      .eq('subscription.attempt.user_id', user.id)
      .eq('subscription.attempt.status', 'succeeded')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error('test_status_lookup_failed');
    }

    if (!data) {
      return res.status(200).json({
        environment: 'test',
        testAccessActive: false,
        planCode: null,
        startsAt: null,
        expiresAt: null,
        checkedAt,
      });
    }

    const entitlement = asObject(data);
    const subscription = asObject(entitlement?.subscription);
    const attempt = asObject(subscription?.attempt);

    const startsAt = entitlement?.starts_at;
    const expiresAt = entitlement?.expires_at;
    const planCode = attempt?.plan_code;
    const now = Date.parse(checkedAt);

    // Validate the returned relationship and dates before reporting access.
    if (
      entitlement?.environment !== 'test'
      || entitlement?.entitlement !== 'brewprint_pro'
      || entitlement?.revoked_at !== null
      || subscription?.environment !== 'test'
      || attempt?.environment !== 'test'
      || attempt?.user_id !== user.id
      || attempt?.status !== 'succeeded'
      || (planCode !== 'pro_monthly' && planCode !== 'pro_annual')
      || typeof startsAt !== 'string'
      || typeof expiresAt !== 'string'
      || !Number.isFinite(Date.parse(startsAt))
      || !Number.isFinite(Date.parse(expiresAt))
      || Date.parse(startsAt) > now
      || Date.parse(expiresAt) <= now
    ) {
      throw new Error('test_status_invalid');
    }

    // Display-only TEST status. This does not grant production Pro access.
    return res.status(200).json({
      environment: 'test',
      testAccessActive: true,
      planCode,
      startsAt,
      expiresAt,
      checkedAt,
    });
  } catch {
    console.error('paystack_test_status: unavailable');

    return res.status(503).json({
      error: 'Unable to check TEST access. Please try again shortly.',
    });
  }
}
