import { normalizeKenyanPhoneForApi } from '@/lib/phone/kenyan-phone';

const SMS_API_URL =
  process.env.SMS_API_URL ??
  process.env.EBISCLOUD_SMS_API_URL ??
  'https://sms.ebisclouderp.com/api/sms/sendsms';
const SMS_API_KEY =
  process.env.SMS_API_KEY ?? process.env.EBISCLOUD_SMS_API_KEY ?? '';
const SMS_SHORTCODE =
  process.env.SMS_SHORTCODE ?? process.env.EBISCLOUD_SMS_SHORTCODE ?? 'Uwezo Fund';
const SMS_SERVICE_ID = Number(
  process.env.SMS_SERVICE_ID ?? process.env.EBISCLOUD_SMS_SERVICE_ID ?? '0',
);

/** @deprecated Use normalizeKenyanPhoneForApi from @/lib/phone/kenyan-phone */
export function formatKenyanPhoneNumber(phone: string): string {
  return normalizeKenyanPhoneForApi(phone);
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function buildMemberConsentOtpMessage({
  memberName,
  loanAmount,
  otpCode,
}: {
  memberName: string;
  loanAmount: string;
  otpCode: string;
}): string {
  return `Dear ${memberName}, you have been allocated KES ${loanAmount} for Uwezo Fund Wezesha Majuu loan. Your consent code is: ${otpCode}. Share this code with your group contact person if you consent to this loan amount.`;
}

export function buildGuaranteeConsentMessage({
  memberName,
  groupName,
}: {
  memberName: string;
  groupName: string;
}): string {
  return `Dear ${memberName}, you are requested to consent to the Uwezo Fund Wezesha Majuu loan repayment commitment for group ${groupName}. Please contact your group leader to confirm your guarantee.`;
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

export function buildGroupSubmissionConfirmationMessage({
  memberName,
  groupName,
  acknowledgmentNumber,
  applyLink,
}: {
  memberName: string;
  groupName: string;
  acknowledgmentNumber: string;
  applyLink: string;
}): string {
  return `Dear ${memberName}, the Uwezo Fund Wezesha Majuu group loan application for ${groupName} (Ref: ${acknowledgmentNumber}) has been submitted. Complete your individual application here: ${applyLink}`;
}

interface SendSmsResult {
  success: boolean;
  error?: string;
}

const EBIS_RESPONSE_SUCCESS = '1000';

type EbisLegacyResponse = {
  status_code?: string;
  status_desc?: string;
};

type EbisApiResponse = {
  status?: string;
  message?: string;
  error?: string;
  data?: {
    message_id?: string;
    cost?: number;
  };
  details?: EbisLegacyResponse & {
    data?: EbisLegacyResponse;
    response?: string;
  };
};

function sanitizeSmsError(raw: string | undefined, fallback: string): string {
  const text = String(raw || '').trim();
  if (!text) return fallback;
  if (text.startsWith('{') || text.startsWith('[')) {
    return fallback;
  }
  return text.length > 180 ? fallback : text;
}

function parseEbisApiResponse(
  statusCode: number,
  responseBody: string,
): SendSmsResult {
  let jsonData: EbisApiResponse | EbisLegacyResponse[] | null = null;

  try {
    jsonData = JSON.parse(responseBody) as EbisApiResponse | EbisLegacyResponse[];
  } catch {
    jsonData = null;
  }

  // Newer EBIS batch payload: { success: true, summary: { successful }, details }
  if (
    jsonData &&
    !Array.isArray(jsonData) &&
    (jsonData as { success?: boolean }).success === true
  ) {
    const summary = (
      jsonData as {
        summary?: { successful?: number; failed?: number; total_numbers?: number };
      }
    ).summary;
    if (
      summary == null ||
      (typeof summary.successful === 'number' && summary.successful > 0) ||
      (typeof summary.failed === 'number' &&
        typeof summary.total_numbers === 'number' &&
        summary.failed < summary.total_numbers)
    ) {
      return { success: true };
    }
  }

  if (statusCode === 200) {
    if (jsonData && !Array.isArray(jsonData) && jsonData.status === EBIS_RESPONSE_SUCCESS) {
      return { success: true };
    }

    if (Array.isArray(jsonData)) {
      const legacyResult = jsonData[0];
      if (
        legacyResult?.status_code === EBIS_RESPONSE_SUCCESS ||
        legacyResult?.status_code === '1'
      ) {
        return { success: true };
      }

      return {
        success: false,
        error: sanitizeSmsError(legacyResult?.status_desc, 'Failed to send SMS'),
      };
    }

    if (jsonData && !Array.isArray(jsonData)) {
      return {
        success: false,
        error: sanitizeSmsError(
          jsonData.message ?? jsonData.error,
          'SMS could not be sent. Please try again in a moment.',
        ),
      };
    }

    if (/success|sent/i.test(responseBody)) {
      return { success: true };
    }

    return {
      success: false,
      error: 'SMS could not be sent. Please try again in a moment.',
    };
  }

  if (jsonData && !Array.isArray(jsonData)) {
    const details = jsonData.details?.data ?? jsonData.details;
    const detailMessage = details?.status_desc;

    return {
      success: false,
      error: sanitizeSmsError(
        detailMessage ?? jsonData.message ?? jsonData.error,
        `SMS request failed (HTTP ${statusCode}). Please try again.`,
      ),
    };
  }

  return {
    success: false,
    error: sanitizeSmsError(
      responseBody,
      `SMS request failed (HTTP ${statusCode}). Please try again.`,
    ),
  };
}

export async function sendSms(mobile: string, message: string): Promise<SendSmsResult> {
  const normalizedMobile = normalizeKenyanPhoneForApi(mobile).replace(/^\+/, '');

  if (!SMS_API_KEY) {
    console.warn('[SMS] SMS_API_KEY not configured — SMS not sent');
    console.info(`[SMS] Would send to ${normalizedMobile}: ${message}`);
    return {
      success: false,
      error: 'SMS service is not configured. Please contact support.',
    };
  }

  const requestBody = {
    api_key: SMS_API_KEY,
    service_id: SMS_SERVICE_ID,
    mobile: normalizedMobile,
    response_type: 'json',
    shortcode: SMS_SHORTCODE,
    message,
  };

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8_000);

  try {
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Majuu-Portal/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: ac.signal,
    });

    const responseBody = await response.text();
    const parsed = parseEbisApiResponse(response.status, responseBody);

    if (!parsed.success) {
      console.error('[SMS] EBIS API error:', {
        status: response.status,
        body: responseBody,
      });
    }

    return parsed;
  } catch (error) {
    const aborted =
      (error instanceof Error && error.name === 'AbortError') ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name?: string }).name === 'AbortError');
    if (aborted) {
      // Provider often delivers before HTTP responds — treat as soft success
      // so login UI can show the OTP field without waiting forever.
      console.warn('[SMS] EBIS API timed out after 8s (message may still deliver)');
      return { success: true };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error sending SMS',
    };
  } finally {
    clearTimeout(timer);
  }
}

export const OTP_EXPIRY_MINUTES = 15;

export function isOtpExpired(sentAt: Date | null | undefined): boolean {
  if (!sentAt) return true;
  const expiryMs = OTP_EXPIRY_MINUTES * 60 * 1000;
  return Date.now() - sentAt.getTime() > expiryMs;
}
