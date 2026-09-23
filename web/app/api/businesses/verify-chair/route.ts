import { getSessionUserId } from '@/lib/auth/session';
import {
  assertSessionUserIsMseaChair,
  GroupChairAccessError,
} from '@/lib/group-application-access';
import {
  findMseaChairPartners,
  getMseaDisabledMessage,
  isMseaApiEnabled,
  lookupMseaBusiness,
} from '@/lib/msea';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifies MSEA registration and confirms the signed-in user is the group chair
 * listed in the partners JSON (by national ID or phone).
 */
export async function GET(request: NextRequest) {
  if (!isMseaApiEnabled()) {
    return NextResponse.json({ error: getMseaDisabledMessage() }, { status: 503 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const registrationNumber = request.nextUrl.searchParams.get('registration_number');
  if (!registrationNumber?.trim()) {
    return NextResponse.json(
      { error: 'registration_number query parameter is required' },
      { status: 400 },
    );
  }

  const record = await lookupMseaBusiness(registrationNumber);
  if (!record) {
    return NextResponse.json(
      { error: 'Group not found. Please check the registration number.' },
      { status: 404 },
    );
  }

  const chairs = findMseaChairPartners(record.partners);
  try {
    const verified = await assertSessionUserIsMseaChair(
      registrationNumber,
      record.partners,
    );
    return NextResponse.json({
      ok: true,
      isChair: true,
      business_name: record.business_name,
      registration_number: record.registration_number,
      registration_date: record.registration_date,
      chair: verified.matched
        ? {
            name: verified.matched.name,
            id_number: verified.matched.id_number,
            phone_number: verified.matched.phone_number,
            type: verified.matched.type,
          }
        : chairs[0]
          ? {
              name: chairs[0].name,
              id_number: chairs[0].id_number,
              phone_number: chairs[0].phone_number,
              type: chairs[0].type,
            }
          : null,
      partnerCount: record.partners.length,
      chairCount: chairs.length,
    });
  } catch (error) {
    if (error instanceof GroupChairAccessError) {
      return NextResponse.json(
        {
          ok: false,
          isChair: false,
          error: error.message,
          business_name: record.business_name,
          registration_number: record.registration_number,
          partnerCount: record.partners.length,
          chairCount: chairs.length,
        },
        { status: 403 },
      );
    }
    throw error;
  }
}
