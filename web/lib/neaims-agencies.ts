/**
 * NEAIMS employment agency lookup.
 * Live: POST https://api.neaims.go.ke/api/v1/agencies/public/list {"search":"..."}
 * Cache: disk JSON under .cache/neaims-agencies.json (server) with CSV fallback.
 */

import { promises as fs } from 'fs';
import path from 'path';

export type RecruitmentAgency = {
  neaRegNo: string;
  agencyName: string;
  status?: string;
  source?: 'neaims' | 'csv' | 'cache';
  companyRegNo?: string;
  expiryDate?: string | null;
};

const NEAIMS_URL =
  process.env.NEAIMS_AGENCIES_API_URL ||
  'https://api.neaims.go.ke/api/v1/agencies/public/list';
const CACHE_TTL_MS = Number(process.env.NEAIMS_CACHE_TTL_MS || 6 * 60 * 60 * 1000);
const MAX_RESULTS = 25;
const VALID_NEAIMS = new Set(['LICENSE_PAID', 'LICENSE_ACTIVE', 'VALID']);

type CacheFile = {
  fetchedAt: string;
  agencies: RecruitmentAgency[];
};

function cachePath(): string {
  return path.join(process.cwd(), '.cache', 'neaims-agencies.json');
}

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
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0] ?? '').map((h) => h.trim());
  const neaIndex = headers.findIndex((h) => h.toLowerCase() === 'nea reg no');
  const nameIndex = headers.findIndex((h) => h.toLowerCase() === 'agency name');
  const statusIndex = headers.findIndex((h) => h.toLowerCase() === 'status');
  if (neaIndex === -1 || nameIndex === -1) return [];

  const agencies: RecruitmentAgency[] = [];
  for (const line of lines.slice(1)) {
    const columns = parseCsvLine(line);
    const neaRegNo = columns[neaIndex]?.trim() ?? '';
    const agencyName = columns[nameIndex]?.trim() ?? '';
    const status = statusIndex >= 0 ? (columns[statusIndex]?.trim() ?? '') : 'Valid';
    if (!neaRegNo || !agencyName) continue;
    if (status.toLowerCase() !== 'valid') continue;
    agencies.push({ neaRegNo, agencyName, status, source: 'csv' });
  }
  return agencies;
}

function mapNeaimsRow(row: Record<string, unknown>): RecruitmentAgency | null {
  const name = String(row.instName || '').trim();
  if (!name) return null;
  const status = String(row.instStatus || '').trim();
  const companyRegNo = String(row.instRegNo || '').trim() || undefined;
  const code = String(row.instCode || '').trim();
  // Prefer NEA-style code when present; else company registration number for search.
  const neaRegNo = code || companyRegNo || String(row.instId || '').trim();
  if (!neaRegNo) return null;
  return {
    neaRegNo,
    agencyName: name,
    status,
    companyRegNo,
    expiryDate: row.instExpiryDate ? String(row.instExpiryDate) : null,
    source: 'neaims',
  };
}

function isNeaimsLicensed(agency: RecruitmentAgency): boolean {
  const s = (agency.status || '').toUpperCase();
  if (!s) return true;
  if (VALID_NEAIMS.has(s)) return true;
  if (s === 'LICENSE_EXPIRED' || s === 'LICENSE_DEREGISTERED') return false;
  return s.includes('PAID') || s.includes('VALID') || s.includes('ACTIVE');
}

async function readCache(): Promise<CacheFile | null> {
  try {
    const raw = await fs.readFile(cachePath(), 'utf8');
    return JSON.parse(raw) as CacheFile;
  } catch {
    return null;
  }
}

async function writeCache(agencies: RecruitmentAgency[]): Promise<void> {
  try {
    const dir = path.dirname(cachePath());
    await fs.mkdir(dir, { recursive: true });
    const payload: CacheFile = {
      fetchedAt: new Date().toISOString(),
      agencies,
    };
    await fs.writeFile(cachePath(), JSON.stringify(payload), 'utf8');
  } catch {
    /* non-fatal */
  }
}

export async function fetchNeaimsAgencies(search?: string): Promise<RecruitmentAgency[]> {
  const body = search?.trim() ? { search: search.trim() } : {};
  const res = await fetch(NEAIMS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`NEAIMS HTTP ${res.status}`);
  const data = (await res.json()) as { success?: boolean; data?: unknown };
  if (!data.success || !Array.isArray(data.data)) return [];
  return (data.data as Record<string, unknown>[])
    .map(mapNeaimsRow)
    .filter((a): a is RecruitmentAgency => Boolean(a));
}

