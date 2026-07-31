'use client';

import { cn } from '@workspace/ui/lib/utils';
import Image from 'next/image';
import { type FC } from 'react';

export function formatAgreementDate(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date;
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}-${month}-${year}`;
}

export function SignaturePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-wrap items-baseline gap-2">
      <span className="font-bold">{label}</span>
      <div
        aria-hidden
        className="h-[60px] min-w-[250px] flex-1 border-b border-dotted border-black bg-[#fcfcfc]"
      />
    </div>
  );
}

export function SignatureDisplay({
  label,
  signature,
}: {
  label: string;
  signature?: string | null;
}) {
  if (!signature) {
    return <SignaturePlaceholder label={label} />;
  }

  return (
    <div className="flex flex-1 flex-wrap items-baseline gap-2">
      <span className="font-bold">{label}</span>
      <div className="flex h-[60px] min-w-[250px] flex-1 items-center border-b border-dotted border-black bg-[#fcfcfc] px-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL from signature pad */}
        <img
          src={signature}
          alt={`${label} signature`}
          className="max-h-[55px] max-w-full object-contain object-left"
        />
      </div>
    </div>
  );
}

export function DateDisplay({ date }: { date: string }) {
  return (
    <div className="flex flex-1 items-baseline gap-2">
      <span className="font-bold">Date:</span>
      <span className="inline-block border-b border-dotted border-black px-1">{date}</span>
    </div>
  );
}

export interface TripartiteApplicant {
  name: string;
  idNumber: string;
  passportNumber: string;
  signature?: string | null;
  acknowledgmentNumber?: string;
}

export interface TripartiteAgreementDocumentProps {
  migrantName: string;
  idNumber: string;
  passportNumber: string;
  migrantSignature?: string | null;
  /** Group applicants for PS signing dashboard section 3 layout. */
  applicants?: TripartiteApplicant[];
  /** When true with applicants, section 3 uses PS group signing layout. */
  psGroupSection3?: boolean;
  labourPsSignature?: string | null;
  labourPsSignedAt?: Date | string | null;
  msmePsSignature?: string | null;
  msmePsSignedAt?: Date | string | null;
  agreementDate?: string;
  readOnly?: boolean;
  onMigrantNameChange?: (name: string) => void;
}

const MIGRANT_RESPONSIBILITIES = (
  <ol className="list-roman mb-4 list-[lower-roman] pl-10">
    <li className="mb-2">
      Seeking and securing international employment opportunities through the Ministry of Labour and
      Social Protection or its Agencies.
    </li>
    <li className="mb-2">Expressing interest for funding under Wezesha Majuu Loan Product.</li>
    <li className="mb-2">
      Adhering to stipulated terms and conditions for loan application including cluster formation.
    </li>
    <li className="caution-clause mb-2 font-bold">
      Adhering to the stipulated loan repayment terms, failure to which, I commit to be repatriated,
      arrested and recovery measures initiated upon me.
    </li>
    <li className="mb-2">Participating in pre-departure training and orientation.</li>
    <li className="mb-2">Providing feedback on program effectiveness.</li>
    <li className="mb-2">
      Providing the required information and sharing success stories and experiences.
    </li>
  </ol>
);

function MigrantIdentityBlock({
  name,
  idNumber,
  passportNumber,
}: {
  name: string;
  idNumber: string;
  passportNumber: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline gap-x-1 gap-y-2">
      <span>I</span>
      <span className="inline-block min-w-[300px] border-b border-dotted border-black px-1">
        {name}
      </span>
      <span>ID No</span>
      <span className="inline-block w-[120px] border-b border-dotted border-black px-1">
        {idNumber}
      </span>
      <span>Passport no.</span>
      <span className="inline-block w-[150px] border-b border-dotted border-black px-1">
        {passportNumber}
      </span>
      <span>is responsible for;</span>
    </div>
  );
}

function MigrantSignBlock({
  applicant,
  agreementDate,
}: {
  applicant: TripartiteApplicant;
  agreementDate: string;
}) {
  return (
    <div className="mt-6">
      <div className="sig-row flex flex-wrap justify-between gap-4">
        <SignatureDisplay label="Sign:" signature={applicant.signature} />
        <DateDisplay date={agreementDate} />
      </div>
      <div className="sig-row mt-4 flex flex-wrap gap-4">
        <div className="flex flex-1 flex-wrap items-baseline gap-2">
          <span className="font-bold">Name of the Migrant Worker:</span>
          <span className="inline-block min-w-[350px] border-b border-dotted border-black px-1">
            {applicant.name || '__________________________'}
          </span>
        </div>
      </div>
    </div>
  );
}

function PsGroupSection3({
  applicants,
  agreementDate,
}: {
  applicants: TripartiteApplicant[];
  agreementDate: string;
}) {
  const [primary, ...additional] = applicants;

  return (
    <>
      {primary ? (
        <>
          <MigrantIdentityBlock
            name={primary.name}
            idNumber={primary.idNumber}
            passportNumber={primary.passportNumber}
          />
          {MIGRANT_RESPONSIBILITIES}
          <MigrantSignBlock applicant={primary} agreementDate={agreementDate} />
        </>
      ) : null}

      {additional.length > 0 ? (
        <div className="mt-8">
          <p className="mb-4 font-bold uppercase">Other names whom the PS has not signed</p>
          {additional.map((applicant, index) => (
            <MigrantSignBlock
              key={`${applicant.idNumber}-${index}`}
              applicant={applicant}
              agreementDate={agreementDate}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export const TripartiteAgreementDocument: FC<TripartiteAgreementDocumentProps> = ({
  migrantName,
  idNumber,
  passportNumber,
  migrantSignature = null,
  applicants,
  psGroupSection3 = false,
  labourPsSignature = null,
  labourPsSignedAt = null,
  msmePsSignature = null,
  msmePsSignedAt = null,
  agreementDate,
  readOnly = false,
  onMigrantNameChange,
}) => {
  const currentDate = agreementDate ?? formatAgreementDate(new Date());
  const labourDate = labourPsSignedAt
    ? formatAgreementDate(labourPsSignedAt)
    : currentDate;
  const msmeDate = msmePsSignedAt ? formatAgreementDate(msmePsSignedAt) : currentDate;

  return (
    <div
      className={cn(
        'agreement-paper border border-neutral-200 bg-white p-6 text-black sm:p-10',
        '[&_input.doc-input]:mb-0 [&_input.doc-input]:inline-block [&_input.doc-input]:w-auto',
        '[&_input.doc-input]:rounded-none [&_input.doc-input]:border-0 [&_input.doc-input]:border-b',
        '[&_input.doc-input]:border-dotted [&_input.doc-input]:border-black [&_input.doc-input]:bg-transparent',
        '[&_input.doc-input]:px-1 [&_input.doc-input]:py-0 [&_input.doc-input]:text-[12pt]',
        '[&_input.doc-input]:focus:border-solid [&_input.doc-input]:focus:border-primary [&_input.doc-input]:focus:outline-none',
      )}
      style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '12pt', lineHeight: 1.6 }}
    >
      <div className="mb-2 text-center">
        <Image
          src="/images/coa.png"
          alt="Coat of Arms"
          width={100}
          height={100}
          className="mx-auto h-auto w-[100px]"
        />
      </div>

      <div className="agreement-header text-center font-bold uppercase">
        <p>REPUBLIC OF KENYA</p>
        <p>
          MINISTRY OF LABOUR AND SOCIAL PROTECTION, STATE DEPARTMENT FOR LABOUR AND SKILLS
          DEVELOPMENT
        </p>
        <p className="my-2">AND</p>
        <p>
          MINISTRY OF COOPERATIVES AND MICRO SMALL AND MEDIUM ENTERPRISES DEVELOPMENT, STATE
          DEPARTMENT OF MICRO SMALL AND MEDIUM ENTERPRISES DEVELOPMENT
        </p>
      </div>

      <div className="agreement-title my-5 text-center font-bold underline">
        TRIPARTITE AGREEMENT FOR WEZESHA MAJUU LOAN PRODUCT
      </div>

      <p className="italic">
        This is a tripartite agreement between the Ministry of Labour and Social Protection, Ministry
        of Cooperatives and Micro Small and Medium Enterprises Development and Labour Migrants.
      </p>

      <span className="agreement-section-title mb-2 mt-6 block font-bold underline">
        1. THE MINISTRY OF LABOUR AND SOCIAL PROTECTION
      </span>
      <p>The Ministry of Labour and Social Protection commits to undertake the following;</p>
      <ol className="list-roman mb-4 list-[lower-roman] pl-10">
        <li className="mb-2">
          Overseeing the overall implementation of the Wezesha Majuu Programme, and ensuring
          alignment with National and International Labour laws and policies.
        </li>
        <li className="mb-2">
          Coordinate engagements with international and local partners, facilitates inter-ministerial
          and inter-agency coordination, leads communication and advocacy efforts, approves key
          program decisions, and monitors program performance and impact.
        </li>
        <li className="mb-2">
          They also facilitate labour mobility and international job placements, handle labour-related
          disputes, provide labour market information, develop and implement labor mobility
          policies.
        </li>
        <li className="mb-2">
          Facilitate recruitment of prospective Migrant Workers for the programme, verify the job
          opportunities and provide attestation of the contracts.
        </li>
        <li className="mb-2">
          Provide reasonable assurance to the Fund for the repayment of the funds on-lent to the
          prospective migrant workers.
        </li>
      </ol>

      <div className="sig-row mt-5 flex flex-wrap justify-between gap-4">
        <SignatureDisplay label="Sign:" signature={labourPsSignature} />
        <DateDisplay date={labourDate} />
      </div>
      <p className="role-title mt-1 font-bold italic">
        Principal Secretary State Department for Labour and Skills Development
      </p>

      <span className="agreement-section-title mb-2 mt-6 block font-bold underline">
        2. THE MINISTRY OF COOPERATIVES AND MICRO SMALL AND MEDIUM ENTERPRISES DEVELOPMENT
      </span>
      <p>
        The Ministry of Cooperatives and Micro Small and Medium Enterprises Development through Uwezo
        Fund shall be the Financier
        of the <em>Wezesha Majuu</em> loan product. In performing this function, the Fund shall
        commit to undertake the following;
      </p>
      <ol className="list-roman mb-4 list-[lower-roman] pl-10">
        <li className="mb-2">Allocate the budget for the Labour Mobility Loan.</li>
        <li className="mb-2">Receive and process loan applications.</li>
        <li className="mb-2">Disburse approved loans to individual members within the clusters.</li>
        <li className="mb-2">
          In liaison with MSEA, cluster the groups accordingly in order to access funding.
        </li>
        <li className="mb-2">
          Structure loan repayment plan and commit prospective migrant workers in liaison with the
          Ministry of Labour and Social Protection.
        </li>
        <li className="mb-2">
          Track and report on the program performance, document and share success stories of
          beneficiaries.
        </li>
      </ol>

      <div className="sig-row mt-5 flex flex-wrap justify-between gap-4">
        <SignatureDisplay label="Sign:" signature={msmePsSignature} />
        <DateDisplay date={msmeDate} />
      </div>
      <p className="role-title mt-1 font-bold italic">
        Principal Secretary State Department for Micro Small and Medium Enterprise Development
      </p>

      <span className="agreement-section-title mb-2 mt-6 block font-bold underline">
        3. LABOUR MIGRANTS
      </span>
      {psGroupSection3 && applicants && applicants.length > 0 ? (
        <PsGroupSection3 applicants={applicants} agreementDate={currentDate} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-1 gap-y-2">
            <span>I</span>
            {readOnly ? (
              <>
                <span className="inline-block min-w-[300px] border-b border-dotted border-black px-1">
                  {migrantName}
                </span>
                <span>ID No</span>
                <span className="inline-block w-[120px] border-b border-dotted border-black px-1">
                  {idNumber}
                </span>
                <span>Passport no.</span>
                <span className="inline-block w-[150px] border-b border-dotted border-black px-1">
                  {passportNumber}
                </span>
              </>
            ) : (
              <>
                <input
                  type="text"
                  name="migrantName"
                  placeholder="Full Name"
                  defaultValue={migrantName}
                  onChange={(event) => onMigrantNameChange?.(event.target.value)}
                  required
                  className="doc-input min-w-[300px]"
                />
                <span>ID No</span>
                <input
                  type="text"
                  name="idNumber"
                  defaultValue={idNumber}
                  required
                  className="doc-input w-[120px]"
                />
                <span>Passport no.</span>
                <input
                  type="text"
                  name="passportNumber"
                  defaultValue={passportNumber}
                  required
                  className="doc-input w-[150px]"
                />
              </>
            )}
            <span>is responsible for;</span>
          </div>

          {MIGRANT_RESPONSIBILITIES}

          <div className="sig-row mt-8 flex flex-wrap justify-between gap-4">
            <SignatureDisplay label="Sign:" signature={migrantSignature} />
            <DateDisplay date={currentDate} />
          </div>

          <div className="sig-row mt-4 flex flex-wrap gap-4">
            <div className="flex flex-1 flex-wrap items-baseline gap-2">
              <span className="font-bold">Name of the Migrant Worker:</span>
              <span className="inline-block min-w-[350px] border-b border-dotted border-black px-1">
                {migrantName || '__________________________'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
