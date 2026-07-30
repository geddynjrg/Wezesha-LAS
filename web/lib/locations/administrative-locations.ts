import fs from 'node:fs';
import path from 'node:path';

import { titleCaseLabel } from '@/lib/locations/format';

export interface LocationOption {
  label: string;
  value: string;
}

const COUNTY_ALIASES: Record<string, string> = {
  'nairobi city': 'Nairobi',
  'elgeyo/marakwet': 'Elgeyo-Marakwet',
  'elgeyo marakwet': 'Elgeyo-Marakwet',
  "murang'a": "Murang'a",
  muranga: "Murang'a",
  'taita taveta': 'Taita-Taveta',
  'tharaka - nithi': 'Tharaka-Nithi',
  'tharaka-nithi': 'Tharaka-Nithi',
  'trans nzoia': 'Trans Nzoia',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
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

let wardLocationsCache: Record<string, string[]> | null = null;
let locationAreasCache: Record<string, string[]> | null = null;

function getWardLocationsMap(): Record<string, string[]> {
  if (!wardLocationsCache) {
    wardLocationsCache = readJsonFile<Record<string, string[]>>('kenya_ward_locations.json');
  }
  return wardLocationsCache;
}

function getLocationAreasMap(): Record<string, string[]> {
  if (!locationAreasCache) {
    locationAreasCache = readJsonFile<Record<string, string[]>>('kenya_location_areas.json');
  }
  return locationAreasCache;
}

function buildWardKey(countyName: string, constituencyName: string, wardName: string): string {
  return `${resolveDatasetCounty(countyName)}|${constituencyName.trim()}|${wardName.trim()}`;
}

function buildLocationKey(countyName: string, locationName: string): string {
  return `${resolveDatasetCounty(countyName)}|${locationName.trim()}`;
}

function toLocationOption(name: string): LocationOption {
  const label = titleCaseLabel(name);
  return { label, value: name };
}

function uniqueLocationOptions(options: LocationOption[]): LocationOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = option.value.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getLocationsForWardName(
  countyName: string,
  constituencyName: string,
  wardName: string,
): LocationOption[] {
  const trimmedWard = wardName.trim();
  const trimmedConstituency = constituencyName.trim();
  if (!trimmedWard || !trimmedConstituency) {
    return [];
  }

  const wardKey = buildWardKey(countyName, trimmedConstituency, trimmedWard);
  const locations = getWardLocationsMap()[wardKey] ?? [];

  if (locations.length === 0) {
    return [];
  }

  return uniqueLocationOptions(locations.map((location) => toLocationOption(location)));
}

export function getSubLocationsForLocationName(
  countyName: string,
  locationName: string,
): LocationOption[] {
  const trimmedLocation = locationName.trim();
  if (!trimmedLocation) {
    return [];
  }

  const locationKey = buildLocationKey(countyName, trimmedLocation);
  const subLocations = getLocationAreasMap()[locationKey] ?? [];

  if (subLocations.length === 0) {
    return [toLocationOption(trimmedLocation)];
  }

  return uniqueLocationOptions(subLocations.map((subLocation) => toLocationOption(subLocation)));
}
