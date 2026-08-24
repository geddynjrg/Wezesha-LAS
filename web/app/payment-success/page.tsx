import {
  confirmPaymentByBillRef,
} from '@/lib/payments/pesaflow.service';
import { Container } from '@workspace/ui/components/container';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/uwezo/card';
import Link from 'next/link';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const billRefNumber = first(params.billRefNumber);
  const memberId = first(params.memberId);
  const amount = first(params.amount);

  let confirmed = false;
  let message =
    'If you completed payment on PesaFlow, confirmation may take a moment.';

  if (billRefNumber) {
    const result = await confirmPaymentByBillRef(billRefNumber);
    confirmed = Boolean(result.success);
    message = confirmed
      ? 'Thank you. Your Wezesha Majuu payment has been received and confirmed.'
      : result.error ?? message;
  }

  return (
    <Container className="max-w-xl space-y-6 py-10">
      <Card radius="lg" variant="primary" className="space-y-4 p-6">
        <h1 className="typo-h4">
          {confirmed ? 'Payment successful' : 'Payment status'}
        </h1>
        <p className="text-neutral-700">{message}</p>
        {amount ? (
          <p className="text-sm text-neutral-600">Amount: KES {amount}</p>
        ) : null}
        {billRefNumber ? (
          <p className="text-sm text-neutral-600">Reference: {billRefNumber}</p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {memberId ? (
            <Button asChild>
              <Link href={`/apply/individual/${memberId}/dashboard`}>
                Back to application dashboard
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="secondary">
            <Link href="/my-application">My application</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}
