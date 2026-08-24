import { IndividualLookupForm } from './individual-lookup-form';

export default async function IndividualLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <IndividualLookupForm error={error} />;
}
