import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

type BrewprintPlanCode =
  | 'pro_monthly'
  | 'pro_annual';

interface PlanConfig {
  amount: number;
  currency: 'ZAR';
  paystackPlanCode: string | undefined;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
}

const getPlanConfig = (
  planCode: BrewprintPlanCode
): PlanConfig => {
  const plans: Record<
    BrewprintPlanCode,
    PlanConfig
  > = {
    pro_monthly: {
      amount: 5900,
      currency: 'ZAR',
      paystackPlanCode:
        process.env.PAYSTACK_PLAN_PRO_MONTHLY,
    },

    pro_annual: {
      amount: 49900,
      currency: 'ZAR',
      paystackPlanCode:
        process.env.PAYSTACK_PLAN_PRO_ANNUAL,
    },
  };

  return plans[planCode];
};

const isValidPlanCode = (
  value: unknown
): value is BrewprintPlanCode =>
  value === 'pro_monthly' ||
  value === 'pro_annual';

const isSafeAuthorizationUrl = (
  value: string
): boolean => {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.hostname === 'checkout.paystack.com'
    );
  } catch {
    return false;
  }
};

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  const paystackSecretKey =
    process.env.PAYSTACK_SECRET_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    console.error(
      'Supabase server credentials are not configured'
    );

    return res.status(500).json({
      error: 'Payment service is not configured',
    });
  }

  if (!paystackSecretKey) {
    console.error(
      'PAYSTACK_SECRET_KEY is not configured'
    );

    return res.status(500).json({
      error: 'Payment service is not configured',
    });
  }

  /*
   * Hard safety guard.
   *
   * Brewprint payment development must remain
   * entirely in Paystack TEST mode.
   *
   * Even if a live key is accidentally configured,
   * this endpoint refuses to use it.
   */
  if (
    !paystackSecretKey.startsWith(
      'sk_test_'
    )
  ) {
    console.error(
      'Paystack initialization blocked because the configured key is not a TEST key'
    );

    return res.status(500).json({
      error: 'Payment service is not configured',
    });
  }

  const authorization =
    req.headers.authorization;

  if (
    !authorization?.startsWith(
      'Bearer '
    )
  ) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const accessToken =
    authorization.slice(7);

  const admin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    /*
     * Never trust a frontend user ID.
     *
     * The authenticated Brewprint user is
     * derived directly from the Supabase
     * access token.
     */
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(
      accessToken
    );

    if (
      userError ||
      !user
    ) {
      return res.status(401).json({
        error: 'Invalid session',
      });
    }

    if (!user.email) {
      return res.status(400).json({
        error:
          'Your account does not have an email address.',
      });
    }

    const { planCode } =
      req.body ?? {};

    /*
     * The client is allowed to choose only
     * a Brewprint plan identifier.
     *
     * Amounts, Paystack plan codes and
     * currency come from trusted
     * server-side configuration.
     */
    if (!isValidPlanCode(planCode)) {
      return res.status(400).json({
        error: 'Invalid plan',
      });
    }

    const plan =
      getPlanConfig(planCode);

    if (!plan.paystackPlanCode) {
      console.error(
        `Paystack plan configuration missing for ${planCode}`
      );

      return res.status(500).json({
        error:
          'Payment service is not configured',
      });
    }

    /*
     * Paystack references may contain
     * alphanumeric characters, hyphens,
     * periods and equals signs.
     */
    const reference =
      `bp-test-${planCode.replace(
        '_',
        '-'
      )}-${Date.now()}-${randomUUID()}`;

    const paystackResponse =
      await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            email: user.email,

            /*
             * Amount remains defined by
             * Brewprint server configuration.
             *
             * Paystack subscriptions also use
             * the trusted server-side plan code.
             */
            amount:
              String(plan.amount),

            currency:
              plan.currency,

            plan:
              plan.paystackPlanCode,

            reference,

            metadata:
              JSON.stringify({
                brewprint_user_id:
                  user.id,

                brewprint_plan_code:
                  planCode,

                brewprint_environment:
                  'test',
              }),
          }),
        }
      );

    let payload:
      | PaystackInitializeResponse
      | null = null;

    try {
      payload =
        (await paystackResponse.json()) as
          PaystackInitializeResponse;
    } catch {
      payload = null;
    }

    if (
      !paystackResponse.ok ||
      !payload?.status ||
      !payload.data
    ) {
      console.error(
        'Paystack initialization failed',
        {
          status:
            paystackResponse.status,
          message:
            payload?.message ??
            'Unknown Paystack response',
        }
      );

      return res.status(502).json({
        error:
          'Unable to initialize payment',
      });
    }

    const authorizationUrl =
      payload.data.authorization_url;

    const returnedReference =
      payload.data.reference;

    const accessCode =
      payload.data.access_code;

    if (
      !authorizationUrl ||
      !returnedReference ||
      !accessCode ||
      returnedReference !== reference ||
      !isSafeAuthorizationUrl(
        authorizationUrl
      )
    ) {
      console.error(
        'Paystack returned an invalid initialization response'
      );

      return res.status(502).json({
        error:
          'Unable to initialize payment',
      });
    }

    /*
     * Initialization is NOT proof of payment.
     *
     * No billing subscription is activated
     * here.
     *
     * No Brewprint Pro entitlement is
     * created here.
     *
     * Payment verification and webhook
     * handling will be implemented
     * separately.
     */
    return res.status(200).json({
      authorizationUrl,
      accessCode,
      reference,
    });
  } catch (error) {
    console.error(
      'Payment initialization error:',
      error
    );

    return res.status(500).json({
      error:
        'Unable to initialize payment',
    });
  }
}