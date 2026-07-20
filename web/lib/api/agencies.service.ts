export interface RecruitmentAgency {
  neaRegNo: string;
  agencyName: string;
}

const AGENCY_API_URL =
  process.env.NEXT_PUBLIC_AGENCY_API_URL ??
  'https://majuu.uwezo.go.ke:5002/search-agency';

export async function searchRecruitmentAgencies(
  query: string,
): Promise<RecruitmentAgency[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const response = await fetch(
    `${AGENCY_API_URL}?q=${encodeURIComponent(trimmed)}`,
  );

  if (!response.ok) {
    throw new Error('Failed to search recruitment agencies');
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (item): item is RecruitmentAgency =>
      typeof item === 'object' &&
      item !== null &&
      'neaRegNo' in item &&
      'agencyName' in item &&
      typeof (item as RecruitmentAgency).neaRegNo === 'string' &&
      typeof (item as RecruitmentAgency).agencyName === 'string',
  );
}
