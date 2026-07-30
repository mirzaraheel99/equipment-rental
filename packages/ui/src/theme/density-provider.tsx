'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Compact is the enterprise default (doc 21 §5.2); Comfortable suits new
 * users/customer portal/mobile, Dense suits advanced power users. */
export type Density = 'comfortable' | 'compact' | 'dense';

interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextValue | undefined>(undefined);
const STORAGE_KEY = 'erms-density';

export interface DensityProviderProps {
  children: ReactNode;
  defaultDensity?: Density;
}

/** Persists density per user (doc 21 §5), applied via a `data-density`
 * attribute consumed by packages/ui/src/styles.css. */
export function DensityProvider({ children, defaultDensity = 'compact' }: DensityProviderProps) {
  const [density, setDensityState] = useState<Density>(defaultDensity);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Density | null;
    if (stored) setDensityState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const setDensity = useCallback((next: Density) => {
    setDensityState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<DensityContextValue>(() => ({ density, setDensity }), [density, setDensity]);

  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

export function useDensity(): DensityContextValue {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}
