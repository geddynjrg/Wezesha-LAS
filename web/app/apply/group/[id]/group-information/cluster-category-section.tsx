'use client';

import {
  CLUSTER_CATEGORY_OPTIONS,
  GEO_LOCATION_TYPE_OPTIONS,
  getCountriesForUnCluster,
  UN_CLUSTER_OPTIONS,
} from '@/lib/constants/un-clusters';
import {
  searchRecruitmentAgencies,
  type RecruitmentAgency,
} from '@/lib/api/agencies.service';
import type { LocationOption } from '@/lib/api/locations.service';
import { Field, type FormFieldState } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { labelVariants } from '@workspace/ui/components/label';
import { SearchInput } from '@workspace/ui/components/search-input';
import { Select } from '@workspace/ui/components/select';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ClusterCategoryValue, GroupInformationInput } from './group-information-schema';

function toAgentRegNo(value: string): string {
  const trimmed = value.trim();
  const separatorIndex = trimmed.indexOf(' - ');
  return separatorIndex === -1 ? trimmed : trimmed.slice(0, separatorIndex).trim();
}

const ReadOnlyDisplay: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex w-full flex-col gap-1">
    <span className={cn(labelVariants(), 'mb-1 font-bold')}>{label}</span>
    <Input value={value} readonly disabled />
  </div>
);

export interface ClusterCategorySectionProps {
  state: FormFieldState<GroupInformationInput>;
  values?: Partial<GroupInformationInput>;
  countyOptions: LocationOption[];
  constituencyOptions: LocationOption[];
}

function resolveGeoLocationType(values?: Partial<GroupInformationInput>) {
  if (values?.geoLocationType) {
    return values.geoLocationType;
  }

  if (values?.clusterCounty) {
    return 'county' as const;
  }

  if (values?.clusterConstituency) {
    return 'constituency' as const;
  }

  return '' as const;
}

