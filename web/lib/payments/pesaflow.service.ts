'use server';

import { getSessionUserId } from '@/lib/auth/session';
import {
  cancelStalePendingPayments,
  createPaymentTransaction,
  getActivePendingPayment,
  listRecentPaymentsForApplication,
  updatePaymentTransactionInvoice,
} from '@/lib/data/payment-transaction';
import { getIndividualApplication } from '@/lib/data/applications';
import {
  isLoanAmountApproved,
  isIndividualApplicationSubmitted,
} from '@/lib/individual-application-access';
import {
  buildPesaflowCheckoutPayload,
  generateBillRefNumber,
  getPesaflowCheckoutUrl,
} from '@/lib/payments/pesaflow-checkout';
import { isPesaflowConfiguredFromEnv } from '@/lib/payments/pesaflow.config';
import {
  confirmPaymentByBillRef,
  handlePesaflowIpn,
} from '@/lib/payments/pesaflow-ipn';
import {
  extractStoredInvoiceLink,
  requestPesaflowInvoice,
} from '@/lib/payments/pesaflow-invoice';
import { prisma } from '@/lib/prisma';
import type { PesaflowPaymentResult } from '@/lib/payments/pesaflow.types';

export async function isPesaflowConfigured(): Promise<boolean> {
  return isPesaflowConfiguredFromEnv();
}

export { handlePesaflowIpn, confirmPaymentByBillRef };

function moneyNumber(value: { toString(): string } | null | undefined): number {
  if (value == null) return 0;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

async function assertMemberAccess(memberId: string) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }

  const app = await getIndividualApplication(memberId);
  if (!app) {
    throw new Error('Application not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { idNumber: true, phoneNumber: true, email: true, name: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const idMatch =
    user.idNumber &&
    app.member.idNo.replace(/\D/g, '') === user.idNumber.replace(/\D/g, '');
  const phoneDigits = (user.phoneNumber ?? '').replace(/\D/g, '').slice(-9);
  const memberPhoneDigits = app.member.mobile.replace(/\D/g, '').slice(-9);
  const phoneMatch = phoneDigits && phoneDigits === memberPhoneDigits;

  if (!idMatch && !phoneMatch) {
    throw new Error('Access denied for this application');
  }

  return { app, user };
}

export async function getPesaflowPayContext(memberId: string) {
  const { app } = await assertMemberAccess(memberId);
  const configured = isPesaflowConfiguredFromEnv();
  const amount = moneyNumber(app.awardAmount ?? app.member.amount);
  const eligible =
    isIndividualApplicationSubmitted(app) &&
    isLoanAmountApproved(app) &&
    amount > 0;

  const recent = eligible
    ? await listRecentPaymentsForApplication(app.id)
    : [];

  return {
    configured,
    eligible,
    amount,
    acknowledgmentNumber: app.acknowledgmentNumber,
    recent,
    reason: !isIndividualApplicationSubmitted(app)
      ? 'Submit your application first.'
      : !isLoanAmountApproved(app)
        ? 'Available after your loan amount has been approved.'
        : amount <= 0
          ? 'No award amount is set for invoicing yet.'
          : null,
  };
}

export async function initiatePesaflowInvoice(input: {
  memberId: string;
  amount?: number;
}): Promise<PesaflowPaymentResult> {
  if (!isPesaflowConfiguredFromEnv()) {
    return {
      success: false,
      configured: false,
      error:
        'PesaFlow is not configured for Wezesha Majuu. Set PESAFLOW_* environment variables (shared Uwezo merchant or Treasury-issued Majuu credentials).',
    };
  }

  const checkoutUrl = getPesaflowCheckoutUrl();
  if (!checkoutUrl) {
    return {
      success: false,
      configured: true,
      error: 'PesaFlow checkout URL is not configured.',
    };
  }

  try {
    const { app, user } = await assertMemberAccess(input.memberId);

    if (!isIndividualApplicationSubmitted(app) || !isLoanAmountApproved(app)) {
      return {
        success: false,
        configured: true,
        error: 'Loan amount must be approved before generating an invoice.',
      };
    }

    const defaultAmount = moneyNumber(app.awardAmount ?? app.member.amount);
    const amount = input.amount && input.amount > 0 ? input.amount : defaultAmount;

    if (!amount || amount <= 0) {
      return {
        success: false,
        configured: true,
        error: 'A positive invoice amount is required.',
      };
    }

    await cancelStalePendingPayments(app.id);

    const pending = await getActivePendingPayment(app.id);
    if (pending) {
      const invoiceLink = extractStoredInvoiceLink(pending.checkoutPayload);
      if (invoiceLink) {
        return {
          success: true,
          configured: true,
          paymentId: pending.id,
          billRefNumber: pending.billRefNumber,
          invoiceNumber: pending.pesaflowInvoiceNumber ?? undefined,
          invoiceLink,
          checkoutUrl,
          checkoutPayload: pending.checkoutPayload as Record<string, string>,
        };
      }
    }

    const clientName = app.member.name || user.name || 'Wezesha Majuu Applicant';
    const clientMSISDN = app.member.mobile || user.phoneNumber || '';
    const clientIDNumber = app.member.idNo || user.idNumber || '00000000';
    const clientEmail =
      app.member.email || user.email || 'noreply@uwezo.go.ke';

    if (!clientMSISDN) {
      return {
        success: false,
        configured: true,
        error: 'A phone number is required to generate a PesaFlow invoice.',
      };
    }

    const billRefNumber = generateBillRefNumber(app.id);
    const checkoutPayload = buildPesaflowCheckoutPayload({
      applicationId: app.id,
      memberId: input.memberId,
      amount,
      billRefNumber,
      clientName,
      clientMSISDN,
      clientIDNumber,
      clientEmail,
    });

    if (!checkoutPayload) {
      return {
        success: false,
        configured: true,
        error: 'Failed to build PesaFlow checkout payload.',
      };
    }

    const transaction = await createPaymentTransaction({
      individualApplicationId: app.id,
      memberId: input.memberId,
      billRefNumber,
      amountExpected: amount,
      clientName,
      clientMSISDN,
      clientIDNumber,
      clientEmail,
      checkoutPayload,
    });

    const invoice = await requestPesaflowInvoice(checkoutUrl, checkoutPayload);

    await updatePaymentTransactionInvoice(transaction.id, {
      invoiceNumber: invoice.invoice_number,
      invoiceLink: invoice.invoice_link,
      checkoutPayload,
    });

    return {
      success: true,
      configured: true,
      paymentId: transaction.id,
      billRefNumber,
      invoiceNumber: invoice.invoice_number,
      invoiceLink: invoice.invoice_link,
      checkoutUrl,
      checkoutPayload: checkoutPayload as unknown as Record<string, string>,
    };
  } catch (error) {
    console.error(
      '[Pesaflow] initiate invoice failed:',
      error instanceof Error ? error.message : 'unknown',
    );
    return {
      success: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Failed to initiate payment',
    };
  }
}
