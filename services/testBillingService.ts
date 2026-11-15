import { supabase } from './supabaseClient';
import type { BrewprintPaidPlan } from './paymentService';

export type TestBillingStatus =
  | {
      environment: 'test';
      testAccessActive: true;
      planCode: BrewprintPaidPlan;
      startsAt: string;
      expiresAt: string;
      checkedAt: string;
    }
  | {
      environment: 'test';
      testAccessActive: false;
      planCode: null;
      startsAt: null;
      expiresAt: null;
      checkedAt: string;
    };

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function validDate(value: unknown): value is string {
  return (
    typeof value === 'string'
    && Number.isFinite(Date.parse(value))
  );
}

export async function getTestBillingStatus(
  signal?: AbortSignal
): Promise<TestBillingStatus> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error('You are not signed in.');
  }

  const response = await fetch('/api/paystack-test-status', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: 'no-store',
    signal,
  });

  const data = asObject(
    await response.json().catch(() => null)
  );

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string'
        ? data.error
        : 'Unable to check TEST access. Please try again.'
    );
  }

  if (
    data?.environment !== 'test'
    || !validDate(data.checkedAt)
  ) {
    throw new Error('The server returned an invalid TEST access status.');
  }

  if (
    data.testAccessActive === false
    && data.planCode === null
    && data.startsAt === null
    && data.expiresAt === null
  ) {
    return {
      environment: 'test',
      testAccessActive: false,
      planCode: null,
      startsAt: null,
      expiresAt: null,
      checkedAt: data.checkedAt,
    };
  }

  if (
    data.testAccessActive === true
    && (
      data.planCode === 'pro_monthly'
      || data.planCode === 'pro_annual'
    )
    && validDate(data.startsAt)
    && validDate(data.expiresAt)
    && Date.parse(data.startsAt) <= Date.parse(data.checkedAt)
    && Date.parse(data.expiresAt) > Date.parse(data.checkedAt)
  ) {
    return {
      environment: 'test',
      testAccessActive: true,
      planCode: data.planCode,
      startsAt: data.startsAt,
      expiresAt: data.expiresAt,
      checkedAt: data.checkedAt,
    };
  }

  throw new Error('The server returned an invalid TEST access status.');
}
