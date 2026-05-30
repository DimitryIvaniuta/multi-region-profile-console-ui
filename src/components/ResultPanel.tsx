import type { ReactNode } from 'react';

type ResultPanelProps = {
  readonly title: string;
  readonly children: ReactNode;
};

export const ResultPanel = ({ title, children }: ResultPanelProps) => (
  <aside className="result-panel">
    <h3>{title}</h3>
    {children}
  </aside>
);
