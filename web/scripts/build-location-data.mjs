#!/usr/bin/env node
/**
 * Build ward→location and location→sublocation lookup files from KNBS/IEBC source data.
 * Source: https://github.com/tigawanna/kenya-locations
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../public/data');

const BASE_URL = 'https://raw.githubusercontent.com/tigawanna/kenya-locations/main/data';

async function fetchJson(name) {
  const response = await fetch(`${BASE_URL}/${name}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${name}: ${response.status}`);
  }
  return response.json();
}

function norm(value) {
  return value.trim().toLowerCase();
}

function tokenize(value) {
  return new Set(norm(value).replace(/\//g, ' ').replace(/-/g, ' ').split(/\s+/));
}

async function main() {
  const [constituencies, wards, localities, areas] = await Promise.all([
    fetchJson('constituencies.json'),
    fetchJson('wards.json'),
    fetchJson('locality.json'),
    fetchJson('area.json'),
  ]);

  const constituencyCounty = new Map(
    constituencies.map((entry) => [entry.name, entry.county]),
  );

  const localitiesByCounty = new Map();
  for (const locality of localities) {
    const list = localitiesByCounty.get(locality.county) ?? [];
    list.push(locality.name);
    localitiesByCounty.set(locality.county, list);
  }

  const areasByLocation = new Map();
  for (const area of areas) {
    const key = `${area.county}|${area.locality}`;
    const list = areasByLocation.get(key) ?? [];
    list.push(area.name);
    areasByLocation.set(key, list);
  }

  const wardLocations = {};

  for (const ward of wards) {
    const county = constituencyCounty.get(ward.constituency);
    if (!county) {
      continue;
    }

    const key = `${county}|${ward.constituency}|${ward.name}`;
    const countyLocalities = localitiesByCounty.get(county) ?? [];

    let matches = countyLocalities.filter((locality) => norm(locality) === norm(ward.name));
    if (matches.length === 0) {
      matches = countyLocalities.filter(
        (locality) => norm(ward.name).includes(norm(locality)) || norm(locality).includes(norm(ward.name)),
      );
    }
    if (matches.length === 0) {
      const wardTokens = tokenize(ward.name);
      matches = countyLocalities.filter((locality) => {
        const localityTokens = tokenize(locality);
        for (const token of wardTokens) {
          if (localityTokens.has(token)) {
            return true;
          }
        }
        return false;
      });
    }
    if (matches.length === 0) {
      const constituencyTokens = tokenize(ward.constituency);
      matches = countyLocalities.filter((locality) => {
        const localityTokens = tokenize(locality);
        for (const token of constituencyTokens) {
          if (localityTokens.has(token)) {
            return true;
          }
        }
        return false;
      });
    }

    wardLocations[key] = [...new Set(matches)].sort();
  }

  const locationAreas = Object.fromEntries(
    [...areasByLocation.entries()].map(([key, values]) => [key, [...new Set(values)].sort()]),
  );

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'kenya_ward_locations.json'),
    JSON.stringify(wardLocations),
  );
  fs.writeFileSync(
    path.join(dataDir, 'kenya_location_areas.json'),
    JSON.stringify(locationAreas),
  );

  const withLocations = Object.values(wardLocations).filter((locations) => locations.length > 0).length;
  console.log(`Wrote ${Object.keys(wardLocations).length} ward keys (${withLocations} with locations).`);
  console.log(`Wrote ${Object.keys(locationAreas).length} location area keys.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
