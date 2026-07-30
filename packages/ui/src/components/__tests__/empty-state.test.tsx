import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('renders the title and optional description', () => {
    render(<EmptyState title="No reservations today" description="Try widening the date range." />);

    expect(screen.getByText('No reservations today')).toBeInTheDocument();
    expect(screen.getByText('Try widening the date range.')).toBeInTheDocument();
  });
});