export const ClusterCategorySection: FC<ClusterCategorySectionProps> = ({
  state,
  values,
  countyOptions,
  constituencyOptions,
}) => {
  const [clusterCategory, setClusterCategory] = useState<ClusterCategoryValue | ''>(
    values?.clusterCategory ?? '',
  );
  const [geoLocationType, setGeoLocationType] = useState<'county' | 'constituency' | ''>(
    resolveGeoLocationType(values),
  );
  const [clusterCounty, setClusterCounty] = useState(values?.clusterCounty ?? '');
  const [clusterConstituency, setClusterConstituency] = useState(
    values?.clusterConstituency ?? '',
  );
  const [destinationRegion, setDestinationRegion] = useState(
    values?.destinationRegion ?? '',
  );
  const [destinationCountry, setDestinationCountry] = useState(
    values?.destinationCountry ?? '',
  );
  const [agentNumber, setAgentNumber] = useState(values?.agentNumber ?? '');
  const [localAgentName, setLocalAgentName] = useState(values?.localAgentName ?? '');
  const [agency, setAgency] = useState(values?.agency ?? '');
  const [otherSelected, setOtherSelected] = useState(Boolean(values?.clusterOther));
  const [clusterOther, setClusterOther] = useState(values?.clusterOther ?? '');

  const [agencyOptions, setAgencyOptions] = useState<{ value: string; label: string }[]>([]);
  const [isSearchingAgencies, setIsSearchingAgencies] = useState(false);

  const agencyCacheRef = useRef(new Map<string, RecruitmentAgency[]>());
  const agencyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const destinationCountryOptions = useMemo(
    () => getCountriesForUnCluster(destinationRegion),
    [destinationRegion],
  );

  const agencySearchOptions = useMemo(
    () =>
      agencyOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [agencyOptions],
  );

  const searchAgencies = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setAgencyOptions([]);
      return;
    }

    const cacheKey = trimmed.toUpperCase();
    if (agencyCacheRef.current.has(cacheKey)) {
      const cached = agencyCacheRef.current.get(cacheKey) ?? [];
      setAgencyOptions(
        cached.map((entry) => ({
          value: entry.neaRegNo,
          label: `${entry.neaRegNo} - ${entry.agencyName}`,
        })),
      );
      return;
    }

    setIsSearchingAgencies(true);
    try {
      const results = await searchRecruitmentAgencies(trimmed);
      agencyCacheRef.current.set(cacheKey, results);
      setAgencyOptions(
        results.map((entry) => ({
          value: entry.neaRegNo,
          label: `${entry.neaRegNo} - ${entry.agencyName}`,
        })),
      );
    } catch {
      setAgencyOptions([]);
    } finally {
      setIsSearchingAgencies(false);
    }
  }, []);

  useEffect(() => {
    if (agentNumber && !localAgentName) {
      void searchAgencies(agentNumber).then(() => {
        const cached = agencyCacheRef.current.get(agentNumber.trim().toUpperCase()) ?? [];
        const match = cached.find(
          (entry) => entry.neaRegNo.toLowerCase() === agentNumber.trim().toLowerCase(),
        );
        if (match) {
          setLocalAgentName(match.agencyName);
          setAgency(match.agencyName);
        }
      });
    }
  }, [agentNumber, localAgentName, searchAgencies]);

  useEffect(
    () => () => {
      if (agencyDebounceRef.current) {
        clearTimeout(agencyDebounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (values?.clusterCategory !== undefined) {
      setClusterCategory((values.clusterCategory as ClusterCategoryValue) || '');
    }
    if (values?.geoLocationType !== undefined || values?.clusterCounty || values?.clusterConstituency) {
      setGeoLocationType(resolveGeoLocationType(values));
    }
    if (values?.clusterCounty !== undefined) {
      setClusterCounty(values.clusterCounty ?? '');
    }
    if (values?.clusterConstituency !== undefined) {
      setClusterConstituency(values.clusterConstituency ?? '');
    }
    if (values?.destinationRegion !== undefined) {
      setDestinationRegion(values.destinationRegion ?? '');
    }
    if (values?.destinationCountry !== undefined) {
      setDestinationCountry(values.destinationCountry ?? '');
    }
    if (values?.agentNumber !== undefined) {
      setAgentNumber(values.agentNumber ?? '');
    }
    if (values?.localAgentName !== undefined) {
      setLocalAgentName(values.localAgentName ?? '');
    }
    if (values?.agency !== undefined) {
      setAgency(values.agency ?? '');
    }
    if (values?.clusterOther !== undefined) {
      setClusterOther(values.clusterOther ?? '');
      setOtherSelected(Boolean(values.clusterOther));
    }
  }, [values]);

  const handleClusterCategoryChange = (value: ClusterCategoryValue) => {
    setClusterCategory(value);
    setGeoLocationType('');
    setClusterCounty('');
    setClusterConstituency('');
    setDestinationRegion('');
    setDestinationCountry('');
    setAgentNumber('');
    setLocalAgentName('');
    setAgency('');
    setOtherSelected(false);
    setClusterOther('');
  };

  const handleAgentNumberChange = (value: string | undefined) => {
    const next = toAgentRegNo(value ?? '');
    setAgentNumber(next);

    if (agencyDebounceRef.current) {
      clearTimeout(agencyDebounceRef.current);
    }

    agencyDebounceRef.current = setTimeout(() => {
      void searchAgencies(next).then(() => {
        const cached = agencyCacheRef.current.get(next.trim().toUpperCase()) ?? [];
        const exactMatch = cached.find(
          (entry) => entry.neaRegNo.toLowerCase() === next.trim().toLowerCase(),
        );
        if (exactMatch) {
          setLocalAgentName(exactMatch.agencyName);
          setAgency(exactMatch.agencyName);
        }
      });
    }, 150);
  };

  const handleAgentSelect = (value: string) => {
    const selected = agencyOptions.find((option) => option.value === value);
    if (!selected) {
      return;
    }

    const agencyName = selected.label.includes(' - ')
      ? selected.label.split(' - ').slice(1).join(' - ')
      : '';

    setAgentNumber(value);
    setLocalAgentName(agencyName);
    setAgency(agencyName);
  };

  return (
    <FormCard title="Cluster Category" className="mt-7">
      <input type="hidden" name="clusterCategory" value={clusterCategory} />

      {clusterCategory === 'geographical' && (
        <>
          <input type="hidden" name="geoLocationType" value={geoLocationType} />
          {geoLocationType === 'county' && (
            <input type="hidden" name="clusterCounty" value={clusterCounty} />
          )}
          {geoLocationType === 'constituency' && (
            <input
              type="hidden"
              name="clusterConstituency"
              value={clusterConstituency}
            />
          )}
        </>
      )}

      {clusterCategory === 'destination' && (
        <>
          <input type="hidden" name="destinationRegion" value={destinationRegion} />
          <input type="hidden" name="destinationCountry" value={destinationCountry} />
        </>
      )}

      {clusterCategory === 'agency' && (
        <>
          <input type="hidden" name="agency" value={agency} />
          <input type="hidden" name="agentNumber" value={agentNumber} />
          <input type="hidden" name="localAgentName" value={localAgentName} />
        </>
      )}

      {clusterCategory === 'other' && (
        <input type="hidden" name="clusterOther" value={clusterOther} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          state={state}
          name="clusterCategory"
          required
          className="md:col-span-2"
          control={(props) => {
            const { name: _name, defaultValue: _defaultValue, ...fieldProps } = props;
            return (
              <Select
                {...fieldProps}
                name=""
                placeholder="Select Cluster Category"
                options={CLUSTER_CATEGORY_OPTIONS}
                value={clusterCategory}
                onValueChange={(value) =>
                  handleClusterCategoryChange(value as ClusterCategoryValue)
                }
              />
            );
          }}
        />

        {clusterCategory === 'geographical' && (
          <>
            <h3 className="typo-body-large font-semibold md:col-span-2">
              Geographical Location
            </h3>
            <Field
              state={state}
              name="geoLocationType"
              label="Cluster By"
              required
              className="md:col-span-2"
              control={(props) => {
                const { name: _name, defaultValue: _defaultValue, ...fieldProps } = props;
                return (
                  <Select
                    {...fieldProps}
                    name=""
                    placeholder="Select Geographical Location"
                    options={GEO_LOCATION_TYPE_OPTIONS}
                    value={geoLocationType}
                    onValueChange={(value) => {
                      setGeoLocationType(value as 'county' | 'constituency');
                      setClusterCounty('');
                      setClusterConstituency('');
                    }}
                  />
                );
              }}
            />

            {geoLocationType === 'county' && (
              <Field
                state={state}
                name="clusterCounty"
                label="County"
                required
                control={(props) => {
                  const { name: _name, ...fieldProps } = props;
                  return (
                    <SearchInput
                      {...fieldProps}
                      name=""
                      defaultValue={clusterCounty}
                      placeholder="Select County"
                      options={countyOptions}
                      onValueChange={(value) => setClusterCounty(value ?? '')}
                      onValueSelect={(value) => setClusterCounty(value ?? '')}
                    />
                  );
                }}
              />
            )}

            {geoLocationType === 'constituency' && (
              <Field
                state={state}
                name="clusterConstituency"
                label="Constituency"
                required
                control={(props) => {
                  const { name: _name, ...fieldProps } = props;
                  return (
                    <SearchInput
                      {...fieldProps}
                      name=""
                      defaultValue={clusterConstituency}
                      placeholder="Select Constituency"
                      options={constituencyOptions}
                      onValueChange={(value) => setClusterConstituency(value ?? '')}
                      onValueSelect={(value) => setClusterConstituency(value ?? '')}
                    />
                  );
                }}
              />
            )}
          </>
        )}

        {clusterCategory === 'destination' && (
          <>
            <Field
              state={state}
              name="destinationRegion"
              label="UN Cluster"
              required
              control={(props) => {
                const { name: _name, defaultValue: _defaultValue, ...fieldProps } = props;
                return (
                  <Select
                    {...fieldProps}
                    name=""
                    placeholder="Select UN Cluster"
                    options={UN_CLUSTER_OPTIONS}
                    value={destinationRegion}
                    onValueChange={(value) => {
                      setDestinationRegion(value);
                      setDestinationCountry('');
                    }}
                  />
                );
              }}
            />

            <Field
              state={state}
              name="destinationCountry"
              label="Country"
              required
              control={(props) => {
                const { name: _name, defaultValue: _defaultValue, ...fieldProps } = props;
                return (
                  <Select
                    {...fieldProps}
                    name=""
                    placeholder="Select Country"
                    options={destinationCountryOptions}
                    value={destinationCountry}
                    disabled={!destinationRegion}
                    onValueChange={setDestinationCountry}
                  />
                );
              }}
            />
          </>
        )}

        {clusterCategory === 'agency' && (
          <>
            <Field
              state={state}
              name="agentNumber"
              label="Agent Number (NEA)"
              required
              control={(props) => {
                const { name: _name, ...fieldProps } = props;
                return (
                  <SearchInput
                    {...fieldProps}
                    name=""
                    defaultValue={agentNumber}
                    placeholder="Enter agent number"
                    options={agencySearchOptions}
                    isLoading={isSearchingAgencies}
                    onValueChange={handleAgentNumberChange}
                    onValueSelect={handleAgentSelect}
                  />
                );
              }}
            />

            <ReadOnlyDisplay
              label="Name of Local Recruitment Agent"
              value={localAgentName}
            />
          </>
        )}

        {clusterCategory === 'other' && (
          <>
            <div className="flex w-full flex-col gap-1">
              <span className={cn(labelVariants(), 'mb-1 font-bold')}>
                Any Other
                <span className="text-destructive">*</span>
              </span>
              <Select
                placeholder="Select if other"
                options={[{ value: 'other', label: 'Other (Specify)' }]}
                value={otherSelected ? 'other' : ''}
                onValueChange={(value) => {
                  const selected = value === 'other';
                  setOtherSelected(selected);
                  if (!selected) {
                    setClusterOther('');
                  }
                }}
              />
            </div>

            {otherSelected && (
              <Field
                state={state}
                name="clusterOther"
                label="Specify other cluster"
                required
                control={(props) => {
                  const { name: _name, ...fieldProps } = props;
                  return (
                    <Input
                      {...fieldProps}
                      name=""
                      value={clusterOther}
                      placeholder="Specify other cluster"
                      onChange={(event) => setClusterOther(event.target.value)}
                    />
                  );
                }}
              />
            )}
          </>
        )}
      </div>
    </FormCard>
  );
};
