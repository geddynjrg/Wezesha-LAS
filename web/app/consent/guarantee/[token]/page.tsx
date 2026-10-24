import { GuaranteeConsentClient } from './guarantee-consent-client';
import { loadGuaranteeConsent } from './actions';

export default async function GuaranteeConsentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token: rawToken } = await params;
  const token = decodeURIComponent(rawToken);
  const view = await loadGuaranteeConsent(token);

  if (!view.ok || !view.groupName || !view.memberName || !view.status) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="typo-h4">Consent link unavailable</h1>
        <p className="mt-3 typo-body-medium text-neutral-600">
          {view.message || 'This link is invalid or has expired.'}
        </p>
      </div>
    );
  }

  return (
    <GuaranteeConsentClient
      token={token}
      groupName={view.groupName}
      memberName={view.memberName}
      initialStatus={view.status}
    />
  );
}
