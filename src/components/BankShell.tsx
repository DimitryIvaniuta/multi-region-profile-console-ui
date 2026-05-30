import type { ReactNode } from 'react';
import { AuditIcon, BankIcon, CompareIcon, DashboardIcon, SettingsIcon, ShieldIcon, SyncIcon, UserIcon } from './Icons';
import { maskSecret } from '../utils/security';
import type { AppSettings } from '../types/api';
import type { RouteKey } from '../hooks/useHashRoute';

type NavItem = {
  readonly route: RouteKey;
  readonly label: string;
  readonly icon: ReactNode;
};

const NAV_ITEMS: readonly NavItem[] = [
  { route: 'dashboard', label: 'Global Overview', icon: <DashboardIcon /> },
  { route: 'create', label: 'Create Profile', icon: <UserIcon /> },
  { route: 'update', label: 'Update / Deactivate', icon: <UserIcon /> },
  { route: 'read', label: 'Regional Read', icon: <SyncIcon /> },
  { route: 'compare', label: 'Region Compare', icon: <CompareIcon /> },
  { route: 'ops', label: 'Operations', icon: <ShieldIcon /> },
  { route: 'audit', label: 'Activity Audit', icon: <AuditIcon /> },
  { route: 'settings', label: 'Connection Settings', icon: <SettingsIcon /> },
];

type BankShellProps = {
  readonly activeRoute: RouteKey;
  readonly settings: AppSettings;
  readonly onNavigate: (route: RouteKey) => void;
  readonly children: ReactNode;
};

export const BankShell = ({ activeRoute, settings, onNavigate, children }: BankShellProps) => (
  <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <span className="brand__mark"><BankIcon /></span>
          <div>
            <strong>Profile Bank</strong>
            <small>Multi-region console</small>
          </div>
        </div>
        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              className={activeRoute === item.route ? 'nav-item nav-item--active' : 'nav-item'}
              onClick={() => onNavigate(item.route)}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <span>Console auth</span>
          <strong>{maskSecret(settings.apiKey)}</strong>
          <small>API keys are stored in session storage only.</small>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Read-heavy profile platform</p>
            <h1>Global Profile Operations Console</h1>
          </div>
          <div className="region-strip" aria-label="Configured backend regions">
            <span>Primary: {settings.primaryBaseUrl}</span>
            <span>EU: {settings.euReadBaseUrl}</span>
            <span>US: {settings.usReadBaseUrl}</span>
          </div>
        </header>
        <main className="content" id="main-content">{children}</main>
        <footer className="footer">
          <span>Production console pattern: header, sidebar, controlled forms, safe API headers and no local PII logging.</span>
        </footer>
      </div>
    </div>
  </>
);
