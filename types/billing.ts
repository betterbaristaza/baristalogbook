export type BrewprintAccessLevel =
  | 'free'
  | 'pro';

export type BrewprintPaidPlan =
  | 'pro_monthly'
  | 'pro_annual';

export type BrewprintEntitlement =
  | 'brewprint_pro';

export type BillingProvider =
  | 'paystack'
  | 'stripe'
  | 'apple'
  | 'google'
  | 'manual';

export type BillingStatus =
  | 'pending'
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'expired'
  | 'incomplete';

export type EntitlementSource =
  | BillingProvider
  | 'beta'
  | 'promo';

export interface BillingSubscription {
  id: string;
  user_id: string;

  provider: BillingProvider;

  provider_customer_id: string | null;
  provider_subscription_id: string | null;

  plan: BrewprintPaidPlan;
  status: BillingStatus;

  current_period_start: string | null;
  current_period_end: string | null;

  cancel_at_period_end: boolean;
  canceled_at: string | null;

  metadata: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

export interface UserEntitlement {
  id: string;
  user_id: string;

  entitlement: BrewprintEntitlement;
  source: EntitlementSource;

  source_reference: string | null;

  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface EntitlementState {
  accessLevel: BrewprintAccessLevel;

  isPro: boolean;

  billingPlan: BrewprintPaidPlan | null;

  entitlements: UserEntitlement[];

  subscription: BillingSubscription | null;
}