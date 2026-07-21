'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { submitTripartiteAction } from './tripartite-action';
import { tripartiteFormSchema } from './tripartite-schema';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import Image from 'next/image';
import { type FC, useMemo, useState } from 'react';

interface TripartiteFormProps {
  memberId: string;
  defaultMigrantName: string;
  defaultIdNumber: string;
  defaultPassportNumber: string;
  defaultAccepted?: boolean;
  migrantSignature?: string | null;
}

function formatAgreementDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function SignaturePlaceholder({ label }: { label: string }) {
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

function MigrantSignatureField({ signature }: { signature?: string | null }) {
  if (!signature) {
    return <SignaturePlaceholder label="Sign:" />;
  }

  return (
    <div className="flex flex-1 flex-wrap items-baseline gap-2">
      <span className="font-bold">Sign:</span>
      <div className="flex h-[60px] min-w-[250px] flex-1 items-center border-b border-dotted border-black bg-[#fcfcfc] px-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL from signature pad */}
        <img
          src={signature}
          alt="Migrant worker signature"
          className="max-h-[55px] max-w-full object-contain object-left"
        />
      </div>
    </div>
  );
}

function DatePlaceholder({ date }: { date: string }) {
  return (
    <div className="flex flex-1 items-baseline gap-2">
      <span className="font-bold">Date:</span>
      <span className="inline-block border-b border-dotted border-black px-1">{date}</span>
    </div>
  );
}

export const TripartiteForm: FC<TripartiteFormProps> = ({
  memberId,
  defaultMigrantName,
  defaultIdNumber,
  defaultPassportNumber,
  defaultAccepted = false,
  migrantSignature = null,
}) => {
  const currentDate = useMemo(() => formatAgreementDate(new Date()), []);
  const [migrantName, setMigrantName] = useState(defaultMigrantName);
  const action = submitTripartiteAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, tripartiteFormSchema, {
    migrantName: defaultMigrantName,
    idNumber: defaultIdNumber,
    passportNumber: defaultPassportNumber,
    ...(defaultAccepted ? { tripartiteAccepted: 'on' as const } : {}),
  });

  return (
    <Form action={formAction}>
      <Container className="py-8">
        <FormCard title="Tripartite Agreement">
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
                MINISTRY OF COOPERATIVES AND MSMEs DEVELOPMENT, STATE DEPARTMENT OF MSMEs
                DEVELOPMENT
              </p>
            </div>

            <div className="agreement-title my-5 text-center font-bold underline">
              TRIPARTITE AGREEMENT FOR WEZESHA MAJUU LOAN PRODUCT
            </div>

            <p className="italic">
              This is a tripartite agreement between the Ministry of Labour and Social Protection,
              Ministry of Cooperatives and MSMEs Development and Labour Migrants.
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
                Coordinate engagements with international and local partners, facilitates
                inter-ministerial and inter-agency coordination, leads communication and advocacy
                efforts, approves key program decisions, and monitors program performance and impact.
              </li>
              <li className="mb-2">
                They also facilitate labour mobility and international job placements, handle
                labour-related disputes, provide labour market information, develop and implement
                labor mobility policies.
              </li>
              <li className="mb-2">
                Facilitate recruitment of prospective Migrant Workers for the programme, verify the
                job opportunities and provide attestation of the contracts.
              </li>
              <li className="mb-2">
                Provide reasonable assurance to the Fund for the repayment of the funds on-lent to
                the prospective migrant workers.
              </li>
            </ol>

            <div className="sig-row mt-5 flex flex-wrap justify-between gap-4">
              <SignaturePlaceholder label="Sign:" />
              <DatePlaceholder date={currentDate} />
            </div>
            <p className="role-title mt-1 font-bold italic">
              Principal Secretary State Department for Labour and Skills Development
            </p>

            <span className="agreement-section-title mb-2 mt-6 block font-bold underline">
              2. THE MINISTRY OF COOPERATIVES AND MSMEs DEVELOPMENT
            </span>
            <p>
              The Ministry of Cooperatives and MSMEs Development through Uwezo Fund shall be the
              Financier of the <em>Wezesha Majuu</em> loan product. In performing this function,
              the Fund shall commit to undertake the following;
            </p>
            <ol className="list-roman mb-4 list-[lower-roman] pl-10">
              <li className="mb-2">Allocate the budget for the Labour Mobility Loan.</li>
              <li className="mb-2">Receive and process loan applications.</li>
              <li className="mb-2">Disburse approved loans to individual members within the clusters.</li>
              <li className="mb-2">
                In liaison with MSEA, cluster the groups accordingly in order to access funding.
              </li>
              <li className="mb-2">
                Structure loan repayment plan and commit prospective migrant workers in liaison with
                the Ministry of Labour and Social Protection.
              </li>
              <li className="mb-2">
                Track and report on the program performance, document and share success stories of
                beneficiaries.
              </li>
            </ol>

            <div className="sig-row mt-5 flex flex-wrap justify-between gap-4">
              <SignaturePlaceholder label="Sign:" />
              <DatePlaceholder date={currentDate} />
            </div>
            <p className="role-title mt-1 font-bold italic">
              Principal Secretary State Department for MSME Development
            </p>

            <span className="agreement-section-title mb-2 mt-6 block font-bold underline">
              3. LABOUR MIGRANTS
            </span>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-1 gap-y-2">
              <span>I</span>
              <input
                type="text"
                name="migrantName"
                placeholder="Full Name"
                defaultValue={defaultMigrantName}
                onChange={(event) => setMigrantName(event.target.value)}
                required
                className="doc-input min-w-[300px]"
              />
              <span>ID No</span>
              <input
                type="text"
                name="idNumber"
                defaultValue={defaultIdNumber}
                required
                className="doc-input w-[120px]"
              />
              <span>Passport no.</span>
              <input
                type="text"
                name="passportNumber"
                defaultValue={defaultPassportNumber}
                required
                className="doc-input w-[150px]"
              />
              <span>is responsible for;</span>
            </div>
            {(state.errors?.migrantName ||
              state.errors?.idNumber ||
              state.errors?.passportNumber) && (
              <div className="mb-4 space-y-1 text-sm text-destructive">
                {state.errors.migrantName?.[0] ? <p>{state.errors.migrantName[0]}</p> : null}
                {state.errors.idNumber?.[0] ? <p>{state.errors.idNumber[0]}</p> : null}
                {state.errors.passportNumber?.[0] ? <p>{state.errors.passportNumber[0]}</p> : null}
              </div>
            )}

            <ol className="list-roman mb-4 list-[lower-roman] pl-10">
              <li className="mb-2">
                Seeking and securing international employment opportunities through the Ministry of
                Labour and Social Protection or its Agencies.
              </li>
              <li className="mb-2">
                Expressing interest for funding under Wezesha Majuu Loan Product.
              </li>
              <li className="mb-2">
                Adhering to stipulated terms and conditions for loan application including cluster
                formation.
              </li>
              <li className="caution-clause mb-2 font-bold">
                Adhering to the stipulated loan repayment terms, failure to which, I commit to be
                repatriated, arrested and recovery measures initiated upon me.
              </li>
              <li className="mb-2">Participating in pre-departure training and orientation.</li>
              <li className="mb-2">Providing feedback on program effectiveness.</li>
              <li className="mb-2">
                Providing the required information and sharing success stories and experiences.
              </li>
            </ol>

            <div className="sig-row mt-8 flex flex-wrap justify-between gap-4">
              <MigrantSignatureField signature={migrantSignature} />
              <DatePlaceholder date={currentDate} />
            </div>

            <div className="sig-row mt-4 flex flex-wrap gap-4">
              <div className="flex flex-1 flex-wrap items-baseline gap-2">
                <span className="font-bold">Name of the Migrant Worker:</span>
                <span className="inline-block min-w-[350px] border-b border-dotted border-black px-1">
                  {migrantName || '__________________________'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="typo-body-medium flex items-start gap-3 rounded-xl border border-neutral-300 bg-background p-4">
              <input
                type="checkbox"
                name="tripartiteAccepted"
                defaultChecked={defaultAccepted}
                required
                className="mt-1 size-4 accent-primary"
              />
              <span>
                I have read and accept the tripartite agreement between the Ministry of Labour and
                Social Protection, State Department for Labour and Skills Development; the Ministry
                of Cooperatives and MSMEs Development, State Department of MSMEs Development; and
                the labour migrant for the Wezesha Majuu programme.
              </span>
            </label>
            {state.errors?.tripartiteAccepted ? (
              <p className="text-sm text-destructive">{state.errors.tripartiteAccepted[0]}</p>
            ) : null}
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/individual/${memberId}/signature`}
        submitLabel="Submit Individual Application"
        disabled={isPending}
      />
    </Form>
  );
};
