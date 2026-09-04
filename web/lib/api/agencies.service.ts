export interface RecruitmentAgency {
  neaRegNo: string;
  agencyName: string;
  status?: string;
  source?: string;
  companyRegNo?: string;
  expiryDate?: string | null;
}

const AGENCIES_CSV_URL = '/data/Agencies.csv';
const SEARCH_API = '/api/agencies/search';
const MAX_RESULTS = 25;

let agenciesCache: RecruitmentAgency[] | null = null;
let agenciesLoadPromise: Promise<RecruitmentAgency[]> | null = null;

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function parseAgenciesCsv(csvText: string): RecruitmentAgency[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0] ?? '').map((header) => header.trim());
  const neaIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'nea reg no',
  );
  const nameIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'agency name',
  );
  const statusIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'status',
  );

  if (neaIndex === -1 || nameIndex === -1) {
    return [];
  }

  const agencies: RecruitmentAgency[] = [];

  for (const line of lines.slice(1)) {
    const columns = parseCsvLine(line);
    const neaRegNo = columns[neaIndex]?.trim() ?? '';
    const agencyName = columns[nameIndex]?.trim() ?? '';
    const status = statusIndex >= 0 ? (columns[statusIndex]?.trim() ?? '') : 'Valid';

    if (!neaRegNo || !agencyName) {
      continue;
    }

    if (status.toLowerCase() !== 'valid') {
      continue;
    }

    agencies.push({ neaRegNo, agencyName, status, source: 'csv' });
  }

  return agencies;
}

async function loadAgenciesFromCsv(): Promise<RecruitmentAgency[]> {
  if (agenciesCache) {
    return agenciesCache;
  }

  if (!agenciesLoadPromise) {
    agenciesLoadPromise = (async () => {
      const response = await fetch(AGENCIES_CSV_URL);
      if (!response.ok) {
        throw new Error('Failed to load agencies CSV');
      }

      const csvText = await response.text();
      agenciesCache = parseAgenciesCsv(csvText);
      return agenciesCache;
    })();
  }

  return agenciesLoadPromise;
}

function normalizeAgencySearchValue(value: string): string {
  return value.trim().toLowerCase();
}

function agencyMatchesQuery(agency: RecruitmentAgency, normalizedQuery: string): boolean {
  const regNo = normalizeAgencySearchValue(agency.neaRegNo);
  const agencyName = normalizeAgencySearchValue(agency.agencyName);
  const company = normalizeAgencySearchValue(agency.companyRegNo || '');

  return (
    regNo.includes(normalizedQuery) ||
    agencyName.includes(normalizedQuery) ||
    (company.length > 0 && company.includes(normalizedQuery))
  );
}

function agencySearchRank(agency: RecruitmentAgency, normalizedQuery: string): number {
  const regNo = normalizeAgencySearchValue(agency.neaRegNo);
  const agencyName = normalizeAgencySearchValue(agency.agencyName);

  if (regNo === normalizedQuery || agencyName === normalizedQuery) {
    return 0;
  }

  if (regNo.startsWith(normalizedQuery) || agencyName.startsWith(normalizedQuery)) {
    return 1;
  }

  if (agencyName.includes(normalizedQuery)) {
    return 2;
  }

  return 3;
}

function searchLocalAgencies(
  agencies: RecruitmentAgency[],
  query: string,
): RecruitmentAgency[] {
  const normalizedQuery = normalizeAgencySearchValue(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  const matches = agencies.filter((agency) => agencyMatchesQuery(agency, normalizedQuery));

  matches.sort((left, right) => {
    const leftRank = agencySearchRank(left, normalizedQuery);
    const rightRank = agencySearchRank(right, normalizedQuery);
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.agencyName.localeCompare(right.agencyName);
  });

  return matches.slice(0, MAX_RESULTS);
}

async function searchViaPortalApi(query: string): Promise<RecruitmentAgency[] | null> {
  try {
    const response = await fetch(
      `${SEARCH_API}?q=${encodeURIComponent(query)}`,
      { credentials: 'same-origin' },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { results?: RecruitmentAgency[] };
    if (!Array.isArray(data.results)) return null;
    return data.results;
  } catch {
    return null;
  }
}

async function searchExternalAgencies(
  query: string,
): Promise<RecruitmentAgency[]> {
  const apiUrl = process.env.NEXT_PUBLIC_AGENCY_API_URL?.trim();
  if (!apiUrl) {
    return [];
  }

  const response = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}`);
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

/**
 * Search by agency name OR registration number.
 * Prefers live NEAIMS via /api/agencies/search, then CSV, then optional external URL.
 */
export async function searchRecruitmentAgencies(
  query: string,
): Promise<RecruitmentAgency[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const fromApi = await searchViaPortalApi(trimmed);
  if (fromApi && fromApi.length > 0) {
    return fromApi.slice(0, MAX_RESULTS);
  }

  try {
    const agencies = await loadAgenciesFromCsv();
    const local = searchLocalAgencies(agencies, trimmed);
    if (local.length > 0) return local;
  } catch {
    /* fall through */
  }

  if (fromApi) {
    return fromApi;
  }

  try {
    return await searchExternalAgencies(trimmed);
  } catch {
    return [];
  }
}

export function findAgencyByRegNo(
  agencies: RecruitmentAgency[],
  regNo: string,
): RecruitmentAgency | undefined {
  const normalized = regNo.trim().toLowerCase();
  return agencies.find(
    (agency) =>
      agency.neaRegNo.toLowerCase() === normalized ||
      (agency.companyRegNo || '').toLowerCase() === normalized,
  );
}
