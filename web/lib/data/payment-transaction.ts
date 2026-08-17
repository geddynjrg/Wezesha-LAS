'use server';

import { prisma } from '@/lib/prisma';
import { PaymentStatus, Prisma } from '@/generated/prisma';
import type { PesaflowCheckoutPayload } from '@/lib/payments/pesaflow.types';

export async function updatePaymentTransactionInvoice(
  id: string,
  input: {
    invoiceNumber: string;
    invoiceLink: string;
    checkoutPayload: PesaflowCheckoutPayload;
  },
) {
  return prisma.paymentTransaction.update({
    where: { id },
    data: {
      pesaflowInvoiceNumber: input.invoiceNumber,
      checkoutPayload: {
        ...input.checkoutPayload,
        _invoiceLink: input.invoiceLink,
      } as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function createPaymentTransaction(input: {
  individualApplicationId: string;
  memberId: string;
  billRefNumber: string;
  amountExpected: number;
  clientName: string;
  clientMSISDN: string;
  clientIDNumber: string;
  clientEmail: string;
  checkoutPayload: PesaflowCheckoutPayload;
}) {
  return prisma.paymentTransaction.create({
    data: {
      individualApplicationId: input.individualApplicationId,
      memberId: input.memberId,
      billRefNumber: input.billRefNumber,
      amountExpected: input.amountExpected,
      currency: 'KES',
      status: PaymentStatus.PENDING,
      clientName: input.clientName,
      clientMSISDN: input.clientMSISDN,
      clientIDNumber: input.clientIDNumber,
      clientEmail: input.clientEmail,
      checkoutPayload: input.checkoutPayload as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function getPaymentTransactionById(id: string) {
  return prisma.paymentTransaction.findUnique({ where: { id } });
}

export async function getPaymentTransactionByBillRef(billRefNumber: string) {
  return prisma.paymentTransaction.findUnique({ where: { billRefNumber } });
}

export async function markPaymentTransactionCompleted(input: {
  billRefNumber: string;
  amountPaid: number;
  pesaflowPaymentRef?: string;
  pesaflowInvoiceNumber?: string;
  paymentChannel?: string;
  ipnPayload?: Record<string, unknown>;
}) {
  const existing = await getPaymentTransactionByBillRef(input.billRefNumber);

  if (!existing) {
    return null;
  }

  if (existing.status === PaymentStatus.COMPLETED) {
    return { transaction: existing, alreadyProcessed: true };
  }

  const transaction = await prisma.paymentTransaction.update({
    where: { billRefNumber: input.billRefNumber },
    data: {
      status: PaymentStatus.COMPLETED,
      amountPaid: input.amountPaid,
      pesaflowPaymentRef: input.pesaflowPaymentRef,
      pesaflowInvoiceNumber: input.pesaflowInvoiceNumber,
      paymentChannel: input.paymentChannel,
      ipnPayload: input.ipnPayload as Prisma.InputJsonValue | undefined,
      completedAt: new Date(),
    },
  });

  return { transaction, alreadyProcessed: false };
}

export async function markPaymentSmsSent(billRefNumber: string) {
  return prisma.paymentTransaction.update({
    where: { billRefNumber },
    data: { smsSentAt: new Date() },
  });
}

export async function markPaymentTransactionFailed(
  billRefNumber: string,
  ipnPayload?: Record<string, unknown>,
) {
  return prisma.paymentTransaction.update({
    where: { billRefNumber },
    data: {
      status: PaymentStatus.FAILED,
      ipnPayload: ipnPayload as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getActivePendingPayment(individualApplicationId: string) {
  return prisma.paymentTransaction.findFirst({
    where: {
      individualApplicationId,
      status: PaymentStatus.PENDING,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function cancelStalePendingPayments(individualApplicationId: string) {
  const staleBefore = new Date(Date.now() - 2 * 60 * 60 * 1000);

  await prisma.paymentTransaction.updateMany({
    where: {
      individualApplicationId,
      status: PaymentStatus.PENDING,
      createdAt: { lt: staleBefore },
    },
    data: { status: PaymentStatus.CANCELLED },
  });
}

export async function listRecentPaymentsForApplication(
  individualApplicationId: string,
  take = 5,
) {
  return prisma.paymentTransaction.findMany({
    where: { individualApplicationId },
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      billRefNumber: true,
      amountExpected: true,
      amountPaid: true,
      status: true,
      pesaflowInvoiceNumber: true,
      createdAt: true,
      completedAt: true,
    },
  });
}
