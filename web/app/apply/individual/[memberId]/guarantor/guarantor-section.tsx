'use client';

import { FormField } from '@/components/form-field';
import { KenyanPhoneInput } from '@/components/kenyan-phone-input';
import {
  GENDER_OPTIONS,
  type GuarantorFieldsInput,
} from './guarantor-schema';
import {
  getConstituenciesForCountyName,
  getLocationsForWardName,
  getSubLocationsForLocationName,
  getWardsForConstituencyName,
  type LocationOption,
} from '@/lib/api/locations.service';
import { Button } from '@workspace/ui/components/button';
import { Field } from '@workspace/ui/components/form';
import { SearchInput } from '@workspace/ui/components/search-input';
import { RadioGroup } from '@workspace/ui/components/radio-group';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useCallback, useEffect, useState } from 'react';

export interface GuarantorSectionState {
  otpVerified: boolean;
  otpStatus: string;
}

interface GuarantorSectionProps {
  guarantorNumber: 1 | 2;
  countyOptions: LocationOption[];
  defaultValues?: Partial<GuarantorFieldsInput>;
  state?: {
    errors?: Record<string, string[] | undefined>;
    values?: Record<string, string>;
  };
  sectionState?: GuarantorSectionState;
  feedbackMessage?: string;
  feedbackSuccess?: boolean;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  isSendingOtp?: boolean;
  isVerifyingOtp?: boolean;
}

