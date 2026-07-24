import {
  getMseaDisabledMessage,
  getMseaResumeDate,
  isMseaApiEnabled,
} from '@/lib/msea';
import { NextResponse } from 'next/server';

const MSEA_API_URL =
  process.env.MSEA_API_URL ?? 'https://msea.ecitizen.go.ke/api/businesses';
const MSEA_USERNAME = process.env.MSEA_USERNAME ?? 'wezesha';
const MSEA_PASSWORD = process.env.MSEA_PASSWORD ?? '';

export async function GET() {
  if (!isMseaApiEnabled()) {
    return NextResponse.json({
      reachable: false,
      disabled: true,
      resumeDate: getMseaResumeDate(),
      reason: getMseaDisabledMessage(),
    });
  }

  if (!MSEA_PASSWORD) {
    return NextResponse.json({
      reachable: false,
      reason: 'MSEA credentials are not configured.',
    });
  }

  try {
    const credentials = Buffer.from(`${MSEA_USERNAME}:${MSEA_PASSWORD}`).toString(
      'base64',
    );

    const url = new URL(MSEA_API_URL);
    url.searchParams.set('registration_number', '__healthcheck__');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const contentType = response.headers.get('content-type') ?? '';
    const returnsJson = contentType.includes('application/json');

    if (!returnsJson) {
      return NextResponse.json({
        reachable: false,
        status: response.status,
        reason:
          'MSEA API did not return JSON. The service may be down or credentials may be invalid.',
      });
    }

    if (response.status >= 500) {
      return NextResponse.json({
        reachable: false,
        status: response.status,
        reason: 'MSEA API server error.',
      });
    }

    return NextResponse.json({
      reachable: true,
      status: response.status,
    });
  } catch (error) {
    console.error('MSEA health check failed:', error);
    return NextResponse.json({
      reachable: false,
      reason: 'MSEA API is not responding.',
    });
  }
}
