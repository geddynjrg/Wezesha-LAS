'use server';

import {
  getPaymentTransactionByBillRef,
  markPaymentSmsSent,
  markPaymentTransactionCompleted,
  markPaymentTransactionFailed,
} from '@/lib/data/payment-transaction';
import { verifyPesaflowIpnTokenHash } from '@/lib/payments/pesaflow-hash';
import {
  extractStatusPaidAmount,
  isPesaflowStatusPaid,
  isPesaflowStatusUnderpaid,
  queryPesaflowPaymentStatus,
} from '@/lib/payments/pesaflow-status';
import { isPaymentAmountSufficient } from '@/lib/payments/pesaflow-utils';
import { getPesaflowConfig } from '@/lib/payments/pesaflow.config';
import type {
  PesaflowIpnPayload,
  ProcessPaymentResult,
} from '@/lib/payments/pesaflow.types';
import { sendSms } from '@/lib/sms/sms.service';
import { sendPlainEmail } from '@/lib/email/mail.service';
import { prisma } from '@/lib/prisma';

function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const amount = Number.parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function extractBillRef(payload: PesaflowIpnPayload): string {
  return (payload.client_invoice_ref || payload.billRefNumber || '').trim();
}

function extractPaymentReference(payload: PesaflowIpnPayload): string {
  const ref = payload.payment_reference;
  if (Array.isArray(ref) && ref.length > 0) {
    const first = ref[0] as { payment_reference?: string };
    return String(first?.payment_reference ?? '');
  }

  return String(ref ?? '');
}

function extractAmountPaid(payload: PesaflowIpnPayload): number | null {
  return (
    parseAmount(payload.amount_paid) ??
    parseAmount(payload.last_payment_amount) ??
    parseAmount(payload.invoice_amount)
  );
}

function isSuccessfulPaymentStatus(status: string | undefined): boolean {
  const normalized = (status ?? '').toLowerCase();
  return (
    normalized.includes('paid') ||
    normalized.includes('success') ||
    normalized.includes('complete') ||
    normalized.includes('settled') ||
    normalized === 'ok'
  );
}

function isFailedPaymentStatus(status: string | undefined): boolean {
  const normalized = (status ?? '').toLowerCase();
  return (
    normalized.includes('fail') ||
    normalized.includes('cancel') ||
    normalized.includes('declin') ||
    normalized.includes('reject')
  );
}

function shouldVerifyIpnTokenHash(): boolean {
  const flag = process.env.PESAFLOW_VERIFY_IPN_HASH?.trim().toLowerCase();
  return flag !== 'false';
}

async function notifyApplicantOfSuccessfulPayment(
  individualApplicationId: string,
  amount: number,
  billRefNumber: string,
  smsAlreadySent: boolean,
): Promise<void> {
  if (smsAlreadySent) {
    return;
  }

  const app = await prisma.individualApplication.findUnique({
    where: { id: individualApplicationId },
    include: { member: true },
  });

  if (!app) {
    return;
  }

  const amountLabel = amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const message = `Dear ${app.member.name}, Uwezo Fund received your Wezesha Majuu payment of KES ${amountLabel}. Ref: ${billRefNumber}.`;

  const smsResult = await sendSms(app.member.mobile, message);
  if (smsResult.success) {
    await markPaymentSmsSent(billRefNumber);
  } else {
    console.warn('[Pesaflow IPN] Applicant SMS failed');
  }

  if (app.member.email) {
    await sendPlainEmail({
      to: app.member.email,
      subject: 'Wezesha Majuu payment received',
      text: message,
    });
  }
}

async function confirmWithPesaflowStatus(
  billRefNumber: string,
  amountExpected: number,
): Promise<{ confirmed: boolean; amountPaid: number; error?: string }> {
  const status = await queryPesaflowPaymentStatus(billRefNumber);

  if (isPesaflowStatusUnderpaid(status)) {
    return {
      confirmed: false,
      amountPaid: 0,
      error: 'Payment amount is below the expected invoice amount',
    };
  }

  if (!isPesaflowStatusPaid(status)) {
    return {
      confirmed: false,
      amountPaid: 0,
      error: 'Payment not confirmed by Pesaflow status API',
    };
  }

  const amountPaid = extractStatusPaidAmount(status, amountExpected);

  if (!isPaymentAmountSufficient(amountPaid, amountExpected)) {
    return {
      confirmed: false,
      amountPaid,
      error: 'Paid amount is less than expected',
    };
  }

  return { confirmed: true, amountPaid };
}

