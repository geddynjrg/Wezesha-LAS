import { changePasswordSchema } from '@/app/ps/(portal)/profile/change-password-schema';
import { changePsPassword } from '@/lib/auth/user';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !isPsRole(user.role)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message =
      fieldErrors.currentPassword?.[0] ??
      fieldErrors.newPassword?.[0] ??
      fieldErrors.confirmPassword?.[0] ??
      'Invalid input';
    return NextResponse.json({ message }, { status: 400 });
  }

  try {
    await changePsPassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to change password';
    return NextResponse.json({ message }, { status: 400 });
  }
}
