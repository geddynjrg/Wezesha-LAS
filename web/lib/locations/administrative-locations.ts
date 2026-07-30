import fs from 'node:fs';
import path from 'node:path';

import { titleCaseLabel } from '@/lib/locations/format';

interface LocalityRecord {
  name: string;
  county: string;
}

interface AreaRecord {
  name: string;
  locality: string;
  county: string;
}

export interface LocationOption {
  label: string;
  value: string;
}

const COUNTY_ALIASES: Record<string, string> = {
  'nairobi city': 'Nairobi',
  'elgeyo/marakwet': 'Elgeyo-Marakwet',
  'elgeyo marakwet': 'Elgeyo-Marakwet',
  "murang'a": "Murang'a",
  'muranga': "Murang'a",
  'taita taveta': 'Taita-Taveta',
  'tharaka - nithi': 'Tharaka-Nithi',
  'tharaka-nithi': 'Tharaka-Nithi',
  'trans nzoia': 'Trans Nzoia',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeLocationKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveDatasetCounty(countyName: string): string {
  const trimmed = countyName.trim();
  if (!trimmed) {
    return trimmed;
  }

  return COUNTY_ALIASES[normalizeKey(trimmed)] ?? trimmed;
}

function readJsonFile<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), 'public/data', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

let localitiesCache: LocalityRecord[] | null = null;
let areasCache: AreaRecord[] | null = null;

function getLocalities(): LocalityRecord[] {
  if (!localitiesCache) {
    localitiesCache = readJsonFile<LocalityRecord[]>('kenya_localities.json');
  }
  return localitiesCache;
}

function getAreas(): AreaRecord[] {
  if (!areasCache) {
    areasCache = readJsonFile<AreaRecord[]>('kenya_areas.json');
  }
  return areasCache;
}

function localityMatchesWard(localityName: string, wardName: string): boolean {
  const localityKey = normalizeLocationKey(localityName);
  const wardKey = normalizeLocationKey(wardName);

  if (!localityKey || !wardKey) {
    return false;
  }

  if (localityKey === wardKey) {
    return true;
  }

  const localityPrimary = normalizeLocationKey(localityName.split(/[/-]/)[0] ?? localityName);
  const wardPrimary = normalizeLocationKey(wardName.split(/[/-]/)[0] ?? wardName);

  return (
    localityKey.includes(wardKey) ||
    wardKey.includes(localityKey) ||
    localityPrimary === wardPrimary
  );
}

function toLocationOption(name: string): LocationOption {
  const label = titleCaseLabel(name);
  return { label, value: name };
}

function uniqueLocationOptions(options: LocationOption[]): LocationOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = normalizeLocationKey(option.value);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getLocationsForWardName(
  countyName: string,
  wardName: string,
): LocationOption[] {
  const trimmedWard = wardName.trim();
  if (!trimmedWard) {
    return [];
  }

  const datasetCounty = resolveDatasetCounty(countyName);
  const countyLocalities = getLocalities().filter(
    (locality) => normalizeKey(locality.county) === normalizeKey(datasetCounty),
  );

  const wardMatches = countyLocalities.filter((locality) =>
    localityMatchesWard(locality.name, trimmedWard),
  );

  const options =
    wardMatches.length > 0
      ? wardMatches.map((locality) => toLocationOption(locality.name))
      : [toLocationOption(trimmedWard), ...countyLocalities.map((locality) => toLocationOption(locality.name))];

  return uniqueLocationOptions(options);
}

export function getSubLocationsForLocationName(
  countyName: string,
  locationName: string,
): LocationOption[] {
  const trimmedLocation = locationName.trim();
  if (!trimmedLocation) {
    return [];
  }

  const datasetCounty = resolveDatasetCounty(countyName);
  const locationKey = normalizeLocationKey(trimmedLocation);
  const countyAreas = getAreas().filter(
    (area) => normalizeKey(area.county) === normalizeKey(datasetCounty),
  );

  const directMatches = countyAreas.filter(
    (area) => normalizeLocationKey(area.locality) === locationKey,
  );

  const options =
    directMatches.length > 0
      ? directMatches.map((area) => toLocationOption(area.name))
      : [toLocationOption(trimmedLocation)];

  return uniqueLocationOptions(options);
}
