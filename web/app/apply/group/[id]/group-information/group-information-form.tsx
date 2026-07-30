'use client';

import { saveGroupInformationAction } from '@/app/apply/group/[id]/group-information/group-information-action';
import { ClusterCategorySection } from '@/app/apply/group/[id]/group-information/cluster-category-section';
import {
  groupInformationSchema,
  type GroupInformationInput,
} from '@/app/apply/group/[id]/group-information/group-information-schema';
import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { MseaRegistrationFields } from '@/components/msea-registration-fields';
import {
  getConstituenciesForCountyName,
  getLocationsForWardName,
  getSubLocationsForLocationName,
  getWardsForConstituencyName,
  type LocationOption,
} from '@/lib/api/locations.service';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { SearchInput } from '@workspace/ui/components/search-input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

export interface GroupInformationFormProps {
  id: string;
  countyOptions: LocationOption[];
  constituencyOptions: LocationOption[];
  defaultValues?: Partial<GroupInformationInput>;
}

export const GroupInformationForm: FC<GroupInformationFormProps> = ({
  id,
  countyOptions,
  constituencyOptions,
  defaultValues,
}) => {
  const action = saveGroupInformationAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, groupInformationSchema, defaultValues);
  const formValues = useMemo(
    () => ({ ...defaultValues, ...state.values }),
    [defaultValues, state.values],
  );

  const [filteredConstituencies, setFilteredConstituencies] = useState<LocationOption[]>([]);
  const [filteredWards, setFilteredWards] = useState<LocationOption[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationOption[]>([]);
  const [filteredSubLocations, setFilteredSubLocations] = useState<LocationOption[]>([]);
  const [chosenCounty, setChosenCounty] = useState(formValues.county);
  const [chosenConstituency, setChosenConstituency] = useState(formValues.constituency);
  const [chosenWard, setChosenWard] = useState(formValues.ward);
  const [chosenLocation, setChosenLocation] = useState(formValues.location);
  const [isLoadingConstituencies, setIsLoadingConstituencies] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingSubLocations, setIsLoadingSubLocations] = useState(false);
  const [mseaValidated, setMseaValidated] = useState(
    Boolean(
      formValues.groupName &&
        formValues.registrationNumber &&
        formValues.registrationDate,
    ),
  );

  useEffect(() => {
    if (formValues.county !== undefined) {
      setChosenCounty(formValues.county);
    }
    if (formValues.constituency !== undefined) {
      setChosenConstituency(formValues.constituency);
    }
    if (formValues.ward !== undefined) {
      setChosenWard(formValues.ward);
    }
    if (formValues.location !== undefined) {
      setChosenLocation(formValues.location);
    }
  }, [formValues.county, formValues.constituency, formValues.ward, formValues.location]);

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

  const updateLocationsForWard = useCallback(
    async (countyName: string, constituencyName: string, wardName: string) => {
      const trimmedCounty = countyName?.trim();
      const trimmedConstituency = constituencyName?.trim();
      const trimmedWard = wardName?.trim();
      if (!trimmedCounty || !trimmedConstituency || !trimmedWard) {
        setFilteredLocations([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
        const locations = await getLocationsForWardName(
          trimmedCounty,
          trimmedConstituency,
          trimmedWard,
        );
        setFilteredLocations(locations);
      } catch {
        setFilteredLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    },
    [],
  );

  const updateSubLocationsForLocation = useCallback(
    async (countyName: string, locationName: string) => {
      const trimmedCounty = countyName?.trim();
      const trimmedLocation = locationName?.trim();
      if (!trimmedCounty || !trimmedLocation) {
        setFilteredSubLocations([]);
        return;
      }

      setIsLoadingSubLocations(true);
      try {
        const subLocations = await getSubLocationsForLocationName(trimmedCounty, trimmedLocation);
        setFilteredSubLocations(subLocations);
      } catch {
        setFilteredSubLocations([]);
      } finally {
        setIsLoadingSubLocations(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (formValues.county) {
      void updateConstituenciesForCounty(formValues.county);
    }
    if (formValues.constituency) {
      void updateWardsForConstituency(formValues.constituency);
    }
    if (formValues.county && formValues.constituency && formValues.ward) {
      void updateLocationsForWard(formValues.county, formValues.constituency, formValues.ward);
    }
    if (formValues.county && formValues.location) {
      void updateSubLocationsForLocation(formValues.county, formValues.location);
    }
  }, [
    formValues.county,
    formValues.constituency,
    formValues.ward,
    formValues.location,
    updateConstituenciesForCounty,
    updateWardsForConstituency,
    updateLocationsForWard,
    updateSubLocationsForLocation,
  ]);

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Group Information">
          <div className="grid gap-4 md:grid-cols-2">
            <MseaRegistrationFields
              state={state}
              defaultValues={{
                groupName: formValues.groupName,
                registrationNumber: formValues.registrationNumber,
                registrationDate: formValues.registrationDate,
              }}
              onLookupStateChange={setMseaValidated}
            />
          </div>
        </FormCard>

        <FormCard title="Location of the Group" className="mt-7">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              state={state}
              name="county"
              label="County"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? formValues.county}
                  placeholder="Choose or search county"
                  options={countyOptions}
                  onValueChange={(value) => {
                    setChosenCounty(value);
                  }}
                  onValueSelect={(value) => {
                    setChosenCounty(value);
                    setChosenConstituency(undefined);
                    setChosenWard(undefined);
                    setChosenLocation(undefined);
                    setFilteredWards([]);
                    setFilteredLocations([]);
                    setFilteredSubLocations([]);
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
                  defaultValue={props.defaultValue ?? formValues.constituency}
                  placeholder="Choose or search constituency"
                  options={filteredConstituencies}
                  isLoading={isLoadingConstituencies}
                  disabled={!chosenCounty && !formValues.county}
                  onValueChange={(value) => {
                    setChosenConstituency(value);
                    if (!value) {
                      setChosenWard(undefined);
                      setChosenLocation(undefined);
                      setFilteredWards([]);
                      setFilteredLocations([]);
                      setFilteredSubLocations([]);
                    }
                  }}
                  onValueSelect={(value) => {
                    setChosenConstituency(value);
                    setChosenWard(undefined);
                    setChosenLocation(undefined);
                    setFilteredLocations([]);
                    setFilteredSubLocations([]);
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
                  defaultValue={props.defaultValue ?? formValues.ward}
                  placeholder="Choose or search ward"
                  options={filteredWards}
                  isLoading={isLoadingWards}
                  disabled={
                    !(chosenConstituency || formValues.constituency) ||
                    isLoadingWards
                  }
                  onValueChange={(value) => {
                    setChosenWard(value);
                    if (!value) {
                      setChosenLocation(undefined);
                      setFilteredLocations([]);
                      setFilteredSubLocations([]);
                    }
                  }}
                  onValueSelect={(value) => {
                    setChosenWard(value);
                    setChosenLocation(undefined);
                    setFilteredSubLocations([]);
                    const county = chosenCounty || formValues.county;
                    const constituency = chosenConstituency || formValues.constituency;
                    if (county && constituency) {
                      void updateLocationsForWard(county, constituency, value);
                    } else {
                      setFilteredLocations([]);
                    }
                  }}
                />
              )}
            />

            <Field
              state={state}
              name="location"
              label="Location"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? formValues.location}
                  placeholder="Choose or search location"
                  options={filteredLocations}
                  isLoading={isLoadingLocations}
                  disabled={!(chosenWard || formValues.ward) || isLoadingLocations}
                  onValueChange={(value) => {
                    setChosenLocation(value);
                    if (!value) {
                      setFilteredSubLocations([]);
                    }
                  }}
                  onValueSelect={(value) => {
                    setChosenLocation(value);
                    const county = chosenCounty || formValues.county;
                    if (county) {
                      void updateSubLocationsForLocation(county, value);
                    } else {
                      setFilteredSubLocations([]);
                    }
                  }}
                />
              )}
            />

            <Field
              state={state}
              name="subLocation"
              label="Sub-location"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? formValues.subLocation}
                  placeholder="Choose or search sub-location"
                  options={filteredSubLocations}
                  isLoading={isLoadingSubLocations}
                  disabled={!(chosenLocation || formValues.location) || isLoadingSubLocations}
                />
              )}
            />
          </div>
        </FormCard>

        <ClusterCategorySection
          state={state}
          values={formValues}
          countyOptions={countyOptions}
          constituencyOptions={constituencyOptions}
        />
      </Container>

      <ApplyFormActionBar
        disabled={isPending || !mseaValidated}
        prevUrl={`/apply/group/${id}`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
