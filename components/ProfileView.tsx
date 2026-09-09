import React, { useState } from 'react';

import { UserProfile } from '../types';
import { useEntitlements } from '../context/EntitlementContext';

import {
  paymentService,
  type BrewprintPaidPlan,
} from '../services/paymentService';

interface ProfileViewProps {
  profile: UserProfile | null;
  email?: string;
  coffeeCount: number;
  brewCount: number;
  onEdit: () => void;
  onExportData: () => void;
  onSignOut: () => void | Promise<void>;
  onDeleteAccount: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  email,
  coffeeCount,
  brewCount,
  onEdit,
  onExportData,
  onSignOut,
  onDeleteAccount,
}) => {
  const {
    isPro,
    billingPlan,
    loading: entitlementsLoading,
  } = useEntitlements();

  const [
    checkoutPlan,
    setCheckoutPlan,
  ] = useState<BrewprintPaidPlan | null>(
    null
  );

  const handleStartCheckout = async (
    planCode: BrewprintPaidPlan
  ) => {
    if (
      entitlementsLoading ||
      isPro ||
      checkoutPlan
    ) {
      return;
    }

    try {
      setCheckoutPlan(planCode);

      const {
        authorizationUrl,
      } =
        await paymentService.initializeCheckout(
          planCode
        );

      window.location.assign(
        authorizationUrl
      );
    } catch (error) {
      console.error(
        'Unable to start Paystack checkout:',
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Unable to start checkout.'
      );

      setCheckoutPlan(null);
    }
  };

  const monthlyLoading =
    checkoutPlan === 'pro_monthly';

  const annualLoading =
    checkoutPlan === 'pro_annual';

  return (
    <div className="space-y-8">
      <section className="border-b border-[var(--bp-line)] pb-6">
        <p className="bp-index">
          08 / PROFILE
        </p>

        <h1 className="bp-heading mt-2 text-3xl text-[var(--bp-blue)]">
          Profile
        </h1>

        <p className="bp-code mt-2 max-w-md text-[var(--bp-muted)]">
          Account identity, brewing defaults and BREWPRINT data.
        </p>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            08.01 / IDENTITY
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Brewer Record
          </h2>
        </div>

        <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="border-b border-[var(--bp-line)] p-5">
            <p className="bp-label text-[var(--bp-muted)]">
              Display Name
            </p>

            <p className="mt-2 text-xl font-semibold text-[var(--bp-blue)]">
              {profile?.name || 'Not set'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
              <p className="bp-label text-[var(--bp-muted)]">
                Role
              </p>

              <p className="bp-code mt-2 text-[var(--bp-blue)]">
                {profile?.role || 'Not set'}
              </p>
            </div>

            <div className="p-4">
              <p className="bp-label text-[var(--bp-muted)]">
                Account Email
              </p>

              <p className="bp-code mt-2 break-all text-[var(--bp-blue)]">
                {email || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            08.02 / DEFAULTS
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Brewing Defaults
          </h2>

          <p className="bp-code mt-1 text-[var(--bp-muted)]">
            Used to speed up future brew records.
          </p>
        </div>

        <div className="grid grid-cols-1 border border-[var(--bp-line)] bg-[var(--bp-paper-light)] sm:grid-cols-3">
          <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
            <p className="bp-label text-[var(--bp-muted)]">
              Method
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
              {profile?.defaultMethod &&
              profile.defaultMethod !== 'all'
                ? profile.defaultMethod
                : 'Not specified'}
            </p>
          </div>

          <div className="border-b border-[var(--bp-line)] p-4 sm:border-b-0 sm:border-r">
            <p className="bp-label text-[var(--bp-muted)]">
              Grinder
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
              {profile?.defaultGrinder || 'Not set'}
            </p>
          </div>

          <div className="p-4">
            <p className="bp-label text-[var(--bp-muted)]">
              Brewer
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
              {profile?.defaultBrewer || 'Not set'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="mt-4 flex min-h-14 w-full items-center justify-between border border-[var(--bp-line)] bg-[var(--bp-orange)] px-5 text-[var(--bp-blue)]"
        >
          <div className="text-left">
            <p className="bp-label">
              Update record
            </p>

            <p className="mt-1 text-sm font-semibold">
              Edit Profile
            </p>
          </div>

          <span
            aria-hidden="true"
            className="bp-code text-lg"
          >
            →
          </span>
        </button>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            08.03 / BREWPRINT PRO
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Account Access
          </h2>
        </div>

        {entitlementsLoading ? (
          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)] p-5">
            <p className="bp-label text-[var(--bp-muted)]">
              Checking account access...
            </p>
          </div>
        ) : isPro ? (
          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="border-b border-[var(--bp-line)] p-5">
              <p className="bp-label text-[var(--bp-orange)]">
                Brewprint Pro
              </p>

              <h3 className="bp-heading mt-2 text-xl text-[var(--bp-blue)]">
                Pro Access Active
              </h3>
            </div>

            <div className="p-5">
              <p className="bp-code text-[var(--bp-muted)]">
                Current plan
              </p>

              <p className="bp-code mt-2 text-[var(--bp-blue)]">
                {billingPlan === 'pro_monthly'
                  ? 'Brewprint Pro Monthly'
                  : billingPlan === 'pro_annual'
                    ? 'Brewprint Pro Annual'
                    : 'Brewprint Pro'}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
            <div className="border-b border-[var(--bp-line)] p-5">
              <p className="bp-label text-[var(--bp-orange)]">
                Brewprint Pro
              </p>

              <h3 className="bp-heading mt-2 text-xl text-[var(--bp-blue)]">
                Unlock Pro
              </h3>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--bp-muted)]">
                Choose a Brewprint Pro plan. Checkout is currently running in Paystack TEST mode.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <button
                type="button"
                disabled={Boolean(checkoutPlan)}
                onClick={() =>
                  void handleStartCheckout(
                    'pro_monthly'
                  )
                }
                className="min-h-28 border-b border-[var(--bp-line)] p-5 text-left disabled:cursor-wait disabled:opacity-60 sm:border-b-0 sm:border-r"
              >
                <p className="bp-label text-[var(--bp-muted)]">
                  Monthly
                </p>

                <p className="bp-measurement mt-2 text-2xl font-semibold text-[var(--bp-blue)]">
                  R59
                </p>

                <p className="bp-code mt-1 text-[var(--bp-muted)]">
                  per month
                </p>

                <p className="bp-label mt-4 text-[var(--bp-orange)]">
                  {monthlyLoading
                    ? 'Starting checkout...'
                    : 'Choose Monthly →'}
                </p>
              </button>

              <button
                type="button"
                disabled={Boolean(checkoutPlan)}
                onClick={() =>
                  void handleStartCheckout(
                    'pro_annual'
                  )
                }
                className="min-h-28 p-5 text-left disabled:cursor-wait disabled:opacity-60"
              >
                <p className="bp-label text-[var(--bp-muted)]">
                  Annual
                </p>

                <p className="bp-measurement mt-2 text-2xl font-semibold text-[var(--bp-blue)]">
                  R499
                </p>

                <p className="bp-code mt-1 text-[var(--bp-muted)]">
                  per year
                </p>

                <p className="bp-label mt-4 text-[var(--bp-orange)]">
                  {annualLoading
                    ? 'Starting checkout...'
                    : 'Choose Annual →'}
                </p>
              </button>
            </div>

            <div className="border-t border-[var(--bp-line)] px-5 py-4">
              <p className="bp-code text-[var(--bp-muted)]">
                TEST MODE. Initializing checkout does not grant Brewprint Pro access. Payment verification will be handled separately.
              </p>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            08.04 / DATA
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Account Data
          </h2>
        </div>

        <div className="grid grid-cols-3 border border-[var(--bp-line)] bg-[var(--bp-paper-light)]">
          <div className="border-r border-[var(--bp-line)] p-4">
            <p className="bp-label text-[var(--bp-muted)]">
              Coffees
            </p>

            <p className="bp-measurement mt-2 text-2xl font-semibold text-[var(--bp-blue)]">
              {coffeeCount}
            </p>
          </div>

          <div className="border-r border-[var(--bp-line)] p-4">
            <p className="bp-label text-[var(--bp-muted)]">
              Brews
            </p>

            <p className="bp-measurement mt-2 text-2xl font-semibold text-[var(--bp-blue)]">
              {brewCount}
            </p>
          </div>

          <div className="p-4">
            <p className="bp-label text-[var(--bp-muted)]">
              Sync
            </p>

            <p className="bp-code mt-2 text-[var(--bp-blue)]">
              CLOUD
            </p>
          </div>
        </div>

        <p className="bp-code mt-3 text-[var(--bp-muted)]">
          Profile, coffee records and brew records are synced to your authenticated account.
        </p>

        <button
          type="button"
          onClick={onExportData}
          className="mt-4 flex min-h-14 w-full items-center justify-between border border-[var(--bp-line)] bg-[var(--bp-paper-light)] px-5 text-[var(--bp-blue)]"
        >
          <div className="text-left">
            <p className="bp-label">
              Export User Data
            </p>

            <p className="mt-1 text-sm font-semibold">
              Profile, coffees and brew records
            </p>
          </div>

          <span
            aria-hidden="true"
            className="bp-code text-lg"
          >
            ↓
          </span>
        </button>
      </section>

      <section>
        <div className="mb-3">
          <p className="bp-index">
            08.05 / ACCOUNT
          </p>

          <h2 className="bp-heading mt-1 text-lg text-[var(--bp-blue)]">
            Account Controls
          </h2>
        </div>

        <div className="grid grid-cols-1 border border-[var(--bp-line)] sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="bp-label min-h-14 border-b border-[var(--bp-line)] px-4 text-[var(--bp-blue)] sm:border-b-0 sm:border-r"
          >
            Sign Out
          </button>

          <button
            type="button"
            onClick={onDeleteAccount}
            className="bp-label min-h-14 px-4 text-[var(--bp-danger)]"
          >
            Delete Account
          </button>
        </div>
      </section>

      <section className="border border-[var(--bp-danger)] bg-[var(--bp-paper-light)]">
        <div className="border-b border-[var(--bp-danger)] p-4">
          <p className="bp-index text-[var(--bp-danger)]">
            08.06 / DANGER ZONE
          </p>
        </div>

        <div className="p-4">
          <p className="text-sm leading-relaxed text-[var(--bp-muted)]">
            Deleting your account permanently removes your profile, coffee records, brew records and uploaded images.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProfileView;