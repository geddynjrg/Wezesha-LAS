import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'UP', service: 'majuu-applicant-portal' });
  } catch {
    return NextResponse.json(
      { status: 'DOWN', service: 'majuu-applicant-portal' },
      { status: 503 },
    );
  }
}
