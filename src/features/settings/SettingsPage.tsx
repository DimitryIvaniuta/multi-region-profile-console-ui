import { useState } from 'react';
import { getBackendHealth } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { PageHeader } from '../../components/PageHeader';
import { resetSettings, saveSettings } from '../../config/settingsStorage';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { AppSettings, BackendHealthResponse } from '../../types/api';
import { appendActivity } from '../../utils/activityLog';
import { hasErrors, validateSettings, type FieldErrors } from '../../utils/validation';

type SettingsPageProps = {
  readonly settings: AppSettings;
  readonly onSettingsChanged: (settings: AppSettings) => void;
};

type ConnectionCheckResult = {
  readonly primary: BackendHealthResponse;
  readonly eu: BackendHealthResponse;
  readonly us: BackendHealthResponse;
};

export const SettingsPage = ({ settings, onSettingsChanged }: SettingsPageProps) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [errors, setErrors] = useState<FieldErrors<'primaryBaseUrl' | 'euReadBaseUrl' | 'usReadBaseUrl' | 'apiKey' | 'internalKey' | 'requestTimeoutMs'>>({});
  const [saved, setSaved] = useState(false);
  const checkAction = useAsyncAction<ConnectionCheckResult>();

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const persist = () => {
    const validation = validateSettings(draft);
    setErrors(validation);
    if (hasErrors(validation)) {
      return;
    }
    const normalized: AppSettings = {
      ...draft,
      primaryBaseUrl: draft.primaryBaseUrl.trim().replace(/\/$/, ''),
      euReadBaseUrl: draft.euReadBaseUrl.trim().replace(/\/$/, ''),
      usReadBaseUrl: draft.usReadBaseUrl.trim().replace(/\/$/, ''),
      apiKey: draft.apiKey.trim(),
      internalKey: draft.internalKey.trim(),
      requestTimeoutMs: Math.trunc(draft.requestTimeoutMs),
    };
    saveSettings(normalized);
    onSettingsChanged(normalized);
    setDraft(normalized);
    setSaved(true);
    appendActivity({ action: 'SAVE_SETTINGS', region: 'console', outcome: 'INFO', details: 'Updated connection settings for this browser session.' });
  };

  const restoreDefaults = () => {
    const defaults = resetSettings();
    setDraft(defaults);
    onSettingsChanged(defaults);
    setSaved(true);
    setErrors({});
    appendActivity({ action: 'RESET_SETTINGS', region: 'console', outcome: 'INFO', details: 'Restored runtime/default connection settings.' });
  };

  const checkConnections = async () => {
    const validation = validateSettings(draft);
    setErrors(validation);
    if (hasErrors(validation)) {
      return;
    }
    const context = { credentials: { apiKey: draft.apiKey, internalKey: draft.internalKey }, timeoutMs: draft.requestTimeoutMs };
    const checked = await checkAction.run(async () => {
      const [primary, eu, us] = await Promise.all([
        getBackendHealth(draft.primaryBaseUrl, context),
        getBackendHealth(draft.euReadBaseUrl, context),
        getBackendHealth(draft.usReadBaseUrl, context),
      ]);
      return { primary, eu, us };
    });
    appendActivity({
      action: 'CHECK_CONNECTIONS',
      region: 'all-regions',
      outcome: checked ? 'SUCCESS' : 'FAILED',
      details: checked ? `Health: primary=${checked.primary.status}, eu=${checked.eu.status}, us=${checked.us.status}.` : 'Connection health check failed.',
    });
  };

  return (
    <div className="page-stack two-column">
      <section>
        <PageHeader
          eyebrow="Secure configuration"
          title="Backend connection settings"
          description="Configure region base URLs and API headers. Secrets are kept in session storage and are sent only as request headers."
        />
        <form className="bank-card form-card" onSubmit={(event) => { event.preventDefault(); persist(); }}>
          <Field label="Primary base URL" value={draft.primaryBaseUrl} onChange={(e) => update('primaryBaseUrl', e.target.value)} error={errors.primaryBaseUrl} autoComplete="off" />
          <Field label="EU read base URL" value={draft.euReadBaseUrl} onChange={(e) => update('euReadBaseUrl', e.target.value)} error={errors.euReadBaseUrl} autoComplete="off" />
          <Field label="US read base URL" value={draft.usReadBaseUrl} onChange={(e) => update('usReadBaseUrl', e.target.value)} error={errors.usReadBaseUrl} autoComplete="off" />
          <Field label="API key" type="password" value={draft.apiKey} onChange={(e) => update('apiKey', e.target.value)} error={errors.apiKey} autoComplete="off" />
          <Field label="Internal key" type="password" value={draft.internalKey} onChange={(e) => update('internalKey', e.target.value)} error={errors.internalKey} autoComplete="off" />
          <Field label="Request timeout ms" type="number" min={1000} max={30000} value={draft.requestTimeoutMs} onChange={(e) => update('requestTimeoutMs', Number(e.target.value))} error={errors.requestTimeoutMs} />
          <div className="form-actions">
            <Button type="submit">Save for session</Button>
            <Button type="button" variant="secondary" loading={checkAction.loading} onClick={() => void checkConnections()}>Check connections</Button>
            <Button type="button" variant="ghost" onClick={restoreDefaults}>Reset defaults</Button>
          </div>
        </form>
      </section>
      <aside className="bank-card security-card">
        <h3>Security checklist</h3>
        <ul className="check-list">
          <li>No API keys in URLs or query strings.</li>
          <li>No use of dangerous HTML injection APIs.</li>
          <li>Runtime deploy config via immutable image + external <code>env.js</code>.</li>
          <li>Strict TypeScript and controlled form validation.</li>
          <li>Content Security Policy in the HTML entrypoint and nginx.</li>
          <li>Minimal dependency set to reduce package supply-chain risk.</li>
        </ul>
        {saved ? <Alert type="success" title="Settings updated">Connection settings were updated for this browser session.</Alert> : null}
        {checkAction.error ? <Alert type="error" title="Connection check failed">{checkAction.error}</Alert> : null}
        {checkAction.data ? (
          <Alert type="success" title="Connection check completed">
            Primary {checkAction.data.primary.status}, EU {checkAction.data.eu.status}, US {checkAction.data.us.status}.
          </Alert>
        ) : null}
      </aside>
    </div>
  );
};
