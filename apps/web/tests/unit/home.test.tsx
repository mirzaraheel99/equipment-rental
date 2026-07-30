import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the setup confirmation heading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /project bootstrap/i })).toBeInTheDocument();
  });
});
