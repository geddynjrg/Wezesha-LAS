import { fetchJobseekerGet } from '@/lib/neaims-jobseeker';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/neaims/jobseeker?nationalId=12345678
 * POST /api/neaims/jobseeker { "nationalId": "12345678" }
 * Proxies Drupal NEAIMS Jobseeker Get on loans-admin.
 */
async function handle(nationalId: string) {
  const result = await fetchJobseekerGet(nationalId);
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
