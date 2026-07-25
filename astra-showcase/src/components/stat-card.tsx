/**
 * AstraStore — Stat Card Component
 *
 * Reusable statistics card for the dashboard.
 * Demonstrates typed component props with full inference.
 *
 * Type: Component<StatCardProps>
 */

import type { Component } from '@astrajs/core';
import { styles } from '../styles/dashboard.css.js';

export interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  /** Optional: change color via inline style. */
  accent?: string;
}

/**
 * Stat card with icon, value, and label.
 *
 * @example
 * ```tsx
 * <StatCard icon="💰" value={totalRevenue} label="Total Revenue" accent="#10b981" />
 * ```
 */
export const StatCard: Component<StatCardProps> = ({
  icon,
  value,
  label,
  accent,
}) => {
  const displayValue = typeof value === 'number'
    ? formatCurrency(value)
    : value;

  return (
    <div class={styles['stat-card']}>
      <div class={styles['stat-icon']}>{icon}</div>
      <div
        class={styles['stat-value']}
        style={accent ? { color: accent } : undefined}
      >
        {displayValue}
      </div>
      <div class={styles['stat-label']}>{label}</div>
    </div>
  );
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
