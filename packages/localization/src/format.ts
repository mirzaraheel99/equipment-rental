import type { Language } from '@erms/types';

const LOCALE_TAG: Record<Language, string> = {
  en: 'en-SA',
  ar: 'ar-SA',
};

export function formatNumber(
  value: number,
  language: Language,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(LOCALE_TAG[language], options).format(value);
}

export function formatCurrency(
  value: number,
  language: Language,
  currency = 'SAR',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(LOCALE_TAG[language], {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

export function formatDate(
  value: Date | string,
  language: Language,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE_TAG[language], options ?? { dateStyle: 'medium' }).format(
    date,
  );
}

export function formatDateTime(value: Date | string, language: Language): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE_TAG[language], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
