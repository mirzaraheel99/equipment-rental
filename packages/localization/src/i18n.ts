import type { Language } from '@erms/types';
import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import arCommon from './translations/ar/common.json';
import arErrors from './translations/ar/errors.json';
import arNavigation from './translations/ar/navigation.json';
import arValidation from './translations/ar/validation.json';
import enCommon from './translations/en/common.json';
import enErrors from './translations/en/errors.json';
import enNavigation from './translations/en/navigation.json';
import enValidation from './translations/en/validation.json';

export const I18N_NAMESPACES = ['common', 'navigation', 'errors', 'validation'] as const;
export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

// eslint-disable-next-line no-restricted-syntax -- dev-only warning gate; not a config value, no @erms/config schema needed for it
const isDevelopment = process.env.NODE_ENV !== 'production';

const resources = {
  en: { common: enCommon, navigation: enNavigation, errors: enErrors, validation: enValidation },
  ar: { common: arCommon, navigation: arNavigation, errors: arErrors, validation: arValidation },
} as const;

export interface CreateI18nOptions {
  language: Language;
}

/**
 * Creates a fresh i18next instance per render tree (required for SSR — a
 * module-level singleton would leak language between concurrent requests).
 * Logs a warning in development when a translation key is missing rather
 * than silently falling back, per the localization foundation's
 * "missing-key development warnings" requirement.
 */
export function createI18nInstance(options: CreateI18nOptions): I18nInstance {
  const instance = i18next.createInstance();

  void instance.use(initReactI18next).init({
    lng: options.language,
    fallbackLng: 'en',
    ns: I18N_NAMESPACES,
    defaultNS: 'common',
    resources,
    interpolation: { escapeValue: false },
    saveMissing: isDevelopment,
    missingKeyHandler: (lngs, ns, key) => {
      if (isDevelopment) {
        console.warn(
          `[i18n] Missing key "${key}" in namespace "${ns}" for locale(s) ${lngs.join(', ')}`,
        );
      }
    },
  });

  return instance;
}
