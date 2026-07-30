import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from './providers';

import { publicEnv } from '@/lib/env';

import './globals.css';

export const metadata: Metadata = {
  title: 'ERMS Customer Portal',
  description: 'Self-service portal for ERMS customers',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={publicEnv.NEXT_PUBLIC_DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <Providers language={publicEnv.NEXT_PUBLIC_DEFAULT_LOCALE}>{children}</Providers>
      </body>
    </html>
  );
}
