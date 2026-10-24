'use client';

import { FILE_ACCEPT, MAX_FILE_SIZE } from '@/lib/constants';
import { formatBytes } from '@workspace/ui/lib/utils';
import { useState, type ChangeEvent, type DragEvent, type FC } from 'react';

export interface PassportBiodataDocument {
  id: string;
  fileName: string;
}

export const PassportBiodataUpload: FC<{
  memberId: string;
  initialDocument?: PassportBiodataDocument | null;
  error?: string[];
}> = ({ memberId, initialDocument, error }) => {
  const [document, setDocument] = useState<PassportBiodataDocument | null>(
    initialDocument ?? null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const acceptAttr = Object.entries(FILE_ACCEPT)
    .flatMap(([mimeType, extensions]) => [mimeType, ...(extensions ?? [])])
    .join(',');

  async function upload(file: File) {
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('memberId', memberId);
      const response = await fetch('/api/individual-documents/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      setDocument(result.document);
    } catch (failure) {
      setUploadError(failure instanceof Error ? failure.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function remove() {
    if (!document) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const response = await fetch(
        `/api/individual-documents/${document.id}?memberId=${encodeURIComponent(memberId)}`,
        { method: 'DELETE' },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }
      setDocument(null);
    } catch (failure) {
      setUploadError(failure instanceof Error ? failure.message : 'Delete failed');
    } finally {
      setIsUploading(false);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void upload(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <p className="typo-body-medium font-medium text-neutral-900">
        Passport biodata page <span className="text-red-600">*</span>
      </p>
      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center ${document || isUploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input
          type="file"
          className="sr-only"
          accept={acceptAttr}
          disabled={Boolean(document) || isUploading}
          onChange={onInputChange}
        />
        <span className="typo-body-medium text-neutral-700">
          {isUploading ? 'Uploading...' : 'Choose file or drag and drop'}
        </span>
        <span className="typo-body-small mt-1 text-neutral-500">
          Upload the passport biodata page. JPG, PNG, or PDF. Max file size {formatBytes(MAX_FILE_SIZE)}.
        </span>
      </label>
      {document ? (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
          <span className="typo-body-small truncate text-neutral-800">{document.fileName}</span>
          <button
            type="button"
            className="typo-body-small text-red-600 hover:text-red-800 disabled:opacity-50"
            disabled={isUploading}
            onClick={() => void remove()}
          >
            Remove
          </button>
        </div>
      ) : null}
      {uploadError ? <p className="typo-body-small text-red-600">{uploadError}</p> : null}
      {error?.length ? <p className="typo-body-small text-red-600">{error.join(', ')}</p> : null}
    </div>
  );
};
