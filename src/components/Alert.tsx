import type { ReactNode } from 'react';

type AlertProps = {
  readonly type: 'success' | 'error' | 'info' | 'warning';
  readonly title: string;
  readonly children?: ReactNode;
};

export const Alert = ({ type, title, children }: AlertProps) => (
  <section className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
    <strong>{title}</strong>
    {children ? <div>{children}</div> : null}
  </section>
);
