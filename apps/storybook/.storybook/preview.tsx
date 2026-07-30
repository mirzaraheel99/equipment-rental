import { DirectionProvider, ThemeProvider } from '@erms/ui';
import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Language } from '@erms/types';

import '../styles.css';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    backgrounds: { disable: true },
  },
  globalTypes: {
    locale: {
      description: 'Language / direction',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English (LTR)' },
          { value: 'ar', title: 'العربية (RTL)' },
        ],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story, context) => (
      <ThemeProvider>
        <DirectionProvider language={context.globals.locale as Language}>
          <Story />
        </DirectionProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
