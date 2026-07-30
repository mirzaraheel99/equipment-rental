'use client';

import { useEffect, useState } from 'react';

/** Owns the Cmd/Ctrl+K global shortcut so no module wires its own (roadmap
 * Phase 04 Definition of Done). Pass the returned state to both the
 * header's search trigger and a `<CommandPalette>` rendered alongside it. */
export function useCommandPaletteShortcut(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return [open, setOpen];
}
