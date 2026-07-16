/**
 * Currency formatting utilities — Vietnamese Dong (VND) focused
 */

/** Format number to VND currency (e.g., 15.000.000 ₫) */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'VND',
  locale: string = 'vi-VN',
): string {
  if (amount == null) return '-';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number with thousand separators (e.g., 1.248) */
export function formatNumber(
  value: number | null | undefined,
  locale: string = 'vi-VN',
): string {
  if (value == null) return '-';
  return new Intl.NumberFormat(locale).format(value);
}

/** Format decimal number (e.g., 8.5) */
export function formatDecimal(
  value: number | null | undefined,
  decimals: number = 1,
  locale: string = 'vi-VN',
): string {
  if (value == null) return '-';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format percentage (e.g., 95,2%) */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1,
): string {
  if (value == null) return '-';
  return `${value.toFixed(decimals)}%`;
}
