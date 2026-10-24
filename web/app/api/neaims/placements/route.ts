import { fetchJobseekerPlacements } from '@/lib/neaims-placements';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/neaims/placements?nationalId=12345678
 * POST /api/neaims/placements { "nationalId": "12345678" }
 * Proxies Drupal NEAIMS Jobseeker Placements on loans-admin.
 */
async function handle(nationalId: string) {
  const result = await fetchJobseekerPlacements(nationalId);
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return handle(String(searchParams.get('nationalId') || ''));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    nationalId?: string;
  };
  return handle(String(body.nationalId || ''));
}
