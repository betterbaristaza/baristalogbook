import React from 'react';

import { useEntitlements } from '../context/EntitlementContext';

interface ProGateProps {
  children: React.ReactNode;

  fallback?: React.ReactNode;

  loadingFallback?: React.ReactNode;
}

export const ProGate = ({
  children,
  fallback = null,
  loadingFallback = null,
}: ProGateProps) => {
  const {
    isPro,
    loading,
  } = useEntitlements();

  if (loading) {
    return <>{loadingFallback}</>;
  }

  if (!isPro) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};