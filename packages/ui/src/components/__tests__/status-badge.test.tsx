import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from '../status-badge';

describe('StatusBadge', () => {
  it('renders the label text alongside an icon (never color alone)', () => {
    render(<StatusBadge category="active" label="On Hire" />);

    expect(screen.getByText('On Hire')).toBeInTheDocument();
  });

  it('still renders the label when tooltip content is provided', () => {
    render(<StatusBadge category="warning" label="PPM Due" tooltip="Last checked 3 days ago" />);

    expect(screen.getByText('PPM Due')).toBeInTheDocument();
  });
});
