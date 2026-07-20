'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveLocationAction } from './location-action';
import { locationSchema, type LocationInput } from './location-schema';
import {
  getConstituenciesForCountyName,
  getWardsForConstituencyName,
  type LocationOption,
} from '@/lib/api/locations.service';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { SearchInput } from '@workspace/ui/components/search-input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useCallback, useEffect, useState } from 'react';

export const LocationForm: FC<{
  memberId: string;
  countyOptions: LocationOption[];
  defaultValues?: Partial<LocationInput>;
}> = ({ memberId, countyOptions, defaultValues }) => {
  const action = saveLocationAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, locationSchema, defaultValues);

  const [filteredConstituencies, setFilteredConstituencies] = useState<LocationOption[]>([]);
  const [filteredWards, setFilteredWards] = useState<LocationOption[]>([]);
  const [chosenCounty, setChosenCounty] = useState(defaultValues?.county);
  const [chosenConstituency, setChosenConstituency] = useState(defaultValues?.constituency);
  const [isLoadingConstituencies, setIsLoadingConstituencies] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const updateConstituenciesForCounty = useCallback(
    async (countyName: string) => {
      const isValidCounty = countyOptions.some(
        (county) => county.value === countyName || county.label === countyName,
      );

      if (!countyName || !isValidCounty) {
        setFilteredConstituencies([]);
        return;
      }

      setIsLoadingConstituencies(true);
      try {
        const constituencies = await getConstituenciesForCountyName(countyName);
        setFilteredConstituencies(constituencies);
      } catch {
        setFilteredConstituencies([]);
      } finally {
        setIsLoadingConstituencies(false);
      }
    },
    [countyOptions],
  );

  const updateWardsForConstituency = useCallback(async (constituencyName: string) => {
    const trimmed = constituencyName?.trim();
    if (!trimmed) {
      setFilteredWards([]);
      return;
    }

    setIsLoadingWards(true);
    try {
      const wards = await getWardsForConstituencyName(trimmed);
      setFilteredWards(wards);
    } catch {
      setFilteredWards([]);
    } finally {
      setIsLoadingWards(false);
    }
  }, []);

  useEffect(() => {
    if (defaultValues?.county) {
      void updateConstituenciesForCounty(defaultValues.county);
    }
    if (defaultValues?.constituency) {
      void updateWardsForConstituency(defaultValues.constituency);
    }
  }, [
    defaultValues?.county,
    defaultValues?.constituency,
    updateConstituenciesForCounty,
    updateWardsForConstituency,
  ]);

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Location Information">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              state={state}
              name="county"
              label="County"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? defaultValues?.county}
                  placeholder="Choose or search county"
                  options={countyOptions}
                  onValueChange={(value) => {
                    setChosenCounty(value);
                  }}
                  onValueSelect={(value) => {
                    setChosenCounty(value);
                    setChosenConstituency(undefined);
                    setFilteredWards([]);
                    if (value) {
                      void updateConstituenciesForCounty(value);
                    } else {
                      setFilteredConstituencies([]);
                    }
                  }}
                />
              )}
            />

            <Field
              state={state}
              name="constituency"
              label="Constituency"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? defaultValues?.constituency}
                  placeholder="Choose or search constituency"
                  options={filteredConstituencies}
                  isLoading={isLoadingConstituencies}
                  disabled={!chosenCounty && !defaultValues?.county}
                  onValueChange={(value) => {
                    setChosenConstituency(value);
                    if (!value) {
                      setFilteredWards([]);
                    }
                  }}
                  onValueSelect={(value) => {
                    setChosenConstituency(value);
                    void updateWardsForConstituency(value);
                  }}
                />
              )}
            />

            <Field
              state={state}
              name="ward"
              label="Ward"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? defaultValues?.ward}
                  placeholder="Choose or search ward"
                  options={filteredWards}
                  isLoading={isLoadingWards}
                  disabled={
                    !(chosenConstituency || defaultValues?.constituency) ||
                    isLoadingWards
                  }
                />
              )}
            />

            <FormField
              name="location"
              label="Location"
              state={state}
              defaultValue={defaultValues?.location}
            />
            <FormField
              name="subLocation"
              label="Sub-location"
              state={state}
              defaultValue={defaultValues?.subLocation}
            />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending}
        prevUrl={`/apply/individual/${memberId}/individual-information`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
