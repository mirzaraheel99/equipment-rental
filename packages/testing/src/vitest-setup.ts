import '@testing-library/jest-dom/vitest';

/** jsdom doesn't implement matchMedia — needed by @erms/ui's ThemeProvider
 * (and anything else querying `prefers-color-scheme`). */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

