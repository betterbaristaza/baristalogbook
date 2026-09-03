export const BREWPRINT_PRICING = {
  monthly: {
    code: 'pro_monthly',
    amountZar: 59,
    label: 'Monthly',
  },

  annual: {
    code: 'pro_annual',
    amountZar: 499,
    label: 'Annual',
  },
} as const;

export const FREE_LIMITS = {
  visibleBrewHistory: 30,
} as const;

export const PRO_FEATURES = {
  fullBrewHistory: true,
  bestBrewsAnalytics: true,
  trends: true,
  methodAnalysis: true,
  fullCoffeeUsageAnalytics: true,
  backBagPhoto: true,
  brewPhotos: true,
  comparisonTools: true,
  experiments: true,
} as const;