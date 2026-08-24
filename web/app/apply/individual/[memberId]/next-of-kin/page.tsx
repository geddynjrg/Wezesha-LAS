import { redirect } from 'next/navigation';

export default async function NextOfKinRedirectPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  redirect(`/apply/individual/${memberId}/guarantor`);
}
