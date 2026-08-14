'use client';

import type { FC } from 'react';

export type TripartiteReadinessItem = {
  key: string;
  label: string;
  ok: boolean;
};

export const TripartiteReadinessChecklist: FC<{
  items: TripartiteReadinessItem[];
  title?: string;
}> = ({ items, title = 'Tripartite readiness checklist' }) => {
  if (!items.length) {
    return null;
  }

  const missing = items.filter((item) => !item.ok);

  return (
    <div
      role="status"
      className={`mb-4 rounded-md border px-4 py-3 text-sm ${
        missing.length
          ? 'border-amber-300 bg-amber-50 text-amber-950'
          : 'border-emerald-300 bg-emerald-50 text-emerald-950'
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-xs opacity-90">
        Assistive checklist only — does not auto-approve or auto-sign.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item.key} className={item.ok ? '' : 'font-medium'}>
            {item.ok ? '✓' : '✗'} {item.label}
          </li>
        ))}
      </ul>
      {missing.length > 0 ? (
        <p className="mt-2 text-xs">
          Resolve the items marked incomplete before you rely on a download or final signature.
        </p>
      ) : null}
    </div>
  );
};
