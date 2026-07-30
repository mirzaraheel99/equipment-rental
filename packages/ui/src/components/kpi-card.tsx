import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

import { Skeleton } from './skeleton';

export type KpiTrendDirection = 'up' | 'down' | 'flat';

export interface KpiCardProps {
  title: string;
  value: ReactNode;
  /** Small metadata line — e.g. "vs. last 7 days" (doc 21 §11.3). */
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { direction: KpiTrendDirection; label: string };
  loading?: boolean;
  /** doc 21 §9.3 — trend color is caller-supplied, never assumed from
   * direction alone (a cost reduction can be a "down" that's good news). */
  trendTone?: 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
  className?: string;
}

const TREND_ICON: Record<KpiTrendDirection, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TONE_CLASS: Record<NonNullable<KpiCardProps['trendTone']>, string> = {
  success: 'text-success-500',
  warning: 'text-warning-500',
  danger: 'text-danger-500',
  neutral: 'text-erms-muted',
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendTone = 'neutral',
  loading,
  onClick,
  className,
}: KpiCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : undefined;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') onClick();
            }
          : undefined
      }
      className={cn(
        'flex flex-col gap-2 rounded-erms-md border border-erms-border bg-[rgb(var(--erms-bg))] p-4',
        onClick && 'cursor-pointer transition-shadow hover:shadow-erms-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-erms-muted">{title}</p>
        {Icon ? <Icon className="h-4 w-4 text-erms-muted" aria-hidden="true" /> : null}
      </div>

      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-2xl font-semibold tabular-nums text-erms-fg">{value}</p>
      )}

      {(subtitle ?? trend) && !loading ? (
        <div className="flex items-center gap-1.5 text-xs">
          {trend && TrendIcon ? (
            <span className={cn('inline-flex items-center gap-1', TONE_CLASS[trendTone])}>
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              {trend.label}
            </span>
          ) : null}
          {subtitle ? <span className="text-erms-muted">{subtitle}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
