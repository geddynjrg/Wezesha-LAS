/**
 * Trigger a sync of a portal application into the Wezesha Majuu LMS.
 * Fire-and-forget — failures are logged but do not block the applicant flow.
 */
export async function triggerLmsSync(
  referenceNumber: string,
  options: { completeOnly?: boolean } = {},
): Promise<void> {
  const baseUrl = process.env.MAJUU_LMS_SYNC_URL?.replace(/\/$/, '');
  const token = process.env.MAJUU_LMS_SYNC_TOKEN;

  if (!baseUrl || !token) {
    console.warn('[LMS Sync] Skipped — MAJUU_LMS_SYNC_URL or MAJUU_LMS_SYNC_TOKEN not configured');
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/api/portal/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference: referenceNumber,
        complete_only: options.completeOnly ?? false,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[LMS Sync] Failed for ${referenceNumber}: HTTP ${response.status} ${body}`);
      return;
    }

    const result = await response.json().catch(() => ({}));
    console.info(`[LMS Sync] ${referenceNumber}:`, result);
  } catch (error) {
    console.error(`[LMS Sync] Failed for ${referenceNumber}:`, error);
  }
}
