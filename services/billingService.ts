import { supabase } from './supabaseClient';

import type {
  BillingSubscription,
  BrewprintEntitlement,
  EntitlementState,
  UserEntitlement,
} from '../types/billing';

export const EMPTY_ENTITLEMENT_STATE: EntitlementState = {
  accessLevel: 'free',
  isPro: false,
  billingPlan: null,
  entitlements: [],
  subscription: null,
};

const isEntitlementActive = (
  entitlement: UserEntitlement,
  now: Date
): boolean => {
  if (entitlement.revoked_at) {
    return false;
  }

  const startsAt = new Date(
    entitlement.starts_at
  );

  if (
    Number.isNaN(startsAt.getTime()) ||
    startsAt > now
  ) {
    return false;
  }

  if (entitlement.expires_at) {
    const expiresAt = new Date(
      entitlement.expires_at
    );

    if (
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt <= now
    ) {
      return false;
    }
  }

  return true;
};

const getCurrentSubscription = (
  subscriptions: BillingSubscription[]
): BillingSubscription | null => {
  if (subscriptions.length === 0) {
    return null;
  }

  const statusPriority: Record<
    BillingSubscription['status'],
    number
  > = {
    active: 7,
    past_due: 6,
    paused: 5,
    pending: 4,
    incomplete: 3,
    canceled: 2,
    expired: 1,
  };

  return [...subscriptions].sort(
    (a, b) => {
      const statusDifference =
        statusPriority[b.status] -
        statusPriority[a.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return (
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime()
      );
    }
  )[0];
};

export const getEntitlementState =
  async (): Promise<EntitlementState> => {
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    const user = authData.user;

    if (!user) {
      return EMPTY_ENTITLEMENT_STATE;
    }

    const [
      entitlementResult,
      subscriptionResult,
    ] = await Promise.all([
      supabase
        .from('user_entitlements')
        .select('*')
        .eq('user_id', user.id),

      supabase
        .from('billing_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', {
          ascending: false,
        }),
    ]);

    if (entitlementResult.error) {
      throw entitlementResult.error;
    }

    if (subscriptionResult.error) {
      throw subscriptionResult.error;
    }

    const entitlements =
      (entitlementResult.data ??
        []) as UserEntitlement[];

    const subscriptions =
      (subscriptionResult.data ??
        []) as BillingSubscription[];

    const now = new Date();

    const activeEntitlements =
      entitlements.filter(
        entitlement =>
          isEntitlementActive(
            entitlement,
            now
          )
      );

    const isPro =
      activeEntitlements.some(
        entitlement =>
          entitlement.entitlement ===
          'brewprint_pro'
      );

    const subscription =
      getCurrentSubscription(
        subscriptions
      );

    return {
      accessLevel: isPro
        ? 'pro'
        : 'free',

      isPro,

      billingPlan:
        subscription?.plan ?? null,

      entitlements:
        activeEntitlements,

      subscription,
    };
  };

export const hasEntitlement = (
  state: EntitlementState,
  entitlement: BrewprintEntitlement
): boolean => {
  return state.entitlements.some(
    current =>
      current.entitlement ===
      entitlement
  );
};