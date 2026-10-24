import { listAllLicensedAgencies } from '@/lib/neaims-agencies';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/agencies/list
 * Returns all licensed agencies (paginated upstream until exhausted).
 * Optional ?q= filters client-side after full fetch.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get('q') || '').trim().toLowerCase();

  try {
    const { results, source } = await listAllLicensedAgencies();
    const filtered = q
      ? results.filter(
          (r) =>
            r.agencyName.toLowerCase().includes(q) ||
            r.neaRegNo.toLowerCase().includes(q) ||
            (r.companyRegNo || '').toLowerCase().includes(q),
        )
      : results;

    return NextResponse.json({
      results: filtered.map((r) => ({
        neaRegNo: r.neaRegNo,
        agencyName: r.agencyName,
        status: r.status,
        source: r.source,
        companyRegNo: r.companyRegNo,
        expiryDate: r.expiryDate,
      })),
      count: filtered.length,
      source,
    });
  } catch (e) {
    return NextResponse.json(
      {
        results: [],
        count: 0,
        source: 'error',
        error: e instanceof Error ? e.message : 'list failed',
      },
      { status: 502 },
    );
  }
}
