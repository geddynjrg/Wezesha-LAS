'use server';

import {
  getLocationsForWardName as lookupLocationsForWardName,
  getSubLocationsForLocationName as lookupSubLocationsForLocationName,
} from '@/lib/locations/administrative-locations';
import { titleCaseLabel } from '@/lib/locations/format';
import { prisma } from '@/lib/prisma';

export interface LocationOption {
  label: string;
  value: string;
}

export async function getCountyOptions(): Promise<LocationOption[]> {
  const counties = await prisma.county.findMany({
    orderBy: { name: 'asc' },
  });

  return counties.map((county) => ({
    label: county.name,
    value: county.name,
  }));
}

export async function getConstituenciesForCountyName(
  countyName: string,
): Promise<LocationOption[]> {
  if (!countyName.trim()) {
    return [];
  }

  const county = await prisma.county.findFirst({
    where: { name: countyName.trim() },
    include: {
      constituencies: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!county) {
    return [];
  }

  return county.constituencies.map((constituency) => ({
    label: constituency.name,
    value: constituency.name,
  }));
}

export async function getWardsForConstituencyName(
  constituencyName: string,
): Promise<LocationOption[]> {
  if (!constituencyName.trim()) {
    return [];
  }

  const constituency = await prisma.constituency.findFirst({
    where: { name: constituencyName.trim() },
    include: {
      wards: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!constituency) {
    return [];
  }

  return constituency.wards.map((ward) => ({
    label: titleCaseLabel(ward.name),
    value: ward.name,
  }));
}

export async function ensureLocationDataSeeded(): Promise<boolean> {
  const count = await prisma.county.count();
  return count > 0;
}

export async function getLocationsForWardName(
  countyName: string,
  constituencyName: string,
  wardName: string,
): Promise<LocationOption[]> {
  if (!countyName.trim() || !constituencyName.trim() || !wardName.trim()) {
    return [];
  }

  return lookupLocationsForWardName(countyName, constituencyName, wardName);
}

export async function getSubLocationsForLocationName(
  countyName: string,
  locationName: string,
): Promise<LocationOption[]> {
  if (!countyName.trim() || !locationName.trim()) {
    return [];
  }

  return lookupSubLocationsForLocationName(countyName, locationName);
}

export async function getAllConstituencyOptions(): Promise<LocationOption[]> {
  const constituencies = await prisma.constituency.findMany({
    include: {
      county: true,
    },
    orderBy: [{ county: { name: 'asc' } }, { name: 'asc' }],
  });

  return constituencies.map((constituency) => ({
    label: `${constituency.name} (${constituency.county.name})`,
    value: constituency.name,
  }));
}
