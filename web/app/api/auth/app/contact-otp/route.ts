import { optionsCors, withCors } from '@/lib/auth/cors-app';
import {
  confirmContactCodes,
  OtpDeliveryError,
  requestContactConfirmation,
} from '@/lib/auth/otp';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }),
    );
  }

  const action = String(body.action || '').toLowerCase();

  try {
    if (action === 'request') {
      const result = await requestContactConfirmation(
        String(body.email || ''),
        String(body.phone || ''),
      );
      return withCors(request, NextResponse.json({ ok: true, ...result }));
    }

    if (action === 'confirm') {
      await confirmContactCodes({
        emailRequestId: String(body.emailRequestId || ''),
        emailCode: String(body.emailCode || ''),
        phoneRequestId: String(body.phoneRequestId || ''),
        phoneCode: String(body.phoneCode || ''),
      });
      return withCors(
        request,
        NextResponse.json({
          ok: true,
          message: 'Email and phone number confirmed.',
        }),
      );
    }

    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Unknown action.' }, { status: 400 }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Confirmation failed';
    return withCors(request, NextResponse.json({ ok: false, error: message }, { status: 400 }));
  }
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
