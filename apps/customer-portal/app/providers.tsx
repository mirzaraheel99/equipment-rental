'use client';

import type { Language } from '@erms/types';
import { DirectionProvider, ThemeProvider } from '@erms/ui';
import type { ReactNode } from 'react';

export function Providers({ language, children }: { language: Language; children: ReactNode }) {
  return (
    <ThemeProvider>
      <DirectionProvider language={language}>{children}</DirectionProvider>
    </ThemeProvider>
  );
}
