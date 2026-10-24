import { sendPlainEmail } from '@/lib/email/mail.service';
import { notifyAppUser } from '@/lib/push/app-push';
import { sendSms } from '@/lib/sms/sms.service';

export type ApplicationStatusRecipient = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type NotifyApplicationStatusResult = {
  sms: boolean;
  email: boolean;
  app: boolean;
};

function normalizeEmail(raw?: string | null): string | undefined {
  const email = String(raw || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return undefined;
  return email;
}

export async function notifyApplicationStatusChannels(input: {
  recipient: ApplicationStatusRecipient;
  title: string;
  message: string;
  emailSubject?: string;
}): Promise<NotifyApplicationStatusResult> {
  const phone = String(input.recipient.phone || '').trim();
  const email = normalizeEmail(input.recipient.email);
  const result: NotifyApplicationStatusResult = {
    sms: false,
    email: false,
    app: false,
  };

  if (phone) {
    try {
      const sms = await sendSms(phone, input.message);
      result.sms = Boolean(sms.success);
      if (!sms.success) {
        console.warn('[status-notify] SMS failed', sms.error);
      }
    } catch (error) {
      console.warn('[status-notify] SMS error', error);
    }
  }

  if (email) {
    try {
      const mail = await sendPlainEmail({
        to: email,
        subject: input.emailSubject || input.title,
        text: input.message,
      });
      result.email = Boolean(mail.success);
    } catch (error) {
      console.warn('[status-notify] email error', error);
    }
  }

  if (process.env.APP_PUSH_ENABLED !== 'false' && (phone || email)) {
    try {
      const app = await notifyAppUser({
        title: input.title,
        body: input.message,
        kind: 'loan_status',
        phone: phone || undefined,
        email,
      });
      result.app = Boolean(app.delivered);
    } catch (error) {
      console.warn('[status-notify] app notify failed', error);
    }
  }

  return result;
}

export async function notifyManyApplicationStatus(
  recipients: ApplicationStatusRecipient[],
  payload: {
    title: string;
    messageFor: (name: string) => string;
    emailSubject?: string;
  },
): Promise<void> {
  for (const recipient of recipients) {
    const name = String(recipient.name || 'member').trim() || 'member';
    await notifyApplicationStatusChannels({
      recipient,
      title: payload.title,
      emailSubject: payload.emailSubject,
      message: payload.messageFor(name),
    });
  }
}
