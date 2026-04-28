'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/store';
import { formatRegionalPrice, convertPrice, toStripeAmount, type Region } from '@/lib/regions';

/**
 * useCurrencyFormatter
 * Returns helpers bound to the currently selected region.
 * Updates automatically when the user switches region — no page reload.
 */
export function useCurrencyFormatter() {
  const { region } = useStore();

  return useMemo(() => ({
    /** Format a USD base price for the current region */
    format: (usdPrice: number) => formatRegionalPrice(usdPrice, region),

    /** Convert USD → local numeric value */
    convert: (usdPrice: number) => convertPrice(usdPrice, region.currency),

    /** Amount in Stripe's smallest unit (cents / pence / etc.) */
    stripeAmount: (usdPrice: number) => toStripeAmount(usdPrice, region.currency),

    /** Stripe currency code (lowercase) */
    stripeCurrency: region.currency.toLowerCase(),

    /** The full region object */
    region,

    /** Currency symbol for inline use */
    symbol: region.symbol,
  }), [region]);
}

/**
 * Convenience: format a single price without hooks (for use in server components
 * or utilities that already have the region object).
 */
export { formatRegionalPrice, convertPrice, toStripeAmount };
export type { Region };
