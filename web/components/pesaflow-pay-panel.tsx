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
  /** Maximum payable amount = outstanding arrears. */
  amount: number;
  loaned?: number;
  repaid?: number;
  arrears?: number;
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
  loaned,
  repaid,
  arrears,
  configured,
  eligible,
  reason,
  recent,
}: PesaflowPayPanelProps) {
  const maxPayable = Math.max(0, arrears ?? amount);
  const loanedAmount = loaned ?? amount;
  const repaidAmount = repaid ?? Math.max(0, loanedAmount - maxPayable);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | undefined>();
  const [fields, setFields] = useState<Record<string, string> | undefined>();
  const [billRef, setBillRef] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(
    String(maxPayable > 0 ? Math.round(maxPayable) : ''),
  );

  const selectedAmount = () => {
    const value = Number(payAmount);
    if (!Number.isFinite(value) || value <= 0) return null;
    if (value > maxPayable + 0.001) return null;
    return Math.round(value * 100) / 100;
  };

  const clearCheckout = () => {
    setInvoiceLink(null);
    setCheckoutUrl(undefined);
    setFields(undefined);
    setBillRef(null);
  };

  const handleGenerate = () => {
    const invoiceAmount = selectedAmount();
    if (invoiceAmount == null) {
      setError(
        maxPayable <= 0
          ? 'No arrears outstanding on this loan.'
          : `Enter an amount from KES 1.00 up to your arrears of KES ${formatKes(maxPayable)}.`,
      );
      clearCheckout();
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await initiatePesaflowInvoice({ memberId, amount: invoiceAmount });
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

      <dl className="grid gap-2 rounded-lg bg-neutral-50 p-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-neutral-600">Amount loaned</dt>
          <dd className="font-medium">KES {formatKes(loanedAmount)}</dd>
        </div>
        <div>
          <dt className="text-neutral-600">Cumulative repayments</dt>
          <dd className="font-medium">KES {formatKes(repaidAmount)}</dd>
        </div>
        <div>
          <dt className="text-neutral-600">Arrears</dt>
          <dd className="font-medium text-amber-900">KES {formatKes(maxPayable)}</dd>
        </div>
      </dl>

      {!eligible ? (
        <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
          {reason ?? 'Payment is not available for this application yet.'}
        </p>
      ) : (
        <>
          <label className="block space-y-1 text-sm text-neutral-700">
            <span>Amount to repay (KES)</span>
            <input
              type="number"
              min={1}
              max={maxPayable}
              step={1}
              inputMode="decimal"
              value={payAmount}
              onChange={(event) => {
                setPayAmount(event.target.value);
                clearCheckout();
                setError(null);
              }}
              className="w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900"
            />
            <span className="block text-neutral-600">
              You can repay any amount up to your arrears: KES {formatKes(maxPayable)}.
            </span>
          </label>

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
              disabled={pending || !configured || maxPayable <= 0}
            >
              {pending ? 'Generating invoice…' : 'Pay with PesaFlow'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerate}
              disabled={pending || !configured || maxPayable <= 0}
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
