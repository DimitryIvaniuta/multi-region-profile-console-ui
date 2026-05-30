import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  readonly loading?: boolean;
  readonly children: ReactNode;
};

export const Button = ({ variant = 'primary', loading = false, children, disabled, ...props }: ButtonProps) => (
  <button className={`button button--${variant}`} disabled={disabled ?? loading} {...props}>
    {loading ? <span className="spinner" aria-hidden="true" /> : null}
    <span>{children}</span>
  </button>
);
