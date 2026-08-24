import { getGroupApplicationUrl } from '@/lib/constants/majuu-steps';
import { getOrCreateGroupApplication } from '@/lib/data/applications';
import { getSessionUserId } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function CreateApplicationPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login?callbackUrl=/apply/create');
  }
  const application = await getOrCreateGroupApplication();
  redirect(
    getGroupApplicationUrl(
      application.id,
      application.progress,
      application.status,
    ),
  );
}
