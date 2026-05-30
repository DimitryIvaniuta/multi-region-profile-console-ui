import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const BankIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M4 10h16" />
    <path d="M6 10v8" />
    <path d="M10 10v8" />
    <path d="M14 10v8" />
    <path d="M18 10v8" />
    <path d="M12 3 4 8h16Z" />
  </svg>
);

export const DashboardIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SyncIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M21 12a9 9 0 0 0-15-6.7L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    <path d="M21 21v-5h-5" />
  </svg>
);

export const ShieldIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7.1 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
  </svg>
);


export const CompareIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M4 6h7" />
    <path d="M4 12h11" />
    <path d="M4 18h7" />
    <path d="m17 7 3 3-3 3" />
    <path d="M14 10h6" />
  </svg>
);

export const AuditIcon = (props: IconProps) => (
  <svg {...baseProps} {...props} aria-hidden="true">
    <path d="M9 11h6" />
    <path d="M9 15h6" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M14 3v5h5" />
  </svg>
);
