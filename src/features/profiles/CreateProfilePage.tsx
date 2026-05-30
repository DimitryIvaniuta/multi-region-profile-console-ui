import { useState } from 'react';
import { createProfile } from '../../api/profileApi';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { PageHeader } from '../../components/PageHeader';
import { ProfileDetails } from '../../components/ProfileDetails';
import { ResultPanel } from '../../components/ResultPanel';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { AppSettings } from '../../types/api';
import { appendActivity } from '../../utils/activityLog';
import { hasErrors, trimToUndefined, validateCreateProfile, type FieldErrors } from '../../utils/validation';

type CreateProfilePageProps = {
  readonly settings: AppSettings;
};

export const CreateProfilePage = ({ settings }: CreateProfilePageProps) => {
  const [email, setEmail] = useState('alice@example.com');
  const [displayName, setDisplayName] = useState('Alice Example');
  const [phone, setPhone] = useState('+48100100200');
  const [errors, setErrors] = useState<FieldErrors<'email' | 'displayName' | 'phone'>>({});
  const action = useAsyncAction<Awaited<ReturnType<typeof createProfile>>>();

  const submit = async () => {
    const validation = validateCreateProfile({ email, displayName, phone });
    setErrors(validation);
    if (hasErrors(validation)) {
      return;
    }
    const trimmedPhone = trimToUndefined(phone);
    const created = await action.run(() => createProfile(settings.primaryBaseUrl, {
      email: email.trim(),
      displayName: displayName.trim(),
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    }, {
      credentials: { apiKey: settings.apiKey, internalKey: settings.internalKey },
      timeoutMs: settings.requestTimeoutMs,
    }));
    appendActivity({
      action: 'CREATE_PROFILE',
      region: 'primary',
      profileId: created?.profileId,
      outcome: created ? 'SUCCESS' : 'FAILED',
      details: created ? `Created version ${String(created.version)}.` : 'Profile create request failed.',
    });
  };

  return (
    <div className="page-stack two-column">
      <section>
        <PageHeader
          eyebrow="Primary write model"
          title="Create a user profile"
          description="Submit a strongly consistent write to the primary region. Kafka events then replicate the profile to regional read models."
        />
        <form className="bank-card form-card" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <Field label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="off" />
          <Field label="Display name" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} autoComplete="off" />
          <Field label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} hint="Optional. Use normalized external format." autoComplete="off" />
          <div className="form-actions">
            <Button type="submit" loading={action.loading}>Create profile</Button>
            <Button type="button" variant="ghost" onClick={action.reset}>Clear result</Button>
          </div>
        </form>
      </section>

      <ResultPanel title="Create result">
        {action.error ? <Alert type="error" title="Create failed">{action.error}</Alert> : null}
        {action.data ? <ProfileDetails profile={action.data} /> : <p className="empty-text">Created profile details will appear here.</p>}
      </ResultPanel>
    </div>
  );
};
