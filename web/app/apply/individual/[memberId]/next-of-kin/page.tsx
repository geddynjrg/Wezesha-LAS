import { IndividualStepForm } from '../individual-step-form';

export default async function NextOfKinPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  return <IndividualStepForm memberId={memberId} step="next-of-kin" />;
}
