'use client';

import { useState, useTransition } from 'react';
import { Button } from '@workspace/ui/components/button';
import { PesaflowIframeCheckout } from '@/components/pesaflow-iframe-checkout';
import { initiatePesaflowInvoice } from '@/lib/payments/pesaflow.service';

type RecentPayment = {
  id: string;
  billRefNumber: string;
  amountExpected: number;
  amountPaid: number | null;
  status: string;
  pesaflowInvoiceNumber: string | null;
  createdAt: Date | string;
  completedAt: Date | string | null;
};

type PesaflowPayPanelProps = {
  memberId: string;
  amount: number;
  configured: boolean;
  eligible: boolean;
  reason: string | null;
  recent: RecentPayment[];
};

function formatKes(value: number) {
  return value.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PesaflowPayPanel({
  memberId,
  amount,
  configured,
  eligible,
  reason,
  recent,
}: PesaflowPayPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | undefined>();
  const [fields, setFields] = useState<Record<string, string> | undefined>();
  const [billRef, setBillRef] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await initiatePesaflowInvoice({ memberId, amount });
      if (!result.success) {
        setError(
          result.error ??
            (result.configured === false
              ? 'PesaFlow is not configured.'
              : 'Unable to generate invoice.'),
        );
        return;
      }

      setBillRef(result.billRefNumber ?? null);
      setInvoiceLink(result.invoiceLink ?? null);
      setCheckoutUrl(result.checkoutUrl);
      setFields(result.checkoutPayload);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="typo-h5">Repay with PesaFlow</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Generate a PesaFlow invoice and pay securely online. Payments are processed
          through PesaFlow (no automatic M-Pesa STK push unless enabled by Fund ops).
        </p>
      </div>

      {!eligible ? (
        <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
          {reason ?? 'Payment is not available for this application yet.'}
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-700">
            Invoice amount:{' '}
            <span className="font-semibold">KES {formatKes(amount)}</span>
          </p>

          {!configured ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              PesaFlow is not configured on this environment. The Fund must set
              PESAFLOW_* credentials before invoices can be generated.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={pending || !configured}
            >
              {pending ? 'Generating invoice…' : 'Pay with PesaFlow'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerate}
              disabled={pending || !configured}
            >
              Generate invoice
            </Button>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {billRef ? (
            <p className="text-xs text-neutral-500">Bill reference: {billRef}</p>
          ) : null}

          {invoiceLink || (checkoutUrl && fields) ? (
            <PesaflowIframeCheckout
              invoiceLink={invoiceLink}
              checkoutUrl={checkoutUrl}
              fields={fields}
            />
          ) : null}
        </>
      )}

      {recent.length > 0 ? (
        <div className="space-y-2 border-t border-neutral-100 pt-4">
          <h3 className="text-sm font-semibold text-neutral-800">Recent invoices</h3>
          <ul className="space-y-1 text-sm text-neutral-600">
            {recent.map((payment) => (
              <li key={payment.id}>
                {payment.billRefNumber} · KES{' '}
                {formatKes(payment.amountPaid ?? payment.amountExpected)} ·{' '}
                {payment.status}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
