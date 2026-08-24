'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import {
  FILE_ACCEPT,
  MAX_FILE_SIZE,
  MAX_MEMBER_DOCUMENT_FILES,
  MEMBER_DOCUMENT_ACCEPT,
} from '@/lib/constants';
import { GROUP_DOCUMENT_CATEGORIES, memberStorageToken } from '@/lib/group-document-categories';
import { submitDocumentsAction } from './documents-action';
import { DocumentCompletenessBanner } from '@/components/document-completeness-banner';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { formatBytes } from '@workspace/ui/lib/utils';
import {
  useCallback,
  useMemo,
  useState,
  type FC,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { z } from 'zod';

const documentsSchema = z.object({});

interface DocumentMember {
  id: string;
  name: string;
  idNo: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  category: string;
  storagePath: string;
}

interface DocumentsFormProps {
  id: string;
  members: DocumentMember[];
  initialDocuments: UploadedDocument[];
}

function filterMemberDocuments(
  documents: UploadedDocument[],
  category: string,
  memberIdNo: string,
) {
  const token = memberStorageToken(memberIdNo);
  return documents.filter(
    (document) => document.category === category && document.storagePath.includes(token),
  );
}

const GroupDocumentUploadField: FC<{
  applicationId: string;
  category: string;
  memberId?: string;
  label: string;
  accept: typeof FILE_ACCEPT | typeof MEMBER_DOCUMENT_ACCEPT;
  required?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  description?: string;
  documents: UploadedDocument[];
  memberIdNo?: string;
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  error?: string[];
}> = ({
  applicationId,
  category,
  memberId,
  label,
  accept,
  required = false,
  multiple = false,
  maxFiles,
  description,
  documents,
  memberIdNo,
  onDocumentsChange,
  error,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fieldDocuments = useMemo(() => {
    if (memberIdNo) {
      return filterMemberDocuments(documents, category, memberIdNo);
    }

    return documents.filter((document) => document.category === category);
  }, [documents, category, memberIdNo]);

  const effectiveMaxFiles = multiple ? maxFiles : 1;
  const atLimit = effectiveMaxFiles ? fieldDocuments.length >= effectiveMaxFiles : false;

  const uploadFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('applicationId', applicationId);
        formData.append('category', category);
        if (memberId) {
          formData.append('memberId', memberId);
        }

        const response = await fetch('/api/group-documents/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        onDocumentsChange([...documents, result.document]);
      } catch (uploadFailure) {
        const message =
          uploadFailure instanceof Error ? uploadFailure.message : 'Upload failed';
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [applicationId, category, memberId, documents, onDocumentsChange],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length || atLimit) {
        return;
      }

      const files = Array.from(fileList);
      const filesToUpload = multiple ? files : files.slice(0, 1);

      for (const file of filesToUpload) {
        if (effectiveMaxFiles && fieldDocuments.length >= effectiveMaxFiles) {
          break;
        }

        await uploadFile(file);
      }
    },
    [atLimit, effectiveMaxFiles, fieldDocuments.length, multiple, uploadFile],
  );

  const handleDelete = useCallback(
    async (documentId: string) => {
      setUploadError(null);
      setDeletingId(documentId);

      try {
        const response = await fetch(
          `/api/group-documents/${documentId}?applicationId=${encodeURIComponent(applicationId)}`,
          { method: 'DELETE' },
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Delete failed');
        }

        onDocumentsChange(documents.filter((document) => document.id !== documentId));
      } catch (deleteFailure) {
        const message =
          deleteFailure instanceof Error ? deleteFailure.message : 'Delete failed';
        setUploadError(message);
      } finally {
        setDeletingId(null);
      }
    },
    [applicationId, documents, onDocumentsChange],
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(event.target.files);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  };

  const acceptAttr = Object.entries(accept)
    .flatMap(([mimeType, extensions]) => [mimeType, ...(extensions ?? [])])
    .join(',');

  return (
    <div className="space-y-2">
      <label className="typo-body-medium block font-medium text-neutral-900">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>

      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center transition hover:border-neutral-400 ${atLimit || isUploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input
          type="file"
          className="sr-only"
          accept={acceptAttr}
          multiple={multiple}
          disabled={atLimit || isUploading}
          onChange={onInputChange}
        />
        <span className="typo-body-medium text-neutral-700">
          {isUploading ? 'Uploading...' : 'Choose file or drag and drop'}
        </span>
        <span className="typo-body-small mt-1 text-neutral-500">
          {description ??
            `Accepted formats: JPG, PNG, or PDF. Max file size ${formatBytes(MAX_FILE_SIZE)}.`}
        </span>
      </label>

      {fieldDocuments.length > 0 ? (
        <ul className="space-y-2">
          {fieldDocuments.map((document) => (
            <li
              key={document.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <span className="typo-body-small truncate text-neutral-800">{document.fileName}</span>
              <button
                type="button"
                className="typo-body-small text-red-600 hover:text-red-800 disabled:opacity-50"
                disabled={deletingId === document.id || isUploading}
                onClick={() => void handleDelete(document.id)}
              >
                {deletingId === document.id ? 'Removing...' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {uploadError ? <p className="typo-body-small text-red-600">{uploadError}</p> : null}
      {error?.length ? <p className="typo-body-small text-red-600">{error.join(', ')}</p> : null}
    </div>
  );
};

export const DocumentsForm: FC<DocumentsFormProps> = ({ id, members, initialDocuments }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>(initialDocuments);
  const action = submitDocumentsAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, documentsSchema, {});

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Upload Group Documents">
          <p className="typo-body-medium mb-6 text-neutral-700">
            Ensure all documents are in PDF or image format. Files upload immediately when
            selected, so you can submit once every required document is listed below.
          </p>

          <div className="space-y-4">
            <GroupDocumentUploadField
              applicationId={id}
              category={GROUP_DOCUMENT_CATEGORIES.kraPin}
              label="KRA PIN Certificate (Group)"
              accept={FILE_ACCEPT}
              required
              documents={documents}
              onDocumentsChange={setDocuments}
              error={state?.errors?.kraPin}
            />

            <GroupDocumentUploadField
              applicationId={id}
              category={GROUP_DOCUMENT_CATEGORIES.registrationCert}
              label="Registration Certificate"
              accept={FILE_ACCEPT}
              required
              documents={documents}
              onDocumentsChange={setDocuments}
              error={state?.errors?.registrationCert}
            />

            <GroupDocumentUploadField
              applicationId={id}
              category={GROUP_DOCUMENT_CATEGORIES.expressionOfInterest}
              label="Expression of Interest (PDF/JPEG)"
              accept={MEMBER_DOCUMENT_ACCEPT}
              required
              multiple
              documents={documents}
              onDocumentsChange={setDocuments}
              error={state?.errors?.expressionOfInterest}
              description="You can upload multiple PDF or JPEG files."
            />
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="typo-body-medium font-bold">Member Documents (ID, Passport, PIN)</h3>

            {members.map((member) => (
              <div
                key={member.id}
                className="space-y-4 rounded-xl border border-neutral-300 bg-neutral-50 p-4"
              >
                <h4 className="typo-body-medium font-bold">{member.name}</h4>

                <Field
                  name={`memberIdNo_${member.id}`}
                  label="ID Number"
                  control={() => (
                    <Input value={member.idNo} readOnly disabled className="bg-background" />
                  )}
                />

                <GroupDocumentUploadField
                  applicationId={id}
                  category={GROUP_DOCUMENT_CATEGORIES.memberId}
                  memberId={member.id}
                  memberIdNo={member.idNo}
                  label="National ID (photo or scan)"
                  accept={MEMBER_DOCUMENT_ACCEPT}
                  required
                  multiple
                  maxFiles={MAX_MEMBER_DOCUMENT_FILES}
                  documents={documents}
                  onDocumentsChange={setDocuments}
                  error={state?.errors?.[`memberId_${member.id}`]}
                  description={`Upload 1–${MAX_MEMBER_DOCUMENT_FILES} JPG, PNG, or PDF pages of the member's ID.`}
                />

                <GroupDocumentUploadField
                  applicationId={id}
                  category={GROUP_DOCUMENT_CATEGORIES.memberPassport}
                  memberId={member.id}
                  memberIdNo={member.idNo}
                  label="Passport"
                  accept={MEMBER_DOCUMENT_ACCEPT}
                  required
                  multiple
                  maxFiles={MAX_MEMBER_DOCUMENT_FILES}
                  documents={documents}
                  onDocumentsChange={setDocuments}
                  error={state?.errors?.[`memberPassport_${member.id}`]}
                  description={`Upload 1–${MAX_MEMBER_DOCUMENT_FILES} JPG, PNG, or PDF pages of the passport.`}
                />

                <GroupDocumentUploadField
                  applicationId={id}
                  category={GROUP_DOCUMENT_CATEGORIES.memberPin}
                  memberId={member.id}
                  memberIdNo={member.idNo}
                  label="KRA PIN Certificate"
                  accept={FILE_ACCEPT}
                  required
                  documents={documents}
                  onDocumentsChange={setDocuments}
                  error={state?.errors?.[`memberPin_${member.id}`]}
                />
              </div>
            ))}
          </div>

          <DocumentCompletenessBanner
            messages={Object.values(state?.errors ?? {}).flat().filter(Boolean) as string[]}
          />
          {state?.errors?.form ? (
            <p className="typo-body-medium mt-4 text-red-600">{state.errors.form.join(', ')}</p>
          ) : null}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/guarantee`}
        disabled={isPending}
        submitLabel="Submit Group Application"
      />
    </Form>
  );
};
