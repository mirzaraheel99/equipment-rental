export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const TEXT_DIRECTIONS = ['ltr', 'rtl'] as const;
export type TextDirection = (typeof TEXT_DIRECTIONS)[number];

export const LANGUAGE_DIRECTION: Record<Language, TextDirection> = {
  en: 'ltr',
  ar: 'rtl',
};
