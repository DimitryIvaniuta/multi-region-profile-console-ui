import type { ReactNode } from 'react';

type StatCardProps = {
  readonly label: string;
  readonly value: string | number;
  readonly tone?: 'neutral' | 'good' | 'warning' | 'danger';
  readonly children?: ReactNode;
};

export const StatCard = ({ label, value, tone = 'neutral', children }: StatCardProps) => (
  <article className={`stat-card stat-card--${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {children ? <p>{children}</p> : null}
  </article>
);
