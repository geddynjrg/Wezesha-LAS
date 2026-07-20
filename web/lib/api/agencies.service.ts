export interface RecruitmentAgency {
  neaRegNo: string;
  agencyName: string;
}

const AGENCIES_CSV_URL = '/data/Agencies.csv';
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

    agencies.push({ neaRegNo, agencyName });
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

function searchLocalAgencies(
  agencies: RecruitmentAgency[],
  query: string,
): RecruitmentAgency[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) {
    return [];
  }

  const matches = agencies.filter((agency) =>
    agency.neaRegNo.toLowerCase().includes(normalizedQuery),
  );

  matches.sort((left, right) => {
    const leftReg = left.neaRegNo.toLowerCase();
    const rightReg = right.neaRegNo.toLowerCase();

    const leftExact = leftReg === normalizedQuery;
    const rightExact = rightReg === normalizedQuery;
    if (leftExact !== rightExact) {
      return leftExact ? -1 : 1;
    }

    const leftStarts = leftReg.startsWith(normalizedQuery);
    const rightStarts = rightReg.startsWith(normalizedQuery);
    if (leftStarts !== rightStarts) {
      return leftStarts ? -1 : 1;
    }

    return left.neaRegNo.localeCompare(right.neaRegNo);
  });

  return matches.slice(0, MAX_RESULTS);
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

export async function searchRecruitmentAgencies(
  query: string,
): Promise<RecruitmentAgency[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  try {
    const agencies = await loadAgenciesFromCsv();
    const localResults = searchLocalAgencies(agencies, trimmed);
    if (localResults.length > 0) {
      return localResults;
    }
  } catch {
    // Fall through to optional external lookup when CSV is unavailable.
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
  return agencies.find((agency) => agency.neaRegNo.toLowerCase() === normalized);
}
