export function isLmsSyncRequest(request: Request): boolean {
  const expected =
    process.env.MAJUU_LMS_SYNC_TOKEN || process.env.EXTERNAL_API_KEY || '';
  if (!expected) return false;

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token === expected;
}
