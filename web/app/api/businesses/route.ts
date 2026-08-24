import {
  getMseaDisabledMessage,
  isMseaApiEnabled,
} from '@/lib/msea';
import { NextRequest, NextResponse } from 'next/server';

const MSEA_API_URL =
  process.env.MSEA_API_URL ?? 'https://msea.ecitizen.go.ke/api/businesses';
const MSEA_USERNAME = process.env.MSEA_USERNAME ?? 'wezesha';
const MSEA_PASSWORD = process.env.MSEA_PASSWORD ?? '';

function getAuthHeader(): string | null {
  if (!MSEA_PASSWORD) {
    return null;
  }

  const credentials = Buffer.from(`${MSEA_USERNAME}:${MSEA_PASSWORD}`).toString(
    'base64',
  );
  return `Basic ${credentials}`;
}

export async function GET(request: NextRequest) {
  if (!isMseaApiEnabled()) {
    return NextResponse.json(
      { error: getMseaDisabledMessage() },
      { status: 503 },
    );
  }

  const registrationNumber = request.nextUrl.searchParams.get(
    'registration_number',
  );

  if (!registrationNumber?.trim()) {
    return NextResponse.json(
      { error: 'registration_number query parameter is required' },
      { status: 400 },
    );
  }

  const authorization = getAuthHeader();
  if (!authorization) {
    return NextResponse.json(
      { error: 'MSEA API credentials are not configured.' },
      { status: 503 },
    );
  }

  try {
    const url = new URL(MSEA_API_URL);
    url.searchParams.set('registration_number', registrationNumber.trim());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        {
          error:
            'MSEA API returned an invalid response. The service may be temporarily unavailable.',
        },
        { status: 503 },
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('MSEA proxy error:', error);
    return NextResponse.json(
      { error: 'MSEA API is not responding. Please try again later.' },
      { status: 503 },
    );
  }
}
