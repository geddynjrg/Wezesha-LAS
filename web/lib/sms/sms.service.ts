const SMS_API_URL =
  process.env.SMS_API_URL ?? 'https://sms.ebisclouderp.com/api/sms/sendsms';
const SMS_API_KEY = process.env.SMS_API_KEY ?? '';
const SMS_SHORTCODE = process.env.SMS_SHORTCODE ?? 'Uwezo Fund';

export function formatKenyanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = `254${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    cleaned = `254${cleaned}`;
  }

  return cleaned;
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function buildGuarantorOtpMessage({
  guarantorName,
  applicantName,
  loanAmount,
  otpCode,
}: {
  guarantorName: string;
  applicantName: string;
  loanAmount: string;
  otpCode: string;
}): string {
  return `You will guarantee ${applicantName} for a Uwezo Fund Wezesha Majuu Loan worth KES ${loanAmount}. Your consent code is ${otpCode}. Share this code with ${applicantName} if you consent to guarantee them for the loan.`;
}

interface SendSmsResult {
  success: boolean;
  error?: string;
}

export async function sendSms(mobile: string, message: string): Promise<SendSmsResult> {
  if (!SMS_API_KEY) {
    console.warn('[SMS] SMS_API_KEY not configured — OTP logged for development only');
    console.info(`[SMS] To ${mobile}: ${message}`);
    return { success: true };
  }

  const requestBody = {
    api_key: SMS_API_KEY,
    service_id: 0,
    mobile: formatKenyanPhoneNumber(mobile),
    response_type: 'json',
    shortcode: SMS_SHORTCODE,
    message,
  };

  try {
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = (await response.json()) as Array<{
      status_code?: string;
      status_desc?: string;
    }>;

    const result = data[0];
    if (result?.status_code === '1000' || result?.status_code === '1') {
      return { success: true };
    }

    return {
      success: false,
      error: result?.status_desc ?? 'Failed to send SMS',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error sending SMS',
    };
  }
}

export const OTP_EXPIRY_MINUTES = 15;

export function isOtpExpired(sentAt: Date | null | undefined): boolean {
  if (!sentAt) return true;
  const expiryMs = OTP_EXPIRY_MINUTES * 60 * 1000;
  return Date.now() - sentAt.getTime() > expiryMs;
}
