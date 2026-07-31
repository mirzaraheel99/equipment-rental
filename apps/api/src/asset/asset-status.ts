/**
 * The Golden Rule's controlled status enumeration (docs/04-Domain/05-
 * ASSET-REGISTRY-DOMAIN-SPECIFICATION.md §6.1) and the transition graph
 * that enforces it. The domain doc lists the enumeration but not an exact
 * transition matrix — this graph is this implementation's own reasonable
 * interpretation, not a confirmed business rule; flagged in the domain
 * doc's Open Questions for stakeholder sign-off before this ships. Only
 * this file may define valid transitions — no consuming service encodes
 * its own copy.
 */
export const ASSET_STATUSES = [
  'Available',
  'Reserved',
  'Rented',
  'InTransit',
  'InInspection',
  'InService',
  'PpmDue',
  'PpmLocked',
  'DamagedUnderClaimReview',
  'MissingLost',
  'ForSale',
  'Sold',
  'Decommissioned',
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

/** Statuses excluded from the rentable pool and availability search
 * results immediately and consistently (domain doc §15). */
export const NON_RENTABLE_STATUSES: ReadonlySet<AssetStatus> = new Set(['ForSale', 'Sold', 'Decommissioned']);

const TRANSITIONS: Record<AssetStatus, readonly AssetStatus[]> = {
  Available: ['Reserved', 'InService', 'PpmDue', 'ForSale', 'MissingLost', 'DamagedUnderClaimReview'],
  Reserved: ['Rented', 'Available'],
  Rented: ['InTransit', 'DamagedUnderClaimReview', 'MissingLost'],
  InTransit: ['InInspection'],
  InInspection: ['Available', 'InService', 'DamagedUnderClaimReview'],
  InService: ['Available', 'PpmDue', 'PpmLocked', 'ForSale', 'Decommissioned'],
  PpmDue: ['PpmLocked', 'InService'],
  PpmLocked: ['InService', 'Available'],
  DamagedUnderClaimReview: ['InService', 'ForSale', 'Decommissioned'],
  MissingLost: ['Available', 'Decommissioned'],
  ForSale: ['Sold', 'Available'],
  Sold: ['Decommissioned'],
  Decommissioned: [],
};

export function isValidTransition(from: AssetStatus, to: AssetStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
