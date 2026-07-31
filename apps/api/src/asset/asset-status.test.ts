import { isValidTransition } from './asset-status.js';

describe('asset status transitions (the Golden Rule)', () => {
  it('allows a well-formed lifecycle transition', () => {
    expect(isValidTransition('Available', 'Reserved')).toBe(true);
    expect(isValidTransition('Reserved', 'Rented')).toBe(true);
    expect(isValidTransition('Rented', 'InTransit')).toBe(true);
  });

  it('rejects an invalid transition (e.g. Sold -> Rented)', () => {
    expect(isValidTransition('Sold', 'Rented')).toBe(false);
  });

  it('treats Decommissioned as terminal — no outbound transitions', () => {
    expect(isValidTransition('Decommissioned', 'Available')).toBe(false);
    expect(isValidTransition('Decommissioned', 'InService')).toBe(false);
  });

  it('does not allow skipping the inspection step after a rental return', () => {
    expect(isValidTransition('InTransit', 'Available')).toBe(false);
  });
});
