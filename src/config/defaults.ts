import { loadRuntimeDefaults } from './runtimeConfig';
import type { AppSettings, RegionTarget } from '../types/api';

export const DEFAULT_SETTINGS: AppSettings = loadRuntimeDefaults();

export const buildRegionTargets = (settings: AppSettings): readonly RegionTarget[] => [
  { code: 'primary', label: 'Primary Write Region', role: 'PRIMARY', baseUrl: settings.primaryBaseUrl },
  { code: 'eu', label: 'EU Read Region', role: 'READ_REPLICA', baseUrl: settings.euReadBaseUrl },
  { code: 'us', label: 'US Read Region', role: 'READ_REPLICA', baseUrl: settings.usReadBaseUrl },
];