export async function processPesaflowPaymentConfirmation(
  billRefNumber: string,
  amountPaid: number,
  ipnPayload: Record<string, unknown> = {},
): Promise<ProcessPaymentResult> {
  const result = await markPaymentTransactionCompleted({
    billRefNumber,
    amountPaid,
    pesaflowPaymentRef:
      extractPaymentReference(ipnPayload as PesaflowIpnPayload) ||
      String(ipnPayload.payment_reference ?? ''),
    pesaflowInvoiceNumber: String(ipnPayload.invoice_number ?? ''),
    paymentChannel: String(ipnPayload.payment_channel ?? ''),
    ipnPayload,
  });

  if (!result) {
    return {
      success: false,
      error: `Payment transaction not found for bill ref ${billRefNumber}`,
    };
  }

  const { transaction, alreadyProcessed } = result;

  if (!alreadyProcessed) {
    await notifyApplicantOfSuccessfulPayment(
      transaction.individualApplicationId,
      amountPaid,
      billRefNumber,
      Boolean(transaction.smsSentAt),
    );
  }

  return {
    success: true,
    alreadyProcessed,
    applicationId: transaction.individualApplicationId,
    amount: amountPaid,
    billRefNumber,
  };
}

export async function handlePesaflowIpn(
  rawPayload: Record<string, unknown>,
): Promise<ProcessPaymentResult> {
  const payload = rawPayload as PesaflowIpnPayload;
  const billRefNumber = extractBillRef(payload);

  if (!billRefNumber) {
    return {
      success: false,
      error: 'Missing client_invoice_ref / billRefNumber',
    };
  }

  const existing = await getPaymentTransactionByBillRef(billRefNumber);
  if (!existing) {
    return {
      success: false,
      error: `Unknown bill reference: ${billRefNumber}`,
    };
  }

  if (existing.status === 'COMPLETED') {
    return {
      success: true,
      alreadyProcessed: true,
      applicationId: existing.individualApplicationId,
      amount: existing.amountPaid ?? existing.amountExpected,
      billRefNumber,
    };
  }

  if (isFailedPaymentStatus(payload.status)) {
    await markPaymentTransactionFailed(billRefNumber, rawPayload);
    return {
      success: false,
      error: `Payment failed with status: ${payload.status ?? 'unknown'}`,
      billRefNumber,
      applicationId: existing.individualApplicationId,
    };
  }

  if (!isSuccessfulPaymentStatus(payload.status)) {
    console.warn('[Pesaflow IPN] Non-success status for bill ref');
    return {
      success: false,
      error: `Unconfirmed payment status: ${payload.status ?? 'unknown'}`,
      billRefNumber,
      applicationId: existing.individualApplicationId,
    };
  }

  const config = getPesaflowConfig();
  const tokenHash = String(payload.token_hash ?? '').trim();

  if (config && tokenHash && shouldVerifyIpnTokenHash()) {
    const tokenValid = verifyPesaflowIpnTokenHash(
      tokenHash,
      {
        apiClientId: config.apiClientId,
        clientInvoiceRef: billRefNumber,
        paymentReference: String(payload.payment_reference ?? ''),
        lastPaymentAmount: String(payload.last_payment_amount ?? ''),
        currency: String(payload.currency ?? 'KES'),
      },
      config.hmacKey,
      config.hmacSecret,
    );

    if (!tokenValid) {
      console.warn('[Pesaflow IPN] token_hash verification failed');
    }
  }

  const ipnAmount = extractAmountPaid(payload) ?? existing.amountExpected;

  if (!isPaymentAmountSufficient(ipnAmount, existing.amountExpected)) {
    await markPaymentTransactionFailed(billRefNumber, rawPayload);
    return {
      success: false,
      error: 'Paid amount is less than expected',
      billRefNumber,
      applicationId: existing.individualApplicationId,
    };
  }

  const statusConfirmation = await confirmWithPesaflowStatus(
    billRefNumber,
    existing.amountExpected,
  );

  if (statusConfirmation.confirmed) {
    return processPesaflowPaymentConfirmation(
      billRefNumber,
      statusConfirmation.amountPaid,
      rawPayload,
    );
  }

  console.warn(
    '[Pesaflow IPN] Status API fallback unavailable, confirming from IPN',
  );

  return processPesaflowPaymentConfirmation(billRefNumber, ipnAmount, {
    ...rawPayload,
    payment_reference: extractPaymentReference(payload),
  });
}

export async function confirmPaymentByBillRef(
  billRefNumber: string,
): Promise<ProcessPaymentResult> {
  const existing = await getPaymentTransactionByBillRef(billRefNumber);

  if (!existing) {
    return { success: false, error: 'Payment not found' };
  }

  if (existing.status === 'COMPLETED') {
    return {
      success: true,
      alreadyProcessed: true,
      applicationId: existing.individualApplicationId,
      amount: existing.amountPaid ?? existing.amountExpected,
      billRefNumber,
    };
  }

  const statusConfirmation = await confirmWithPesaflowStatus(
    billRefNumber,
    existing.amountExpected,
  );

  if (!statusConfirmation.confirmed) {
    return {
      success: false,
      error:
        statusConfirmation.error ?? 'Payment not confirmed by Pesaflow yet',
      billRefNumber,
      applicationId: existing.individualApplicationId,
    };
  }

  return processPesaflowPaymentConfirmation(
    billRefNumber,
    statusConfirmation.amountPaid,
    { confirmed_via: 'status_query' },
  );
}
