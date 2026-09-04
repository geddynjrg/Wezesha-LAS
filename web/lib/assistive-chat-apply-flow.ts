import {
  getGroupApplication,
  getUserGroupApplications,
  getUserIndividualMemberships,
  updateGroupProgress,
} from '@/lib/data/applications';
import {
  getGroupApplicationUrl,
  GROUP_STEPS,
  INDIVIDUAL_STEPS,
} from '@/lib/constants/majuu-steps';
import type { ChatQuickReply } from '@/lib/assistive-chat-guidance';
import { prisma } from '@/lib/prisma';

export type ApplyFlowResult = {
  reply: string;
  quickReplies: ChatQuickReply[];
  phase?: string;
  openUrl?: string;
  navigate?: boolean;
  expectFieldValue?: boolean;
  expectUpload?: boolean;
  fieldContext?: {
    kind: 'group' | 'individual';
    appId: string;
    stage: number;
    field: string;
    label: string;
    uploadCategory?: string;
  };
};

type FieldKind = 'text' | 'number' | 'date' | 'bool' | 'upload';

type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  uploadCategory?: string;
};

const GROUP_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { key: 'groupName', label: 'Group name', kind: 'text' },
    { key: 'registrationNumber', label: 'Registration number', kind: 'text' },
    { key: 'registrationDate', label: 'Registration date (YYYY-MM-DD)', kind: 'date' },
    { key: 'county', label: 'County', kind: 'text' },
    { key: 'constituency', label: 'Constituency', kind: 'text' },
    { key: 'ward', label: 'Ward', kind: 'text' },
    { key: 'location', label: 'Location', kind: 'text' },
    { key: 'subLocation', label: 'Sub-location', kind: 'text' },
    { key: 'clusterCategory', label: 'Cluster category', kind: 'text' },
  ],
  2: [
    { key: 'totalMales', label: 'Total males', kind: 'number' },
    { key: 'totalFemales', label: 'Total females', kind: 'number' },
    { key: 'totalDisabledMales', label: 'Disabled males', kind: 'number' },
    { key: 'totalDisabledFemales', label: 'Disabled females', kind: 'number' },
  ],
  3: [
    { key: 'purpose', label: 'Purpose of the group', kind: 'text' },
    { key: 'proposedActivities', label: 'Proposed activities', kind: 'text' },
  ],
  4: [],
  5: [],
  6: [{ key: 'termsAccepted', label: 'Accept terms (type yes)', kind: 'bool' }],
  7: [
    { key: 'bankName', label: 'Bank name', kind: 'text' },
    { key: 'branchName', label: 'Branch name', kind: 'text' },
    { key: 'accountName', label: 'Account name', kind: 'text' },
    { key: 'accountNumber', label: 'Account number', kind: 'text' },
  ],
  8: [],
  9: [
    {
      key: 'group-certificate',
      label: 'Group registration certificate',
      kind: 'upload',
      uploadCategory: 'group-certificate',
    },
    {
      key: 'group-kra',
      label: 'Group KRA PIN certificate',
      kind: 'upload',
      uploadCategory: 'group-kra',
    },
    {
      key: 'group-bank-template',
      label: 'Bank details template',
      kind: 'upload',
      uploadCategory: 'group-bank-template',
    },
    {
      key: 'expression-of-interest',
      label: 'Expression of interest',
      kind: 'upload',
      uploadCategory: 'expression-of-interest',
    },
  ],
};

const INDIVIDUAL_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { key: 'fullName', label: 'Full name', kind: 'text' },
    { key: 'phone', label: 'Phone number', kind: 'text' },
    { key: 'email', label: 'Email', kind: 'text' },
    { key: 'idNumber', label: 'National ID number', kind: 'text' },
  ],
  2: [
    { key: 'county', label: 'County', kind: 'text' },
    { key: 'constituency', label: 'Constituency', kind: 'text' },
    { key: 'ward', label: 'Ward', kind: 'text' },
  ],
  6: [
    { key: 'bankName', label: 'Bank name', kind: 'text' },
    { key: 'branchName', label: 'Branch name', kind: 'text' },
    { key: 'accountName', label: 'Account name', kind: 'text' },
    { key: 'accountNumber', label: 'Account number', kind: 'text' },
  ],
};

