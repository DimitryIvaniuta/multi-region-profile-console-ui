import { useEffect, useMemo, useState } from 'react';

export type RouteKey = 'dashboard' | 'create' | 'update' | 'read' | 'compare' | 'ops' | 'audit' | 'settings';

const allowedRoutes = new Set<RouteKey>(['dashboard', 'create', 'update', 'read', 'compare', 'ops', 'audit', 'settings']);

const currentRoute = (): RouteKey => {
  const hash = window.location.hash.replace(/^#\/?/, '') as RouteKey;
  return allowedRoutes.has(hash) ? hash : 'dashboard';
};

export const navigateTo = (route: RouteKey): void => {
  window.location.hash = `/${route}`;
};

export const useHashRoute = () => {
  const [route, setRoute] = useState<RouteKey>(() => currentRoute());

  useEffect(() => {
    const listener = () => setRoute(currentRoute());
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);

  return useMemo(() => ({ route, navigateTo }), [route]);
};
