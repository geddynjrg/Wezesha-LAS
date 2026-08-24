'use client';

import type { FC } from 'react';

export const DocumentCompletenessBanner: FC<{
  messages: string[];
  title?: string;
}> = ({ messages, title = 'Documents incomplete' }) => {
  if (!messages.length) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-800">
        Upload every required document before submit. No personal identifiers are shown beyond what you already entered.
      </p>
    </div>
  );
};
