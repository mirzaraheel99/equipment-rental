import {
  AlertOctagon,
  AlertTriangle,
  Ban,
  CalendarX,
  CheckCircle2,
  Circle,
  Clock,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { Badge, type BadgeProps } from './badge';
import { Tooltip } from './tooltip';

/** doc 21 §10.1 — status is never conveyed by color alone; every category
 * pairs a badge variant with a distinct icon. */
export const STATUS_BADGE_CATEGORIES = [
  'neutral',
  'active',
  'pending',
  'warning',
  'blocked',
  'completed',
  'cancelled',
  'expired',
  'critical',
  'informational',
] as const;
export type StatusBadgeCategory = (typeof STATUS_BADGE_CATEGORIES)[number];

const CATEGORY_CONFIG: Record<StatusBadgeCategory, { variant: BadgeProps['variant']; icon: LucideIcon }> = {
  neutral: { variant: 'neutral', icon: Circle },
  active: { variant: 'success', icon: CheckCircle2 },
  pending: { variant: 'info', icon: Clock },
  warning: { variant: 'warning', icon: AlertTriangle },
  blocked: { variant: 'danger', icon: Ban },
  completed: { variant: 'success', icon: CheckCircle2 },
  cancelled: { variant: 'neutral', icon: XCircle },
  expired: { variant: 'danger', icon: CalendarX },
  critical: { variant: 'danger', icon: AlertOctagon },
  informational: { variant: 'info', icon: Info },
};

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category: StatusBadgeCategory;
  label: string;
  /** doc 21 §10.2 — tooltip for last-changed time, owner, or other context. */
  tooltip?: string;
}

export function StatusBadge({ category, label, tooltip, className, ...props }: StatusBadgeProps) {
  const { variant, icon: Icon } = CATEGORY_CONFIG[category];

  const badge = (
    <Badge variant={variant} className={className} {...props}>
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );

  return tooltip ? <Tooltip content={tooltip}>{badge}</Tooltip> : badge;
}
