import { searchAgenciesUnified } from '@/lib/neaims-agencies';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/agencies/search?q=...
 * Name or registration number search via NEAIMS (+ cache/CSV fallback).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get('q') || '').trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [], source: 'empty' });
  }

  try {
    const { results, source } = await searchAgenciesUnified(q);
    return NextResponse.json({
      results: results.map((r) => ({
        neaRegNo: r.neaRegNo,
        agencyName: r.agencyName,
        status: r.status,
        source: r.source,
        companyRegNo: r.companyRegNo,
        expiryDate: r.expiryDate,
      })),
      source,
    });
  } catch (e) {
    return NextResponse.json(
      {
        results: [],
        source: 'error',
        error: e instanceof Error ? e.message : 'search failed',
      },
      { status: 502 },
    );
  }
}
