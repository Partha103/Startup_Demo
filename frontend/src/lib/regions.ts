/**
 * TANTA — Region & Currency System
 * Supports 12 regions with local currency, formatting, and exchange rates.
 * Exchange rates are relative to USD (base). Update EXCHANGE_RATES periodically
 * or swap the static table for a live-rate API fetch (e.g. Open Exchange Rates).
 */

export interface Region {
  code:       string;   // ISO 3166-1 alpha-2 country code (or 'EU')
  name:       string;   // Display name
  currency:   string;   // ISO 4217 currency code
  symbol:     string;   // Short symbol shown in UI
  locale:     string;   // BCP 47 locale for Intl.NumberFormat
  flag:       string;   // Emoji flag
  continent:  string;   // For grouping
  stripeLow:  boolean;  // Whether Stripe supports this currency in test mode easily
}

export const REGIONS: Region[] = [
  { code: 'US', name: 'United States',   currency: 'USD', symbol: '$',     locale: 'en-US', flag: '🇺🇸', continent: 'Americas',  stripeLow: true  },
  { code: 'GB', name: 'United Kingdom',  currency: 'GBP', symbol: '£',     locale: 'en-GB', flag: '🇬🇧', continent: 'Europe',    stripeLow: true  },
  { code: 'EU', name: 'Europe (EUR)',    currency: 'EUR', symbol: '€',     locale: 'de-DE', flag: '🇪🇺', continent: 'Europe',    stripeLow: true  },
  { code: 'IN', name: 'India',           currency: 'INR', symbol: '₹',     locale: 'en-IN', flag: '🇮🇳', continent: 'Asia',      stripeLow: true  },
  { code: 'JP', name: 'Japan',           currency: 'JPY', symbol: '¥',     locale: 'ja-JP', flag: '🇯🇵', continent: 'Asia',      stripeLow: true  },
  { code: 'AU', name: 'Australia',       currency: 'AUD', symbol: 'A$',    locale: 'en-AU', flag: '🇦🇺', continent: 'Oceania',   stripeLow: true  },
  { code: 'CA', name: 'Canada',          currency: 'CAD', symbol: 'CA$',   locale: 'en-CA', flag: '🇨🇦', continent: 'Americas',  stripeLow: true  },
  { code: 'AE', name: 'UAE',             currency: 'AED', symbol: 'د.إ',   locale: 'ar-AE', flag: '🇦🇪', continent: 'Asia',      stripeLow: false },
  { code: 'SG', name: 'Singapore',       currency: 'SGD', symbol: 'S$',    locale: 'en-SG', flag: '🇸🇬', continent: 'Asia',      stripeLow: true  },
  { code: 'CH', name: 'Switzerland',     currency: 'CHF', symbol: 'Fr',    locale: 'de-CH', flag: '🇨🇭', continent: 'Europe',    stripeLow: true  },
  { code: 'KR', name: 'South Korea',     currency: 'KRW', symbol: '₩',     locale: 'ko-KR', flag: '🇰🇷', continent: 'Asia',      stripeLow: true  },
  { code: 'BR', name: 'Brazil',          currency: 'BRL', symbol: 'R$',    locale: 'pt-BR', flag: '🇧🇷', continent: 'Americas',  stripeLow: true  },
];

/**
 * Static exchange rates vs USD (1 USD = X local).
 * Last updated: 2026-04. Replace with live API in production.
 * Recommended: Open Exchange Rates, Fixer.io, or ExchangeRate-API.
 */
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.00,
  GBP: 0.79,
  EUR: 0.92,
  INR: 83.50,
  JPY: 149.80,
  AUD: 1.53,
  CAD: 1.36,
  AED: 3.67,
  SGD: 1.34,
  CHF: 0.90,
  KRW: 1340.00,
  BRL: 4.97,
};

/** JPY, KRW and similar currencies have no decimals */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW']);

/** Default fallback region */
export const DEFAULT_REGION: Region = REGIONS[0]; // US

/** Look up a region by its code */
export function getRegionByCode(code: string): Region | undefined {
  return REGIONS.find((r) => r.code === code);
}

/** Look up a region by IP-detected country code */
export function matchRegionByCountry(countryCode: string): Region {
  // Exact match
  const exact = REGIONS.find((r) => r.code === countryCode);
  if (exact) return exact;
  // European countries → EUR region
  const EU_COUNTRIES = new Set([
    'DE','FR','IT','ES','NL','BE','AT','PT','FI','IE','GR',
    'PL','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT',
    'LU','MT','CY','DK','SE',
  ]);
  if (EU_COUNTRIES.has(countryCode)) return REGIONS.find((r) => r.code === 'EU')!;
  return DEFAULT_REGION;
}

/**
 * Convert a USD base price to the target currency.
 * Returns the numeric value (not formatted).
 */
export function convertPrice(usdPrice: number, toCurrency: string): number {
  const rate = EXCHANGE_RATES[toCurrency] ?? 1;
  const converted = usdPrice * rate;
  if (ZERO_DECIMAL_CURRENCIES.has(toCurrency)) {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

/**
 * Format a USD price for a given region.
 * Handles locale-correct formatting, zero-decimal currencies, and symbol placement.
 */
export function formatRegionalPrice(usdPrice: number, region: Region): string {
  const value = convertPrice(usdPrice, region.currency);
  return new Intl.NumberFormat(region.locale, {
    style:                 'currency',
    currency:              region.currency,
    minimumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(region.currency) ? 0 : 0,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(region.currency) ? 0 : 0,
  }).format(value);
}

/**
 * For Stripe: amount must be in the smallest currency unit (e.g. cents).
 * Zero-decimal currencies are already in whole units.
 */
export function toStripeAmount(usdPrice: number, currency: string): number {
  const value = convertPrice(usdPrice, currency);
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) return Math.round(value);
  return Math.round(value * 100);
}

/** Grouped regions for the selector UI */
export function getGroupedRegions(): Record<string, Region[]> {
  return REGIONS.reduce<Record<string, Region[]>>((acc, r) => {
    (acc[r.continent] ??= []).push(r);
    return acc;
  }, {});
}

/** localStorage key */
export const REGION_STORAGE_KEY = 'tanta_region';
