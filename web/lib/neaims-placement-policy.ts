/**
 * Until this instant (Africa/Nairobi), applicants may continue without a NEAIMS
 * job placement. After it ends, placement checks are enforced again.
 * Override with NEAIMS_PLACEMENT_REQUIRED_AFTER (ISO-8601).
 */
export const NEAIMS_PLACEMENT_GRACE_UNTIL =
  (typeof process !== 'undefined' &&
    process.env.NEAIMS_PLACEMENT_REQUIRED_AFTER?.trim()) ||
  '2026-10-20T23:59:59+03:00';

export function isNeaimsPlacementRequired(now = new Date()): boolean {
  const until = Date.parse(NEAIMS_PLACEMENT_GRACE_UNTIL);
  if (Number.isNaN(until)) return true;
  return now.getTime() > until;
}
