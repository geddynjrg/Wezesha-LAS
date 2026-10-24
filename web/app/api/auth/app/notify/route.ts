import { optionsCors, withCors } from '@/lib/auth/cors-app';
import { notifyAppUser, pushEnvDocs } from '@/lib/push/app-push';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Internal/webhook notify for OTP + loan status (EBIS SMS companion).
 * Auth: Bearer APP_PUSH_WEBHOOK_SECRET, MAJUU_LMS_SYNC_TOKEN, or X-App-Push-Secret.
 */
export async function POST(request: Request) {
  const secrets = [
    process.env.APP_PUSH_WEBHOOK_SECRET,
    process.env.MAJUU_LMS_SYNC_TOKEN,
    process.env.EXTERNAL_API_KEY,
  ].filter((value): value is string => Boolean(value && value.trim()));
  const auth = request.headers.get('authorization') || '';
  const headerSecret = request.headers.get('x-app-push-secret') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const provided = bearer || headerSecret;
  if (secrets.length === 0 || !provided || !secrets.includes(provided)) {
    return withCors(
      request,
      NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized. Set APP_PUSH_WEBHOOK_SECRET and pass it as Bearer token.',
          env: pushEnvDocs(),
        },
        { status: 401 },
      ),
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return withCors(
      request,
      NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }),
    );
  }

  const kindRaw = String(body.kind || 'system');
  const kind =
    kindRaw === 'otp' || kindRaw === 'loan_status' ? kindRaw : 'system';

  const result = await notifyAppUser({
    title: String(body.title || 'Uwezo Fund'),
    body: String(body.body || body.message || ''),
    kind,
    phone: body.phone ? String(body.phone) : undefined,
    email: body.email ? String(body.email) : undefined,
    userId: body.userId ? String(body.userId) : undefined,
    skipFanout: request.headers.get('x-uwezo-app-push-fanout') === '1',
  });

  return withCors(
    request,
    NextResponse.json({
      ok: true,
      delivered: result.delivered,
      inboxKeys: result.inboxKeys,
      devices: result.devices,
      fcmSent: result.fcmSent,
      fcm: result.fcm,
      fcmConfigured: result.fcmConfigured,
    }),
  );
}

export async function OPTIONS(request: Request) {
  return optionsCors(request);
}
