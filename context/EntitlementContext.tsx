import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  EMPTY_ENTITLEMENT_STATE,
  getEntitlementState,
} from '../services/billingService';

import { supabase } from '../services/supabaseClient';

import type {
  BillingSubscription,
  BrewprintAccessLevel,
  BrewprintEntitlement,
  BrewprintPaidPlan,
  EntitlementState,
  UserEntitlement,
} from '../types/billing';

interface EntitlementContextValue {
  accessLevel: BrewprintAccessLevel;

  isPro: boolean;

  billingPlan: BrewprintPaidPlan | null;

  entitlements: UserEntitlement[];

  subscription: BillingSubscription | null;

  loading: boolean;

  error: string | null;

  hasEntitlement: (
    entitlement: BrewprintEntitlement
  ) => boolean;

  refresh: () => Promise<void>;
}

const EntitlementContext =
  createContext<
    EntitlementContextValue | undefined
  >(undefined);

interface EntitlementProviderProps {
  children: React.ReactNode;
}

export const EntitlementProvider = ({
  children,
}: EntitlementProviderProps) => {
  const [
    entitlementState,
    setEntitlementState,
  ] = useState<EntitlementState>(
    EMPTY_ENTITLEMENT_STATE
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const refresh = useCallback(
    async () => {
      try {
        setError(null);

        const nextState =
          await getEntitlementState();

        setEntitlementState(
          nextState
        );
      } catch (currentError) {
        console.error(
          'Failed to load Brewprint entitlements:',
          currentError
        );

        setEntitlementState(
          EMPTY_ENTITLEMENT_STATE
        );

        setError(
          currentError instanceof Error
            ? currentError.message
            : 'Unable to load account access.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void refresh();

    const {
      data: {
        subscription:
          authSubscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        event => {
          if (
            event === 'SIGNED_IN' ||
            event ===
              'TOKEN_REFRESHED' ||
            event ===
              'USER_UPDATED'
          ) {
            void refresh();
            return;
          }

          if (
            event === 'SIGNED_OUT'
          ) {
            setEntitlementState(
              EMPTY_ENTITLEMENT_STATE
            );

            setError(null);
            setLoading(false);
          }
        }
      );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [refresh]);

  const hasEntitlement =
    useCallback(
      (
        entitlement:
          BrewprintEntitlement
      ): boolean => {
        return entitlementState
          .entitlements
          .some(
            current =>
              current.entitlement ===
              entitlement
          );
      },
      [
        entitlementState
          .entitlements,
      ]
    );

  const value =
    useMemo<EntitlementContextValue>(
      () => ({
        accessLevel:
          entitlementState
            .accessLevel,

        isPro:
          entitlementState.isPro,

        billingPlan:
          entitlementState
            .billingPlan,

        entitlements:
          entitlementState
            .entitlements,

        subscription:
          entitlementState
            .subscription,

        loading,

        error,

        hasEntitlement,

        refresh,
      }),
      [
        entitlementState,
        loading,
        error,
        hasEntitlement,
        refresh,
      ]
    );

  return (
    <EntitlementContext.Provider
      value={value}
    >
      {children}
    </EntitlementContext.Provider>
  );
};

export const useEntitlements =
  (): EntitlementContextValue => {
    const context =
      useContext(
        EntitlementContext
      );

    if (!context) {
      throw new Error(
        'useEntitlements must be used inside EntitlementProvider.'
      );
    }

    return context;
  };