import { v7 as uuidv7 } from 'uuid';

/** UUID v7 (time-ordered) per the database dictionary's primary-key
 * preference (docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md §3.3) —
 * better index locality than v4 for the append-heavy tables (audit_event,
 * domain_event, ...) this phase introduces. */
export function generateId(): string {
  return uuidv7();
}
