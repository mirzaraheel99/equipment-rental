import { ThemeProvider } from '@erms/ui';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

import DashboardPage from '@/app/page';

const SESSION_STORAGE_KEY = 'erms-auth-session';

describe('DashboardPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replace.mockClear();
  });

  it('redirects to /login when no session is stored', () => {
    render(<DashboardPage />);

    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('renders the app shell once a session is stored', () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        userId: 'user-1',
        tenantId: 'tenant-1',
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
      }),
    );

    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>,
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
