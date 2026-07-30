import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Shared render helper so component tests don't each hand-roll the same
 * provider tree. Extend the `wrapper` here as more app-wide providers
 * (theme, direction, query client) become mandatory context.
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions): RenderResult {
  return render(ui, options);
}

export * from '@testing-library/react';
