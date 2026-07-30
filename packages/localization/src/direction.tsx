'use client';

import { LANGUAGE_DIRECTION, type Language, type TextDirection } from '@erms/types';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface DirectionContextValue {
  language: Language;
  direction: TextDirection;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

export interface DirectionProviderProps {
  language: Language;
  children: ReactNode;
}

/**
 * Sets logical direction for the subtree. Consumers should mirror layout,
 * navigation, and form flow for RTL, but must NOT mirror charts, maps,
 * media controls, or brand marks — per the UI design system's RTL rules
 * (docs/08-UX/21-UI-DESIGN-SYSTEM-AND-INTERACTION-STANDARDS.md).
 */
export function DirectionProvider({ language, children }: DirectionProviderProps) {
  const value = useMemo<DirectionContextValue>(
    () => ({ language, direction: LANGUAGE_DIRECTION[language] }),
    [language],
  );

  return (
    <DirectionContext.Provider value={value}>
      <div dir={value.direction} lang={language}>
        {children}
      </div>
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionContextValue {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
}