export const GuarantorSection: FC<GuarantorSectionProps> = ({
  guarantorNumber,
  countyOptions,
  defaultValues,
  state,
  sectionState,
  feedbackMessage,
  feedbackSuccess,
  onSendOtp,
  onVerifyOtp,
  isSendingOtp,
  isVerifyingOtp,
}) => {
  const prefix = `guarantor${guarantorNumber}_`;
  const field = (name: keyof GuarantorFieldsInput) => `${prefix}${name}`;

  const [filteredConstituencies, setFilteredConstituencies] = useState<LocationOption[]>([]);
  const [filteredWards, setFilteredWards] = useState<LocationOption[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationOption[]>([]);
  const [filteredSubLocations, setFilteredSubLocations] = useState<LocationOption[]>([]);
  const [chosenCounty, setChosenCounty] = useState(defaultValues?.county);
  const [chosenConstituency, setChosenConstituency] = useState(defaultValues?.constituency);
  const [chosenWard, setChosenWard] = useState(defaultValues?.ward);
  const [chosenLocation, setChosenLocation] = useState(defaultValues?.location);
  const [isLoadingConstituencies, setIsLoadingConstituencies] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingSubLocations, setIsLoadingSubLocations] = useState(false);

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
    if (defaultValues?.county) {
      void updateConstituenciesForCounty(defaultValues.county);
    }
    if (defaultValues?.constituency) {
      void updateWardsForConstituency(defaultValues.constituency);
    }
    if (defaultValues?.county && defaultValues?.constituency && defaultValues?.ward) {
      void updateLocationsForWard(
        defaultValues.county,
        defaultValues.constituency,
        defaultValues.ward,
      );
    }
    if (defaultValues?.county && defaultValues?.location) {
      void updateSubLocationsForLocation(defaultValues.county, defaultValues.location);
    }
  }, [
    defaultValues?.county,
    defaultValues?.constituency,
    defaultValues?.ward,
    defaultValues?.location,
    updateConstituenciesForCounty,
    updateWardsForConstituency,
    updateLocationsForWard,
    updateSubLocationsForLocation,
  ]);

  const otpVerified = sectionState?.otpVerified ?? false;
  const otpStatus = sectionState?.otpStatus ?? 'PENDING';

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-300 bg-background p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="typo-h6">Guarantor {guarantorNumber}</h3>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            otpVerified
              ? 'bg-green-100 text-green-800'
              : otpStatus === 'SENT'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-neutral-100 text-neutral-700',
          )}
        >
          {otpVerified ? 'Consent verified' : otpStatus === 'SENT' ? 'OTP sent — awaiting verification' : 'Pending OTP consent'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          name={field('name')}
          label="Full Name"
          required
          state={state}
          defaultValue={defaultValues?.name}
        />

        <Field
          state={state}
          name={field('gender')}
          label="Gender"
          required
          control={(props) => (
            <RadioGroup
              {...props}
              name={field('gender')}
              defaultValue={defaultValues?.gender}
              orientation="horizontal"
              options={GENDER_OPTIONS.map((value) => ({
                label: value,
                value,
              }))}
            />
          )}
        />

        <FormField
          name={field('kraPin')}
          label="KRA PIN"
          required
          state={state}
          defaultValue={defaultValues?.kraPin}
        />

        <FormField
          name={field('nationalId')}
          label="National ID"
          required
          state={state}
          defaultValue={defaultValues?.nationalId}
        />

        <Field
          state={state}
          name={field('county')}
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
          name={field('constituency')}
          label="Subcounty (Constituency)"
          required
          control={(props) => (
            <SearchInput
              {...props}
              defaultValue={props.defaultValue ?? defaultValues?.constituency}
              placeholder="Choose or search subcounty"
              options={filteredConstituencies}
              isLoading={isLoadingConstituencies}
              disabled={!chosenCounty && !defaultValues?.county}
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
          name={field('ward')}
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
                const county = chosenCounty || defaultValues?.county;
                const constituency = chosenConstituency || defaultValues?.constituency;
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
          name={field('location')}
          label="Location"
          required
          control={(props) => (
            <SearchInput
              {...props}
              defaultValue={props.defaultValue ?? defaultValues?.location}
              placeholder="Choose or search location"
              options={filteredLocations}
              isLoading={isLoadingLocations}
              disabled={!(chosenWard || defaultValues?.ward) || isLoadingLocations}
              onValueChange={(value) => {
                setChosenLocation(value);
                if (!value) {
                  setFilteredSubLocations([]);
                }
              }}
              onValueSelect={(value) => {
                setChosenLocation(value);
                const county = chosenCounty || defaultValues?.county;
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
          name={field('subLocation')}
          label="Sublocation"
          required
          control={(props) => (
            <SearchInput
              {...props}
              defaultValue={props.defaultValue ?? defaultValues?.subLocation}
              placeholder="Choose or search sublocation"
              options={filteredSubLocations}
              isLoading={isLoadingSubLocations}
              disabled={!(chosenLocation || defaultValues?.location) || isLoadingSubLocations}
            />
          )}
        />

        <Field
          state={state}
          name={field('phone')}
          label="Mobile Phone (for OTP)"
          required
          className="md:col-span-2"
          control={(props) => (
            <KenyanPhoneInput
              {...props}
              defaultValue={defaultValues?.phone ?? props.defaultValue}
            />
          )}
        />
      </div>

      <div className="rounded-xl border border-dashed border-neutral-300 p-4">
        <p className="typo-body-medium mb-3 text-neutral-700">
          Send an OTP to the guarantor&apos;s phone. The code is delivered by SMS and to the Uwezo Fund app (if they are signed in). Ask them to share the code with you.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isSendingOtp || otpVerified}
            onClick={onSendOtp}
          >
            {isSendingOtp ? 'Sending OTP...' : otpVerified ? 'OTP verified' : 'Send OTP to Guarantor'}
          </Button>
        </div>

        {!otpVerified && (
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <FormField
              name={`${prefix}otp`}
              label="Enter OTP from guarantor"
              placeholder="6-digit code"
              state={state}
            />
            <Button
              type="button"
              disabled={isVerifyingOtp}
              onClick={onVerifyOtp}
            >
              {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>
        )}

        {feedbackMessage && (
          <p
            className={cn(
              'typo-body-medium mt-3',
              feedbackSuccess ? 'text-green-700' : 'text-red-600',
            )}
          >
            {feedbackMessage}
          </p>
        )}
      </div>
    </div>
  );
};