/** Refresh full licensed cache (call from cron or first miss). */
export async function syncNeaimsAgencyCache(): Promise<{
  ok: boolean;
  count: number;
  error?: string;
}> {
  try {
    const all = await fetchNeaimsAgencies();
    const licensed = all.filter(isNeaimsLicensed);
    await writeCache(licensed);
    return { ok: true, count: licensed.length };
  } catch (e) {
    return {
      ok: false,
      count: 0,
      error: e instanceof Error ? e.message : 'sync failed',
    };
  }
}

async function loadCsvFallback(): Promise<RecruitmentAgency[]> {
  // Prefer public CSV next to the app; works in Node when file is present.
  const candidates = [
    path.join(process.cwd(), 'public/data/Agencies.csv'),
    path.join(process.cwd(), 'web/public/data/Agencies.csv'),
  ];
  for (const file of candidates) {
    try {
      const text = await fs.readFile(file, 'utf8');
      return parseAgenciesCsv(text);
    } catch {
      /* try next */
    }
  }
  return [];
}

function rankMatch(agency: RecruitmentAgency, q: string): number {
  const reg = agency.neaRegNo.toLowerCase();
  const name = agency.agencyName.toLowerCase();
  const company = (agency.companyRegNo || '').toLowerCase();
  if (reg === q || name === q || company === q) return 0;
  if (reg.startsWith(q) || name.startsWith(q) || company.startsWith(q)) return 1;
  if (name.includes(q) || reg.includes(q) || company.includes(q)) return 2;
  return 3;
}

function filterLocal(agencies: RecruitmentAgency[], query: string): RecruitmentAgency[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return agencies
    .filter((a) => rankMatch(a, q) < 3 || a.agencyName.toLowerCase().includes(q))
    .sort((a, b) => rankMatch(a, q) - rankMatch(b, q) || a.agencyName.localeCompare(b.agencyName))
    .slice(0, MAX_RESULTS);
}

