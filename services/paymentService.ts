import { supabase } from './supabaseClient';

export type BrewprintPaidPlan =
  | 'pro_monthly'
  | 'pro_annual';

interface InitializePaymentResponse {
  authorizationUrl?: unknown;
  reference?: unknown;
  error?: unknown;
}

interface InitializedPayment {
  authorizationUrl: string;
  reference: string;
}

const isSafePaystackAuthorizationUrl = (
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

export const paymentService = {
  initializeCheckout: async (
    planCode: BrewprintPaidPlan
  ): Promise<InitializedPayment> => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.access_token) {
      throw new Error(
        'You are not signed in.'
      );
    }

    const response = await fetch(
      '/api/paystack-initialize',
      {
        method: 'POST',
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          planCode,
        }),
      }
    );

    const data =
      (await response
        .json()
        .catch(() => null)) as
        | InitializePaymentResponse
        | null;

    if (!response.ok) {
      throw new Error(
        typeof data?.error === 'string'
          ? data.error
          : 'Unable to start checkout.'
      );
    }

    if (
      typeof data?.authorizationUrl !==
        'string' ||
      !isSafePaystackAuthorizationUrl(
        data.authorizationUrl
      )
    ) {
      throw new Error(
        'Payment provider returned an invalid checkout URL.'
      );
    }

    if (
      typeof data?.reference !== 'string' ||
      !data.reference.startsWith(
        'bp-test-'
      )
    ) {
      throw new Error(
        'Payment provider returned an invalid payment reference.'
      );
    }

    return {
      authorizationUrl:
        data.authorizationUrl,
      reference: data.reference,
    };
  },
};