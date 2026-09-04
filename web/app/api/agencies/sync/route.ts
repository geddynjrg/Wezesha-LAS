import { syncNeaimsAgencyCache } from '@/lib/neaims-agencies';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/agencies/sync — refresh NEAIMS licensed-agency disk cache.
 * Optional CRON_SECRET when set.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET || process.env.AGENCIES_SYNC_SECRET;
  if (secret) {
    const header = request.headers.get('authorization') || '';
    if (header !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await syncNeaimsAgencyCache();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
