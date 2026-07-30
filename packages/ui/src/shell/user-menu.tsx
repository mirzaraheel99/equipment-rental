'use client';

import type { Language } from '@erms/types';
import { LogOut, Moon, Sun, SunMoon, Languages } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { useTheme, type Theme } from '../theme/theme-provider';

export interface UserMenuProps {
  displayName: string;
  email: string;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onLogout: () => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: SunMoon },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** doc 21 §4.1 — user menu owns theme and language, kept in the global
 * header rather than a settings page users have to navigate away to. */
export function UserMenu({ displayName, email, language, onLanguageChange, onLogout }: UserMenuProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 items-center justify-center rounded-erms-full bg-brand-600 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label={`Account menu for ${displayName}`}
      >
        {initials(displayName)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-medium text-erms-fg">{displayName}</span>
          <span className="font-normal text-erms-muted">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {THEME_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setTheme(option.value)}
            aria-current={theme === option.value}
          >
            <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}>
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          {language === 'en' ? 'العربية' : 'English'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onLogout}>
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