function dedupe(agencies: RecruitmentAgency[]): RecruitmentAgency[] {
  const seen = new Set<string>();
  const out: RecruitmentAgency[] = [];
  for (const a of agencies) {
    const key = `${a.neaRegNo.toLowerCase()}|${a.agencyName.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

/**
 * Search by agency name OR registration number.
 * Prefer live NEAIMS; merge cache + CSV fallback.
 */
export async function searchAgenciesUnified(query: string): Promise<{
  results: RecruitmentAgency[];
  source: string;
}> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { results: [], source: 'empty' };

  let live: RecruitmentAgency[] = [];
  let liveOk = false;
  try {
    // Prefer paginated Kazi254 / loans-admin agency list.
    live = await fetchAllAgencyListPages(trimmed);
    if (live.length === 0) {
      live = (await fetchNeaimsAgencies(trimmed)).filter(isNeaimsLicensed);
    }
    liveOk = true;
  } catch {
    try {
      live = (await fetchNeaimsAgencies(trimmed)).filter(isNeaimsLicensed);
      liveOk = true;
    } catch {
      liveOk = false;
    }
  }

  const cache = await readCache();
  const cacheFresh =
    cache &&
    Date.now() - new Date(cache.fetchedAt).getTime() < CACHE_TTL_MS
      ? cache.agencies
      : null;

  if (!cacheFresh && liveOk) {
    // Opportunistic background refresh of full list (best-effort)
    void syncNeaimsAgencyCache();
  }

  const csv = await loadCsvFallback();
  const localPool = [...(cacheFresh || cache?.agencies || []), ...csv];
  const localHits = filterLocal(localPool, trimmed);

  const merged = dedupe([...live, ...localHits]).slice(0, MAX_RESULTS);
  const source = liveOk
    ? cacheFresh
      ? 'neaims+cache+csv'
      : 'neaims+csv'
    : cache || csv.length
      ? 'cache+csv-fallback'
      : 'empty';

  return { results: merged, source };
}


/** Kazi254 / loans-admin agency list (paginated). Overrides public list when configured. */
const AGENCY_LIST_URL =
  process.env.NEAMIS_AGENCY_LIST_URL ||
  process.env.NEAIMS_AGENCY_LIST_URL ||
  'https://loans-admin.uwezo.go.ke/api/v1/integrations/agency/list?_format=json';

const AGENCY_PAGE_SIZE = Math.min(
  500,
  Math.max(50, Number(process.env.NEAMIS_AGENCY_PAGE_SIZE || 100)),
);

const VALID_AGENCY_STATUSES = new Set([
  'LICENSED',
  'LICENSE_PAID',
  'LICENSE_ACTIVE',
  'VALID',
  'ACTIVE',
]);

function isAgencyListLicensed(status?: string): boolean {
  const s = (status || '').toUpperCase();
  if (!s) return true;
  if (VALID_AGENCY_STATUSES.has(s)) return true;
  if (s.includes('EXPIRED') || s.includes('DEREGISTER') || s.includes('REVOK')) return false;
  return (
    s.includes('LICENSE') ||
    s.includes('VALID') ||
    s.includes('ACTIVE') ||
    s.includes('PAID')
  );
}

function mapAgencyListRow(row: Record<string, unknown>): RecruitmentAgency | null {
  const agencyName = String(row.name || row.agencyName || row.instName || '').trim();
  if (!agencyName) return null;
  const status = String(row.status || row.instStatus || '').trim();
  const neaRegNo = String(
    row.registrationNumber ||
      row.regCertNo ||
      row.agentNumber ||
      row.neaRegNo ||
      row.instCode ||
      row.instRegNo ||
      '',
  ).trim();
  if (!neaRegNo) return null;
  const companyRegNo =
    String(row.kraPin || row.companyRegNo || row.instRegNo || '').trim() || undefined;
  const expiryDate = row.expiryDate
    ? String(row.expiryDate)
    : row.instExpiryDate
      ? String(row.instExpiryDate)
      : null;
  return {
    neaRegNo,
    agencyName,
    status,
    companyRegNo,
    expiryDate,
    source: 'neaims',
  };
}

async function postAgencyListPage(
  search: string,
  start: number,
  limit: number,
): Promise<RecruitmentAgency[]> {
  const key = process.env.NEAMIS_CONSUMER_KEY || process.env.NEAIMS_CONSUMER_KEY || '';
  const secret =
    process.env.NEAMIS_CONSUMER_SECRET || process.env.NEAIMS_CONSUMER_SECRET || '';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const direct =
    AGENCY_LIST_URL.includes('api.kazi254.ke') ||
    AGENCY_LIST_URL.includes('api.neaims.go.ke');
  if (direct && key && secret) {
    headers['X-Consumer-Key'] = key;
    headers['X-Consumer-Secret'] = secret;
  }

  const res = await fetch(AGENCY_LIST_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ search, start, limit }),
    signal: AbortSignal.timeout(30000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Agency list HTTP ${res.status}`);
  const data = (await res.json()) as { data?: unknown };
  const rowsRaw = Array.isArray(data.data) ? (data.data as Record<string, unknown>[]) : [];
  return rowsRaw
    .map(mapAgencyListRow)
    .filter((a): a is RecruitmentAgency => Boolean(a));
}

export async function fetchAllAgencyListPages(
  search = '',
): Promise<RecruitmentAgency[]> {
  const all: RecruitmentAgency[] = [];
  let start = 0;
  for (let page = 0; page < 50; page += 1) {
    const rows = await postAgencyListPage(search, start, AGENCY_PAGE_SIZE);
    all.push(...rows);
    if (rows.length < AGENCY_PAGE_SIZE) break;
    start += AGENCY_PAGE_SIZE;
  }
  return dedupe(all.filter((a) => isAgencyListLicensed(a.status)));
}

/** All licensed agencies for cluster category pickers (paginated upstream). */
export async function listAllLicensedAgencies(): Promise<{
  results: RecruitmentAgency[];
  source: string;
}> {
  try {
    let results = await fetchAllAgencyListPages('');
    if (results.length === 0) {
      results = await fetchAllAgencyListPages(' ');
    }
    if (results.length < 5) {
      for (const token of ['a', 'e', 'i', 'o', 'u', 'Ltd', 'PVT', 'RA', 'Y']) {
        try {
          results = dedupe([...results, ...(await fetchAllAgencyListPages(token))]);
        } catch {
          /* ignore */
        }
      }
    }
    if (results.length > 0) {
      await writeCache(results);
      return { results, source: 'kazi254-agency-list' };
    }
  } catch (e) {
    console.warn('[agencies] listAllLicensedAgencies failed', e);
  }

  const cache = await readCache();
  if (cache?.agencies?.length) {
    return {
      results: cache.agencies.filter(
        (a) => isNeaimsLicensed(a) || isAgencyListLicensed(a.status),
      ),
      source: 'cache',
    };
  }
  const csv = await loadCsvFallback();
  return { results: csv, source: csv.length ? 'csv' : 'empty' };
}
