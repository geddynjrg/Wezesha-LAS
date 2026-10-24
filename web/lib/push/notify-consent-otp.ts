import { notifyAppUser } from '@/lib/push/app-push';

export type ConsentOtpAppResult = {
  delivered: boolean;
  devices: number;
};

/**
 * Always try the Uwezo Fund app when a member/guarantor confirmation OTP is sent.
 * SMS remains the primary channel; app inbox/FCM is a parallel copy of the same code.
 */
export async function notifyConsentOtpToApp(input: {
  phone?: string | null;
  email?: string | null;
  message: string;
  title?: string;
  meta?: Record<string, string>;
}): Promise<ConsentOtpAppResult> {
  if (process.env.APP_PUSH_ENABLED === 'false') {
    return { delivered: false, devices: 0 };
  }

  const phone = String(input.phone || '').trim();
  const email = String(input.email || '').trim() || undefined;
  if (!phone && !email) {
    return { delivered: false, devices: 0 };
  }

  try {
    const result = await notifyAppUser({
      title: input.title || 'Uwezo Fund confirmation code',
      body: input.message,
      kind: 'otp',
      phone: phone || undefined,
      email,
      meta: input.meta,
    });
    return {
      delivered: Boolean(result.delivered),
      devices: Number(result.devices || 0),
    };
  } catch (error) {
    console.warn('[OTP] consent app notify failed', error);
    return { delivered: false, devices: 0 };
  }
}

export function consentOtpDeliveryMessage(input: {
  name: string;
  phoneDisplay: string;
  smsOk: boolean;
  app: ConsentOtpAppResult;
}): string {
  const dest = `${input.name} at ${input.phoneDisplay}`;
  if (input.smsOk && input.app.delivered) {
    return `OTP sent by SMS and to the Uwezo Fund app for ${dest}.`;
  }
  if (input.smsOk) {
    return `OTP sent by SMS to ${dest}. If they stayed signed in on the Uwezo Fund app, they can also check Notifications.`;
  }
  if (input.app.delivered) {
    return `SMS could not be delivered. OTP was sent to the Uwezo Fund app for ${dest}. Ask them to open Notifications and share the 6-digit code.`;
  }
  return `Failed to send OTP SMS to ${dest}. Please verify the phone number and try again.`;
}
