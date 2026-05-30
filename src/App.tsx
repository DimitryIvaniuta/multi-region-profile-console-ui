import { useState } from 'react';
import { BankShell } from './components/BankShell';
import { loadSettings } from './config/settingsStorage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { OperationsPage } from './features/ops/OperationsPage';
import { ActivityLogPage } from './features/audit/ActivityLogPage';
import { RegionComparePage } from './features/compare/RegionComparePage';
import { CreateProfilePage } from './features/profiles/CreateProfilePage';
import { ReadProfilePage } from './features/profiles/ReadProfilePage';
import { UpdateProfilePage } from './features/profiles/UpdateProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { useHashRoute } from './hooks/useHashRoute';
import type { AppSettings } from './types/api';

export const App = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const { route, navigateTo } = useHashRoute();

  const page = (() => {
    switch (route) {
      case 'create':
        return <CreateProfilePage settings={settings} />;
      case 'update':
        return <UpdateProfilePage settings={settings} />;
      case 'read':
        return <ReadProfilePage settings={settings} />;
      case 'compare':
        return <RegionComparePage settings={settings} />;
      case 'ops':
        return <OperationsPage settings={settings} />;
      case 'audit':
        return <ActivityLogPage />;
      case 'settings':
        return <SettingsPage settings={settings} onSettingsChanged={setSettings} />;
      case 'dashboard':
      default:
        return <DashboardPage settings={settings} />;
    }
  })();

  return (
    <BankShell activeRoute={route} settings={settings} onNavigate={navigateTo}>
      {page}
    </BankShell>
  );
};