function stageChipLabel(index: number, title: string, progress: number): string {
  const done = index < progress;
  const current = index === progress;
  const mark = done ? '✓' : current ? '▶' : '○';
  return `${mark} ${index}. ${title}${current ? ' (next)' : done ? ' (edit)' : ''}`;
}

async function assertOwnsGroup(userId: string, appId: string) {
  const groups = await getUserGroupApplications(userId);
  return groups.find((g) => g.id === appId) || null;
}

async function assertOwnsIndividual(userId: string, memberId: string) {
  const memberships = await getUserIndividualMemberships(userId);
  return memberships.find((m) => m.id === memberId) || null;
}

function navChips(
  kind: 'group' | 'individual',
  appId: string,
  stage?: number,
  href?: string,
): ChatQuickReply[] {
  const chips: ChatQuickReply[] = [];
  if (stage) {
    chips.push({
      id: 'back-stages',
      label: 'Back to stages',
      value: kind === 'group' ? `continue:${appId}` : `individual_continue:${appId}`,
    });
  }
  if (href) {
    chips.push({
      id: 'open-form',
      label: 'Open full form',
      value: `open:${href}`,
    });
  }
  chips.push({ id: 'menu', label: 'Back to menu', value: 'menu' });
  return chips;
}

export async function groupStagePicker(
  userId: string,
  appId: string,
): Promise<ApplyFlowResult> {
  const g = await assertOwnsGroup(userId, appId);
  if (!g) {
    return {
      reply: 'That group application was not found on your account.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const progress = Math.max(1, g.progress || 1);
  const name = g.groupData?.groupName?.trim() || 'Group application';
  const ordered = [...GROUP_STEPS].sort((a, b) => {
    const aInc = a.index >= progress ? 0 : 1;
    const bInc = b.index >= progress ? 0 : 1;
    if (aInc !== bInc) return aInc - bInc;
    return a.index - b.index;
  });
  const quickReplies: ChatQuickReply[] = ordered.map((s) => ({
    id: `stage-${s.index}`,
    label: stageChipLabel(s.index, s.title, progress),
    value: `stage:group:${appId}:${s.index}`,
  }));
  const href = getGroupApplicationUrl(g.id, g.progress, g.status);
  quickReplies.push(
    { id: 'open-next', label: 'Open next stage in form', value: `open:${href}` },
    { id: 'menu', label: 'Back to menu', value: 'menu' },
  );
  return {
    reply:
      `${name} (${g.acknowledgmentNumber}). Tap a stage to edit fields in chat.\n` +
      `Incomplete stages are listed first (▶ = next). You can also open completed stages to rectify.`,
    quickReplies,
    phase: 'stage_pick',
  };
}

export async function individualStagePicker(
  userId: string,
  memberId: string,
): Promise<ApplyFlowResult> {
  const m = await assertOwnsIndividual(userId, memberId);
  if (!m) {
    return {
      reply: 'That individual application was not found on your account.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const progress = Math.max(1, m.individualApplication?.progress || 1);
  const ordered = [...INDIVIDUAL_STEPS].sort((a, b) => {
    const aInc = a.index >= progress ? 0 : 1;
    const bInc = b.index >= progress ? 0 : 1;
    if (aInc !== bInc) return aInc - bInc;
    return a.index - b.index;
  });
  const quickReplies: ChatQuickReply[] = ordered.map((s) => ({
    id: `istage-${s.index}`,
    label: stageChipLabel(s.index, s.title, progress),
    value: `stage:individual:${memberId}:${s.index}`,
  }));
  const href = `/apply/individual/${memberId}${INDIVIDUAL_STEPS[progress - 1]?.path || '/dashboard'}`;
  quickReplies.push(
    { id: 'open-next', label: 'Open next stage in form', value: `open:${href}` },
    { id: 'dash', label: 'Open dashboard', value: `open:/apply/individual/${memberId}/dashboard` },
    { id: 'menu', label: 'Back to menu', value: 'menu' },
  );
  return {
    reply:
      `Individual application. Tap a stage to edit fields in chat.\n` +
      `Incomplete stages first; completed stages remain selectable to rectify.`,
    quickReplies,
    phase: 'stage_pick',
  };
}

function currentFieldValue(
  app: NonNullable<Awaited<ReturnType<typeof getGroupApplication>>>,
  stage: number,
  key: string,
): string | null {
  const gd = app.groupData;
  const mem = app.membership;
  const bg = app.background;
  const bank = app.bankAccount;
  switch (stage) {
    case 1:
      if (key === 'registrationDate' && gd?.registrationDate) {
        return gd.registrationDate.toISOString().slice(0, 10);
      }
      return (gd as Record<string, unknown> | null)?.[key] != null
        ? String((gd as Record<string, unknown>)[key] ?? '')
        : null;
    case 2:
      return mem && key in mem ? String((mem as Record<string, unknown>)[key] ?? '') : null;
    case 3:
      return bg && key in bg ? String((bg as Record<string, unknown>)[key] ?? '') : null;
    case 6:
      return app.termsAccepted ? 'yes' : null;
    case 7:
      return bank && key in bank
        ? String((bank as Record<string, unknown>)[key] ?? '')
        : null;
    case 9: {
      const docs = app.documents || [];
      const hit = docs.find((d) => d.category === key || d.category === key.replace(/_/g, '-'));
      return hit ? hit.fileName || 'uploaded' : null;
    }
    default:
      return null;
  }
}

export async function groupFieldPicker(
  userId: string,
  appId: string,
  stage: number,
): Promise<ApplyFlowResult> {
  const owned = await assertOwnsGroup(userId, appId);
  if (!owned) {
    return {
      reply: 'Application not found on your account.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const app = await getGroupApplication(appId);
  if (!app) {
    return {
      reply: 'Could not load application details.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const step = GROUP_STEPS.find((s) => s.index === stage);
  const href = `/apply/group/${appId}${step?.path || '/group-information'}`;
  const fields = GROUP_FIELDS[stage] || [];

  if (!fields.length) {
    return {
      reply:
        `${step?.title || `Stage ${stage}`} needs the full form (members, amounts, or signatures).\n` +
        `Open it to continue, or pick another stage.`,
      quickReplies: [
        { id: 'open', label: `Open ${step?.title || 'stage'}`, value: `open:${href}` },
        ...navChips('group', appId, stage),
      ],
      phase: 'field_pick',
      openUrl: href,
    };
  }

  const quickReplies: ChatQuickReply[] = fields.map((f) => {
    const cur = currentFieldValue(app, stage, f.key);
    const filled = Boolean(cur && String(cur).trim());
    const mark = f.kind === 'upload' ? (filled ? '📎✓' : '📎') : filled ? '✓' : '○';
    return {
      id: `f-${f.key}`,
      label: `${mark} ${f.label}${filled && f.kind !== 'upload' ? ` · ${String(cur).slice(0, 24)}` : ''}`,
      value: `field:group:${appId}:${stage}:${f.key}`,
    };
  });
  quickReplies.push(...navChips('group', appId, stage, href));

  return {
    reply: `Stage ${stage}: ${step?.title}. Tap a field to type a value, or an upload slot to attach a file.`,
    quickReplies,
    phase: 'field_pick',
  };
}

export async function individualFieldPicker(
  userId: string,
  memberId: string,
  stage: number,
): Promise<ApplyFlowResult> {
  const owned = await assertOwnsIndividual(userId, memberId);
  if (!owned) {
    return {
      reply: 'Individual application not found on your account.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const step = INDIVIDUAL_STEPS.find((s) => s.index === stage);
  const href = `/apply/individual/${memberId}${step?.path || '/individual-information'}`;
  const fields = INDIVIDUAL_FIELDS[stage] || [];
  if (!fields.length) {
    return {
      reply: `${step?.title || `Stage ${stage}`} is best completed in the full form.`,
      quickReplies: [
        { id: 'open', label: `Open ${step?.title || 'stage'}`, value: `open:${href}` },
        ...navChips('individual', memberId, stage),
      ],
      phase: 'field_pick',
    };
  }

  const ind = await prisma.individualApplication.findUnique({
    where: { memberId },
    include: { location: true, bankAccount: true, member: true },
  });

  const quickReplies: ChatQuickReply[] = fields.map((f) => {
    let cur: string | null = null;
    if (stage === 1) {
      const map: Record<string, string | null | undefined> = {
        fullName: ind?.member?.name,
        phone: ind?.member?.mobile,
        email: ind?.member?.email,
        idNumber: ind?.member?.idNo,
      };
      cur = map[f.key] || null;
    } else if (stage === 2 && ind?.location) {
      cur =
        String((ind.location as Record<string, unknown>)[f.key] ?? '').trim() ||
        null;
    } else if (stage === 6 && ind?.bankAccount) {
      cur =
        String(
          (ind.bankAccount as Record<string, unknown>)[f.key] ?? '',
        ).trim() || null;
    }
    const filled = Boolean(cur && cur.trim());
    return {
      id: `if-${f.key}`,
      label: `${filled ? '✓' : '○'} ${f.label}${filled ? ` · ${cur!.slice(0, 24)}` : ''}`,
      value: `field:individual:${memberId}:${stage}:${f.key}`,
    };
  });
  quickReplies.push(...navChips('individual', memberId, stage, href));

  return {
    reply: `Stage ${stage}: ${step?.title}. Tap a field to update it in chat.`,
    quickReplies,
    phase: 'field_pick',
  };
}

export async function beginFieldEdit(
  userId: string,
  kind: 'group' | 'individual',
  appId: string,
  stage: number,
  fieldKey: string,
): Promise<ApplyFlowResult> {
  if (kind === 'group') {
    const owned = await assertOwnsGroup(userId, appId);
    if (!owned) {
      return {
        reply: 'Application not found.',
        quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
      };
    }
    const fields = GROUP_FIELDS[stage] || [];
    const field = fields.find((f) => f.key === fieldKey);
    if (!field) {
      return groupFieldPicker(userId, appId, stage);
    }
    if (field.kind === 'upload') {
      return {
        reply: `Attach ${field.label} using the upload control below. The file is authenticity-checked then saved to this application.`,
        quickReplies: [
          {
            id: 'back',
            label: 'Back to fields',
            value: `stage:group:${appId}:${stage}`,
          },
          { id: 'menu', label: 'Back to menu', value: 'menu' },
        ],
        phase: 'await_upload',
        expectUpload: true,
        fieldContext: {
          kind: 'group',
          appId,
          stage,
          field: field.key,
          label: field.label,
          uploadCategory: field.uploadCategory || field.key,
        },
      };
    }
    const app = await getGroupApplication(appId);
    const cur = app ? currentFieldValue(app, stage, field.key) : null;
    return {
      reply:
        `Enter ${field.label}` +
        (cur ? ` (current: ${cur}).` : '.') +
        (field.kind === 'bool' ? ' Type yes to accept.' : ''),
      quickReplies: [
        {
          id: 'back',
          label: 'Back to fields',
          value: `stage:group:${appId}:${stage}`,
        },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
      phase: 'await_field',
      expectFieldValue: true,
      fieldContext: {
        kind: 'group',
        appId,
        stage,
        field: field.key,
        label: field.label,
      },
    };
  }

  const owned = await assertOwnsIndividual(userId, appId);
  if (!owned) {
    return {
      reply: 'Application not found.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const fields = INDIVIDUAL_FIELDS[stage] || [];
  const field = fields.find((f) => f.key === fieldKey);
  if (!field) {
    return individualFieldPicker(userId, appId, stage);
  }
  return {
    reply: `Enter ${field.label}.`,
    quickReplies: [
      {
        id: 'back',
        label: 'Back to fields',
        value: `stage:individual:${appId}:${stage}`,
      },
      { id: 'menu', label: 'Back to menu', value: 'menu' },
    ],
    phase: 'await_field',
    expectFieldValue: true,
    fieldContext: {
      kind: 'individual',
      appId,
      stage,
      field: field.key,
      label: field.label,
    },
  };
}

async function maybeBumpGroupProgress(appId: string, stage: number) {
  const app = await prisma.groupApplication.findUnique({
    where: { id: appId },
    select: { progress: true },
  });
  if (!app) return;
  const next = Math.max(app.progress || 1, stage);
  // Prefer advancing past completed simple stages when all fields filled
  const fields = GROUP_FIELDS[stage] || [];
  if (!fields.length) {
    if (next > (app.progress || 1)) await updateGroupProgress(appId, next);
    return;
  }
  const full = await getGroupApplication(appId);
  if (!full) return;
  const allFilled = fields
    .filter((f) => f.kind !== 'upload')
    .every((f) => {
      const v = currentFieldValue(full, stage, f.key);
      return Boolean(v && String(v).trim());
    });
  const target = allFilled ? Math.max(stage + 1, app.progress || 1) : Math.max(stage, app.progress || 1);
  if (target > (app.progress || 1)) {
    await updateGroupProgress(appId, Math.min(target, 9));
  }
}

export async function saveGroupField(
  userId: string,
  appId: string,
  stage: number,
  fieldKey: string,
  rawValue: string,
): Promise<ApplyFlowResult> {
  const owned = await assertOwnsGroup(userId, appId);
  if (!owned) {
    return {
      reply: 'Application not found.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const value = rawValue.trim();
  if (!value) {
    return {
      reply: 'Please enter a non-empty value.',
      quickReplies: [
        { id: 'retry', label: 'Try again', value: `field:group:${appId}:${stage}:${fieldKey}` },
        ...navChips('group', appId, stage),
      ],
      phase: 'await_field',
      expectFieldValue: true,
      fieldContext: {
        kind: 'group',
        appId,
        stage,
        field: fieldKey,
        label: fieldKey,
      },
    };
  }

  try {
    if (stage === 1) {
      const data: Record<string, unknown> = {};
      if (fieldKey === 'registrationDate') {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
          return {
            reply: 'Use date format YYYY-MM-DD.',
            quickReplies: [
              {
                id: 'retry',
                label: 'Try again',
                value: `field:group:${appId}:${stage}:${fieldKey}`,
              },
            ],
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'group',
              appId,
              stage,
              field: fieldKey,
              label: 'Registration date',
            },
          };
        }
        data.registrationDate = d;
      } else {
        data[fieldKey] = value;
      }
      await prisma.groupData.upsert({
        where: { applicationId: appId },
        create: {
          applicationId: appId,
          groupName: fieldKey === 'groupName' ? value : 'Group',
          registrationNumber: fieldKey === 'registrationNumber' ? value : 'TBD',
          registrationDate:
            fieldKey === 'registrationDate' ? (data.registrationDate as Date) : new Date(),
          county: fieldKey === 'county' ? value : '',
          constituency: fieldKey === 'constituency' ? value : '',
          ward: fieldKey === 'ward' ? value : '',
          location: fieldKey === 'location' ? value : null,
          subLocation: fieldKey === 'subLocation' ? value : null,
          clusterCategory: fieldKey === 'clusterCategory' ? value : 'other',
          ...data,
        },
        update: data,
      });
    } else if (stage === 2) {
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0) {
        return {
          reply: 'Enter a non-negative number.',
          quickReplies: [
            {
              id: 'retry',
              label: 'Try again',
              value: `field:group:${appId}:${stage}:${fieldKey}`,
            },
          ],
          phase: 'await_field',
          expectFieldValue: true,
          fieldContext: {
            kind: 'group',
            appId,
            stage,
            field: fieldKey,
            label: fieldKey,
          },
        };
      }
      await prisma.groupMembership.upsert({
        where: { applicationId: appId },
        create: {
          applicationId: appId,
          totalMales: fieldKey === 'totalMales' ? num : 0,
          totalFemales: fieldKey === 'totalFemales' ? num : 0,
          totalDisabledMales: fieldKey === 'totalDisabledMales' ? num : 0,
          totalDisabledFemales: fieldKey === 'totalDisabledFemales' ? num : 0,
        },
        update: { [fieldKey]: num },
      });
    } else if (stage === 3) {
      await prisma.groupBackground.upsert({
        where: { applicationId: appId },
        create: {
          applicationId: appId,
          purpose: fieldKey === 'purpose' ? value : '',
          proposedActivities: fieldKey === 'proposedActivities' ? value : '',
        },
        update: { [fieldKey]: value },
      });
    } else if (stage === 6) {
      if (!/^(yes|y|true|on|accept|accepted)$/i.test(value)) {
        return {
          reply: 'Type yes to accept the terms and conditions.',
          quickReplies: [
            {
              id: 'retry',
              label: 'Try again',
              value: `field:group:${appId}:${stage}:${fieldKey}`,
            },
          ],
          phase: 'await_field',
          expectFieldValue: true,
          fieldContext: {
            kind: 'group',
            appId,
            stage,
            field: fieldKey,
            label: 'Accept terms',
          },
        };
      }
      await prisma.groupApplication.update({
        where: { id: appId },
        data: { termsAccepted: true },
      });
    } else if (stage === 7) {
      await prisma.groupBankAccount.upsert({
        where: { applicationId: appId },
        create: {
          applicationId: appId,
          bankName: fieldKey === 'bankName' ? value : '',
          branchName: fieldKey === 'branchName' ? value : '',
          accountName: fieldKey === 'accountName' ? value : '',
          accountNumber: fieldKey === 'accountNumber' ? value : '',
        },
        update: { [fieldKey]: value },
      });
    } else {
      return {
        reply: 'This field is not editable in chat. Open the full form.',
        quickReplies: navChips(
          'group',
          appId,
          stage,
          getGroupApplicationUrl(owned.id, owned.progress, owned.status),
        ),
      };
    }

    await maybeBumpGroupProgress(appId, stage);
    const fieldsAgain = await groupFieldPicker(userId, appId, stage);
    return {
      ...fieldsAgain,
      reply: `Saved ${fieldKey}.\n\n${fieldsAgain.reply}`,
    };
  } catch (err) {
    return {
      reply: `Could not save: ${err instanceof Error ? err.message : 'unknown error'}`,
      quickReplies: navChips('group', appId, stage),
    };
  }
}

export async function saveIndividualField(
  userId: string,
  memberId: string,
  stage: number,
  fieldKey: string,
  rawValue: string,
): Promise<ApplyFlowResult> {
  const owned = await assertOwnsIndividual(userId, memberId);
  if (!owned) {
    return {
      reply: 'Application not found.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const value = rawValue.trim();
  if (!value) {
    return {
      reply: 'Please enter a non-empty value.',
      quickReplies: [
        {
          id: 'retry',
          label: 'Try again',
          value: `field:individual:${memberId}:${stage}:${fieldKey}`,
        },
      ],
      phase: 'await_field',
      expectFieldValue: true,
      fieldContext: {
        kind: 'individual',
        appId: memberId,
        stage,
        field: fieldKey,
        label: fieldKey,
      },
    };
  }

  try {
    if (stage === 1) {
      const memberMap: Record<string, string> = {
        fullName: 'name',
        phone: 'mobile',
        email: 'email',
        idNumber: 'idNo',
      };
      const col = memberMap[fieldKey];
      if (!col) throw new Error('Unknown field');
      await prisma.groupMember.update({
        where: { id: memberId },
        data: { [col]: value },
      });
    } else if (stage === 2) {
      const ind = await prisma.individualApplication.findUnique({
        where: { memberId },
      });
      if (!ind) throw new Error('Individual application missing');
      await prisma.locationData.upsert({
        where: { applicationId: ind.id },
        create: {
          applicationId: ind.id,
          county: fieldKey === 'county' ? value : '',
          constituency: fieldKey === 'constituency' ? value : '',
          ward: fieldKey === 'ward' ? value : '',
        },
        update: { [fieldKey]: value },
      });
    } else if (stage === 6) {
      const ind = await prisma.individualApplication.findUnique({
        where: { memberId },
      });
      if (!ind) throw new Error('Individual application missing');
      await prisma.individualBankAccount.upsert({
        where: { applicationId: ind.id },
        create: {
          applicationId: ind.id,
          bankName: fieldKey === 'bankName' ? value : '',
          branchName: fieldKey === 'branchName' ? value : null,
          accountName: fieldKey === 'accountName' ? value : '',
          accountNumber: fieldKey === 'accountNumber' ? value : '',
        },
        update: { [fieldKey]: value },
      });
    } else {
      return {
        reply: 'Open the full form for this stage.',
        quickReplies: navChips(
          'individual',
          memberId,
          stage,
          `/apply/individual/${memberId}${INDIVIDUAL_STEPS[stage - 1]?.path || ''}`,
        ),
      };
    }

    const again = await individualFieldPicker(userId, memberId, stage);
    return { ...again, reply: `Saved ${fieldKey}.\n\n${again.reply}` };
  } catch (err) {
    return {
      reply: `Could not save: ${err instanceof Error ? err.message : 'unknown error'}`,
      quickReplies: navChips('individual', memberId, stage),
    };
  }
}
