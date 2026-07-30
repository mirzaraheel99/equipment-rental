import type { ReactNode } from 'react';

export interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
}

/** Compact top header + full-width content, no permanent sidebar (doc 21
 * §4.1/§4.2). Command-palette state is owned by the app via
 * `useCommandPaletteShortcut`, not by AppShell — the header needs to open
 * it and AppShell only lays out where it renders. */
export function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--erms-bg))] text-erms-fg">
      {header}
      <main className="flex-1">{children}</main>
    </div>
  );
}
