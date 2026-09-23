import { supabase } from './supabaseClient';
import type { BrewprintPaidPlan } from './paymentService';

const TEST_REFERENCE = /^bp-test-[A-Za-z0-9.=-]{1,160}$/;

const UNCONFIRMED_STATUSES = [
  'abandoned',
  'failed',
  'ongoing',
  'pending',
  'processing',
  'queued',
  'reversed',
] as const;

type UnconfirmedStatus = typeof UNCONFIRMED_STATUSES[number];

interface VerificationBase {
  environment: 'test';
  reference: string;
  planCode: BrewprintPaidPlan;
}

export type TestPaymentVerification =
  | (VerificationBase & {
      paymentStatus: 'success';
      paymentVerified: true;
      entitlementApplied: true;
      persistenceReused: boolean;
    })
  | (VerificationBase & {
      paymentStatus: UnconfirmedStatus;
      paymentVerified: false;
      entitlementApplied: false;
      persistenceReused: false;
    });

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function isUnconfirmedStatus(value: unknown): value is UnconfirmedStatus {
  return UNCONFIRMED_STATUSES.some(status => status === value);
}

export function isTestPaymentReference(value: unknown): value is string {
  return typeof value === 'string' && TEST_REFERENCE.test(value);
}

export async function verifyTestPayment(
  reference: string,
  signal?: AbortSignal
): Promise<TestPaymentVerification> {
  if (!isTestPaymentReference(reference)) {
    throw new Error('Invalid TEST payment reference.');
  }

  signal?.throwIfAborted();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  signal?.throwIfAborted();

  if (error) {
    throw new Error('Unable to check your session. Please sign in again.');
  }

  if (!session?.access_token) {
    throw new Error('Sign in to verify your TEST payment.');
  }

  // The reference identifies a payment to check. It is not proof of payment.
  // The server verifies ownership, provider details and TEST persistence.
  const response = await fetch('/api/paystack-verify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ reference }),
    cache: 'no-store',
    redirect: 'error',
    signal,
  });

  const data = asObject(
    await response.json().catch(() => null)
  );

  signal?.throwIfAborted();

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string'
        ? data.error
        : 'Unable to verify your TEST payment. Retry this same payment.'
    );
  }

  if (
    !data
    || data.environment !== 'test'
    || data.reference !== reference
    || (
      data.planCode !== 'pro_monthly'
      && data.planCode !== 'pro_annual'
    )
  ) {
    throw new Error('The server returned an invalid payment verification.');
  }

  const base: VerificationBase = {
    environment: 'test',
    reference,
    planCode: data.planCode,
  };

  if (
    data.paymentStatus === 'success'
    && data.paymentVerified === true
    && data.entitlementApplied === true
    && typeof data.persistenceReused === 'boolean'
  ) {
    // This confirms TEST persistence only.
    // Current TEST access requires a separate status lookup.
    // Production Pro access is not changed by this result.
    return {
      ...base,
      paymentStatus: 'success',
      paymentVerified: true,
      entitlementApplied: true,
      persistenceReused: data.persistenceReused,
    };
  }

  if (
    isUnconfirmedStatus(data.paymentStatus)
    && data.paymentVerified === false
    && data.entitlementApplied === false
    && data.persistenceReused === false
  ) {
    return {
      ...base,
      paymentStatus: data.paymentStatus,
      paymentVerified: false,
      entitlementApplied: false,
      persistenceReused: false,
    };
  }

  throw new Error('The server returned an inconsistent payment verification.');
}
