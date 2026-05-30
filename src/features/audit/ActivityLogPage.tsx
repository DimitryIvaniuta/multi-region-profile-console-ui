import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import type { ActivityLogEntry } from '../../types/api';
import { clearActivities, listActivities } from '../../utils/activityLog';
import { formatDateTime } from '../../utils/date';

const outcomeClass = (outcome: ActivityLogEntry['outcome']): string => {
  if (outcome === 'SUCCESS') {
    return 'pill pill--good';
  }
  if (outcome === 'FAILED') {
    return 'pill pill--danger';
  }
  return 'pill pill--muted';
};

/**
 * Displays a browser-session operator activity trail. It is intentionally local and non-PII.
 */
export const ActivityLogPage = () => {
  const [entries, setEntries] = useState<readonly ActivityLogEntry[]>(() => listActivities());

  useEffect(() => {
    const refresh = () => setEntries(listActivities());
    window.addEventListener('mrps:activity', refresh);
    return () => window.removeEventListener('mrps:activity', refresh);
  }, []);

  const clear = () => {
    clearActivities();
    setEntries([]);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Session audit"
        title="Operator activity audit"
        description="Review safe local actions from this browser session. Entries mask profile identifiers and do not store payloads, PII or API keys."
      />
      <section className="bank-card">
        <div className="card-title-row">
          <div>
            <h3>Recent activity</h3>
            <p>Stored only in session storage. Clearing or closing the session removes this trail.</p>
          </div>
          <Button type="button" variant="ghost" onClick={clear}>Clear audit</Button>
        </div>
        <DataTable
          emptyText="No activity captured in this session."
          rows={entries}
          columns={[
            { key: 'time', header: 'Time', render: (row) => formatDateTime(row.occurredAt) },
            { key: 'action', header: 'Action', render: (row) => row.action },
            { key: 'outcome', header: 'Outcome', render: (row) => <span className={outcomeClass(row.outcome)}>{row.outcome}</span> },
            { key: 'region', header: 'Region', render: (row) => row.region },
            { key: 'profile', header: 'Profile ref', render: (row) => row.profileRef ?? '—' },
            { key: 'details', header: 'Details', render: (row) => row.details ?? '—' },
          ]}
        />
      </section>
    </div>
  );
};
