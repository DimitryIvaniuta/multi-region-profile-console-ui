import type { ProfileResponse, ProfileViewResponse } from '../types/api';
import { formatDateTime, formatSeconds } from '../utils/date';

type ProfileDetailsProps = {
  readonly profile: ProfileResponse | ProfileViewResponse;
};

const isView = (profile: ProfileResponse | ProfileViewResponse): profile is ProfileViewResponse =>
  'replicatedAt' in profile;

export const ProfileDetails = ({ profile }: ProfileDetailsProps) => (
  <dl className="details-grid">
    <div><dt>Profile ID</dt><dd>{profile.profileId}</dd></div>
    <div><dt>Email</dt><dd>{profile.email}</dd></div>
    <div><dt>Display name</dt><dd>{profile.displayName}</dd></div>
    <div><dt>Phone</dt><dd>{profile.phone ?? '—'}</dd></div>
    <div><dt>Status</dt><dd><span className={`pill ${profile.status === 'ACTIVE' ? 'pill--good' : 'pill--muted'}`}>{profile.status}</span></dd></div>
    <div><dt>Version</dt><dd>{profile.version}</dd></div>
    {'createdAt' in profile ? <div><dt>Created</dt><dd>{formatDateTime(profile.createdAt)}</dd></div> : null}
    {'updatedAt' in profile ? <div><dt>Updated</dt><dd>{formatDateTime(profile.updatedAt)}</dd></div> : null}
    {isView(profile) ? (
      <>
        <div><dt>Source region</dt><dd>{profile.sourceRegion}</dd></div>
        <div><dt>Event ID</dt><dd>{profile.eventId}</dd></div>
        <div><dt>Event time</dt><dd>{formatDateTime(profile.eventTime)}</dd></div>
        <div><dt>Replicated at</dt><dd>{formatDateTime(profile.replicatedAt)}</dd></div>
        <div><dt>Lag</dt><dd>{formatSeconds(profile.replicationLagSeconds)}</dd></div>
        <div><dt>SLA</dt><dd><span className={`pill ${profile.withinSla ? 'pill--good' : 'pill--danger'}`}>{profile.withinSla ? 'Within SLA' : 'Behind SLA'}</span></dd></div>
      </>
    ) : null}
  </dl>
);
