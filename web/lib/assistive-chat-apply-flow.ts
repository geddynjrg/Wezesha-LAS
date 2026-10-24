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
import {
  checkMseaReachable,
  getMseaDisabledMessage,
  lookupMseaBusiness,
  normalizeMseaRegistrationNumber,
} from '@/lib/msea';
import {
  applyNeaimsJobseekerToMember,
  ensureRecruitmentFromPlacement,
  matchLicensedAgencies,
  recruitmentFieldLocked,
} from '@/lib/assistive-chat-neaims';
import {
  placementBlockMessage,
  unplacedGroupMembers,
  unplacedJobseekers,
} from '@/lib/neaims-placement-gate';
import { fetchJobseekerGet } from '@/lib/neaims-jobseeker';
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
    memberId?: string;
  };
};

type FieldKind = 'text' | 'number' | 'date' | 'bool' | 'upload';

type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  uploadCategory?: string;
};

const REMOVED_GROUP_INFORMATION_FIELDS = new Set([
  'county',
  'constituency',
  'ward',
  'location',
  'subLocation',
  'clusterCategory',
  'geoLocationType',
  'clusterCounty',
  'clusterConstituency',
  'clusterOther',
  'destinationRegion',
  'destinationCountry',
  'agency',
  'agentNumber',
  'localAgentName',
]);

const GROUP_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { key: 'registrationNumber', label: 'Registration number', kind: 'text' },
    { key: 'groupName', label: 'Group name', kind: 'text' },
    { key: 'registrationDate', label: 'Registration date (YYYY-MM-DD)', kind: 'date' },
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
  9: [],
};

const INDIVIDUAL_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { key: 'fullName', label: 'Full name', kind: 'text' },
    { key: 'phone', label: 'Phone number', kind: 'text' },
    { key: 'email', label: 'Email', kind: 'text' },
    { key: 'idNumber', label: 'National ID number', kind: 'text' },
    { key: 'gender', label: 'Gender (NEAIMS)', kind: 'text' },
    { key: 'dob', label: 'Date of birth (NEAIMS)', kind: 'date' },
    { key: 'kraPin', label: 'KRA PIN (NEAIMS)', kind: 'text' },
    { key: 'educationLevel', label: 'Education level (NEAIMS)', kind: 'text' },
    { key: 'passportNo', label: 'Passport number (NEAIMS)', kind: 'text' },
  ],
  4: [
    { key: 'agentNumber', label: 'Agency name or registration number', kind: 'text' },
    { key: 'localAgentName', label: 'Local recruitment agent', kind: 'text' },
    { key: 'employerAbroad', label: 'Employer abroad', kind: 'text' },
    { key: 'recruiterCode', label: 'Employer code', kind: 'text' },
    { key: 'countryOfDestination', label: 'Country of destination', kind: 'text' },
    { key: 'natureOfWork', label: 'Nature of work', kind: 'text' },
    { key: 'durationType', label: 'Duration type (months or years)', kind: 'text' },
    { key: 'workDuration', label: 'Work duration', kind: 'text' },
    { key: 'currency', label: 'Currency (KWD, AED, or RUB)', kind: 'text' },
    { key: 'monthlyRemuneration', label: 'Monthly remuneration', kind: 'number' },
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

const GROUP_MEMBER_WIZARD: FieldDef[] = [
  { key: 'member.name', label: 'Member full name', kind: 'text' },
  { key: 'member.idNo', label: 'National ID number', kind: 'text' },
  { key: 'member.mobile', label: 'Mobile number', kind: 'text' },
  { key: 'member.email', label: 'Email', kind: 'text' },
  { key: 'member.passportNo', label: 'Passport number', kind: 'text' },
  { key: 'member.amount', label: 'Loan amount (KES)', kind: 'number' },
];

const MAX_GROUP_STAGE = 9;
const MAX_INDIVIDUAL_STAGE = 9;

function withNextStageChip(
  replies: ChatQuickReply[],
  nextValue: string,
  stage: number,
  maxStage: number,
): ChatQuickReply[] {
  if (stage >= maxStage) return replies;
  return [
    { id: 'next-stage', label: 'Next stage', value: nextValue },
    ...replies.filter((r) => r.id !== 'next-stage'),
  ];
}

function stageAllNonUploadFilled(
  fields: FieldDef[],
  isFilled: (f: FieldDef) => boolean,
): boolean {
  const editable = fields.filter((f) => f.kind !== 'upload');
  if (!editable.length) return false;
  return editable.every(isFilled);
}

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

async function resolveMinGroupMembers(appId: string): Promise<number> {
  const membership = await prisma.groupMembership.findUnique({
    where: { applicationId: appId },
    select: { totalMembers: true },
  });
  return membership?.totalMembers && membership.totalMembers > 0
    ? membership.totalMembers
    : 0;
}

function memberCol(fieldKey: string): string {
  return fieldKey.replace(/^member\./, '');
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

function isMemberComplete(m: {
  name?: string | null;
  idNo?: string | null;
  mobile?: string | null;
  email?: string | null;
  passportNo?: string | null;
  amount?: unknown;
}): boolean {
  if (!m.name?.trim() || !m.idNo?.trim() || !m.mobile?.trim()) return false;
  if (!m.email?.trim() || !m.passportNo?.trim()) return false;
  const amount = Number(m.amount);
  if (!Number.isFinite(amount) || amount < 1) return false;
  if (m.idNo.startsWith('DRAFT-')) return false;
  if (m.mobile === 'pending') return false;
  return true;
}

export async function groupMemberPicker(
  userId: string,
  appId: string,
): Promise<ApplyFlowResult> {
  const owned = await assertOwnsGroup(userId, appId);
  if (!owned) {
    return {
      reply: 'Application not found on your account.',
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }
  const members = await prisma.groupMember.findMany({
    where: { applicationId: appId },
    orderBy: { createdAt: 'asc' },
  });
  const minRequired = await resolveMinGroupMembers(appId);
  const completeCount = members.filter(isMemberComplete).length;
  const done = completeCount >= minRequired;

  const lines = [
    'Stage 4: Member details. All fields are required for each group member recorded on the membership step. Each member must have a unique National ID. The group total amount must not exceed KES 500,000 to meet predeparture costs of the members.',
    members.length
      ? members
          .map((m, i) => {
            const mark = isMemberComplete(m) ? '✓' : '○';
            return `${mark} ${i + 1}. ${m.name || 'Unnamed'} · ${m.idNo}`;
          })
          .join('\n')
      : 'No members yet.',
    completeCount >= minRequired
      ? 'Every recorded member is complete.'
      : 'Some recorded members still have empty fields.',
  ];

  const quickReplies: ChatQuickReply[] = [];
  if (members.length < minRequired) {
    quickReplies.push({
      id: 'member-add',
      label: 'Add member',
      value: `member:add:group:${appId}`,
    });
  }
  members.forEach((m, i) => {
    quickReplies.push({
      id: `member-edit-${m.id}`,
      label: `Edit ${i + 1}. ${(m.name || 'Member').slice(0, 20)}`,
      value: `member:edit:group:${appId}:${m.id}`,
    });
  });
  quickReplies.push({
    id: 'member-done',
    label: done ? 'Done (advance)' : 'Done (finish every member)',
    value: `member:done:group:${appId}`,
  });
  quickReplies.push(...navChips('group', appId, 4, `/apply/group/${appId}/member-details`));

  return {
    reply: lines.join('\n'),
    quickReplies: done
      ? withNextStageChip(
          quickReplies,
          `stage:group:${appId}:5`,
          4,
          MAX_GROUP_STAGE,
        )
      : quickReplies,
    phase: 'field_pick',
  };
}

function beginMemberField(
  appId: string,
  memberId: string | undefined,
  field: FieldDef,
): ApplyFlowResult {
  return {
    reply: `Enter ${field.label}.`,
    quickReplies: [
      {
        id: 'back',
        label: 'Back to members',
        value: `stage:group:${appId}:4`,
      },
      { id: 'menu', label: 'Back to menu', value: 'menu' },
    ],
    phase: 'await_field',
    expectFieldValue: true,
    fieldContext: {
      kind: 'group',
      appId,
      stage: 4,
      field: field.key,
      label: field.label,
      memberId,
    },
  };
}

export async function handleMemberAction(
  userId: string,
  action: string,
): Promise<ApplyFlowResult> {
  const addMatch = action.match(/^member:add:group:([a-z0-9-]+)$/i);
  if (addMatch) {
    const appId = addMatch[1]!;
    const owned = await assertOwnsGroup(userId, appId);
    if (!owned) {
      return {
        reply: 'Application not found.',
        quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
      };
    }
    const recorded = await resolveMinGroupMembers(appId);
    const existingCount = await prisma.groupMember.count({
      where: { applicationId: appId },
    });
    if (recorded > 0 && existingCount >= recorded) {
      const again = await groupMemberPicker(userId, appId);
      return {
        ...again,
        reply: `Member details already include every group member recorded on the membership step.\n\n${again.reply}`,
      };
    }
    return beginMemberField(appId, undefined, GROUP_MEMBER_WIZARD[0]!);
  }

  const editMatch = action.match(
    /^member:edit:group:([a-z0-9-]+):([a-z0-9-]+)$/i,
  );
  if (editMatch) {
    const appId = editMatch[1]!;
    const memberId = editMatch[2]!;
    const owned = await assertOwnsGroup(userId, appId);
    if (!owned) {
      return {
        reply: 'Application not found.',
        quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
      };
    }
    const member = await prisma.groupMember.findFirst({
      where: { id: memberId, applicationId: appId },
    });
    if (!member) {
      return groupMemberPicker(userId, appId);
    }
    return beginMemberField(appId, memberId, GROUP_MEMBER_WIZARD[0]!);
  }

  const doneMatch = action.match(/^member:done:group:([a-z0-9-]+)$/i);
  if (doneMatch) {
    const appId = doneMatch[1]!;
    const owned = await assertOwnsGroup(userId, appId);
    if (!owned) {
      return {
        reply: 'Application not found.',
        quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
      };
    }
    const members = await prisma.groupMember.findMany({
      where: { applicationId: appId },
    });
    const minRequired = await resolveMinGroupMembers(appId);
    const completeCount = members.filter(isMemberComplete).length;
    if (completeCount < minRequired) {
      const again = await groupMemberPicker(userId, appId);
      return {
        ...again,
        reply: `Every group member recorded on the membership step must have all fields filled, and each National ID must be unique.\n\n${again.reply}`,
      };
    }
    const unplacedMembers = await unplacedGroupMembers(appId);
    if (unplacedMembers.length > 0) {
      const again = await groupMemberPicker(userId, appId);
      return {
        ...again,
        reply:
          `A job placement must exist for every job seeker before the group can continue.\n${placementBlockMessage(unplacedMembers)}\n\n${again.reply}`,
      };
    }
    await updateGroupProgress(appId, 5);
    const next = await groupFieldPicker(userId, appId, 5);
    return {
      ...next,
      reply: `Members saved (${completeCount}). Progress advanced to stage 5.\n\n${next.reply}`,
    };
  }

  return {
    reply: 'Unknown member action. Open member details or pick a stage.',
    quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
  };
}

export async function saveGroupMemberField(
  userId: string,
  appId: string,
  fieldKey: string,
  rawValue: string,
  memberId?: string,
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
        {
          id: 'back',
          label: 'Back to members',
          value: `stage:group:${appId}:4`,
        },
      ],
      phase: 'await_field',
      expectFieldValue: true,
      fieldContext: {
        kind: 'group',
        appId,
        stage: 4,
        field: fieldKey,
        label: fieldKey,
        memberId,
      },
    };
  }

  const col = memberCol(fieldKey);
  const wizardIdx = GROUP_MEMBER_WIZARD.findIndex((f) => f.key === fieldKey);
  if (wizardIdx < 0) {
    return groupMemberPicker(userId, appId);
  }

  try {
    let currentId = memberId;
    if (!currentId) {
      if (col !== 'name') {
        return beginMemberField(appId, undefined, GROUP_MEMBER_WIZARD[0]!);
      }
      const created = await prisma.groupMember.create({
        data: {
          applicationId: appId,
          name: value,
          idNo: `DRAFT-${Date.now()}`,
          mobile: 'pending',
          email: null,
          passportNo: null,
          amount: null,
        },
      });
      currentId = created.id;
    } else {
      const existing = await prisma.groupMember.findFirst({
        where: { id: currentId, applicationId: appId },
      });
      if (!existing) {
        return groupMemberPicker(userId, appId);
      }
      if (col === 'idNo') {
        const clash = await prisma.groupMember.findFirst({
          where: {
            applicationId: appId,
            idNo: value,
            NOT: { id: currentId },
          },
        });
        if (clash) {
          return {
            reply: `National ID ${value} is already on this application. Enter a different ID.`,
            quickReplies: [
              {
                id: 'retry',
                label: 'Try again',
                value: `member:edit:group:${appId}:${currentId}`,
              },
              {
                id: 'back',
                label: 'Back to members',
                value: `stage:group:${appId}:4`,
              },
            ],
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'group',
              appId,
              stage: 4,
              field: fieldKey,
              label: 'National ID number',
              memberId: currentId,
            },
          };
        }
        await prisma.groupMember.update({
          where: { id: currentId },
          data: { idNo: value },
        });
        const neaimsNote = await applyNeaimsJobseekerToMember(currentId, value);
        const nextField = GROUP_MEMBER_WIZARD[wizardIdx + 1];
        if (nextField) {
          return {
            ...beginMemberField(appId, currentId, nextField),
            reply: `Saved ${GROUP_MEMBER_WIZARD[wizardIdx]!.label}. ${neaimsNote}\n\nEnter ${nextField.label}.`,
          };
        }
      } else if (col === 'amount') {
        const num = Number(value.replace(/,/g, ''));
        if (!Number.isFinite(num) || num < 0) {
          return {
            reply: 'Enter a valid non-negative amount.',
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'group',
              appId,
              stage: 4,
              field: fieldKey,
              label: 'Loan amount (KES)',
              memberId: currentId,
            },
            quickReplies: [
              {
                id: 'back',
                label: 'Back to members',
                value: `stage:group:${appId}:4`,
              },
            ],
          };
        }
        await prisma.groupMember.update({
          where: { id: currentId },
          data: { amount: num },
        });
      } else if (col === 'email' || col === 'passportNo') {
        await prisma.groupMember.update({
          where: { id: currentId },
          data: { [col]: value === '-' ? null : value },
        });
      } else {
        await prisma.groupMember.update({
          where: { id: currentId },
          data: { [col]: value },
        });
      }
    }

    const nextField = GROUP_MEMBER_WIZARD[wizardIdx + 1];
    if (nextField) {
      return {
        ...beginMemberField(appId, currentId, nextField),
        reply: `Saved ${GROUP_MEMBER_WIZARD[wizardIdx]!.label}.\n\nEnter ${nextField.label}.`,
      };
    }

    const list = await groupMemberPicker(userId, appId);
    return {
      ...list,
      reply: `Member saved.\n\n${list.reply}`,
    };
  } catch (err) {
    return {
      reply: `Could not save member: ${err instanceof Error ? err.message : 'unknown error'}`,
      quickReplies: [
        {
          id: 'back',
          label: 'Back to members',
          value: `stage:group:${appId}:4`,
        },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
    };
  }
}

async function applyMseaToGroup(
  appId: string,
  registrationNumber: string,
): Promise<{ ok: true; summary: string } | { ok: false; reason: string }> {
  const reachable = await checkMseaReachable();
  if (!reachable) {
    return { ok: false, reason: getMseaDisabledMessage() };
  }
  const record = await lookupMseaBusiness(registrationNumber);
  if (!record) {
    return {
      ok: false,
      reason:
        'MSEA lookup found no registered business for that number. Enter remaining group fields manually.',
    };
  }

  const regDate = record.registration_date
    ? new Date(record.registration_date)
    : new Date();
  const groupName = (record.business_name || '').trim() || 'Group';
  const regNo = normalizeMseaRegistrationNumber(record.registration_number || registrationNumber);

  await prisma.groupData.upsert({
    where: { applicationId: appId },
    create: {
      applicationId: appId,
      groupName,
      registrationNumber: regNo,
      registrationDate: Number.isNaN(regDate.getTime()) ? new Date() : regDate,
      county: '',
      constituency: '',
      ward: '',
      location: null,
      subLocation: null,
      clusterCategory: 'other',
    },
    update: {
      groupName,
      registrationNumber: regNo,
      registrationDate: Number.isNaN(regDate.getTime()) ? undefined : regDate,
    },
  });

  let partnersCreated = 0;
  for (const p of record.partners || []) {
    const idNo = (p.id_number || '').trim();
    const name = (p.name || '').trim();
    if (!idNo || !name) continue;
    const mobile = (p.phone_number || '').trim() || 'pending';
    try {
      await prisma.groupMember.upsert({
        where: {
          applicationId_idNo: { applicationId: appId, idNo },
        },
        create: {
          applicationId: appId,
          name,
          idNo,
          mobile,
        },
        update: {
          name,
          ...(mobile !== 'pending' ? { mobile } : {}),
        },
      });
      partnersCreated += 1;
    } catch {
      /* skip bad partner rows */
    }
  }

  const filled = [
    `group name (${groupName})`,
    `registration number (${regNo})`,
    record.registration_date
      ? `registration date (${record.registration_date})`
      : null,
    partnersCreated ? `${partnersCreated} member(s) from MSEA partners` : null,
  ].filter(Boolean);

  return {
    ok: true,
    summary: `MSEA filled: ${filled.join(', ')}.`,
  };
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

  if (stage === 4) {
    return groupMemberPicker(userId, appId);
  }

  if (stage > 4) {
    const unplacedMembers = await unplacedGroupMembers(appId);
    if ((app.members?.length ?? 0) === 0 || unplacedMembers.length > 0) {
      return {
        reply:
          unplacedMembers.length > 0
            ? `A job placement must exist for every job seeker before this stage.\n${placementBlockMessage(unplacedMembers)}`
            : 'List every job seeker on member details. A NEAIMS placement is required before the group can continue.',
        quickReplies: [
          {
            id: 'members',
            label: 'Member details',
            value: `stage:group:${appId}:4`,
          },
          { id: 'menu', label: 'Back to menu', value: 'menu' },
        ],
      };
    }
  }

  if (stage === 9) {
    return {
      reply:
        'Upload Documents no longer collects group files. Each member uploads the passport biodata page on the individual application. Open this step to submit the group application.',
      quickReplies: [
        { id: 'open', label: 'Open Upload Documents', value: `open:${href}` },
        ...navChips('group', appId, stage),
      ],
      phase: 'field_pick',
      openUrl: href,
    };
  }

  const fields = GROUP_FIELDS[stage] || [];

  if (!fields.length) {
    return {
      reply:
        `${step?.title || `Stage ${stage}`} needs the full form (amounts or signatures).\n` +
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

  if (stage === 1) {
    quickReplies.unshift({
      id: 'manual-full',
      label: 'Manual full edit (all fields)',
      value: `field:group:${appId}:1:groupName`,
    });
  }

  const allFilled = stageAllNonUploadFilled(fields, (f) => {
    const cur = currentFieldValue(app, stage, f.key);
    return Boolean(cur && String(cur).trim());
  });
  let replies = [...quickReplies, ...navChips('group', appId, stage, href)];
  if (allFilled) {
    replies = withNextStageChip(
      replies,
      `stage:group:${appId}:${stage + 1}`,
      stage,
      MAX_GROUP_STAGE,
    );
  }

  const stage1Lead =
    stage === 1
      ? 'Enter your MSEA certificate registration number first (tap Registration number). ' +
        'I will try to fill group name, registration date, and members from MSEA. ' +
        'Or choose Manual full edit.\n\n'
      : '';

  return {
    reply:
      `${stage1Lead}Stage ${stage}: ${step?.title}. Tap a field to type a value, or an upload slot to attach a file.`,
    quickReplies: replies,
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
  const memberRow = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { idNo: true, name: true },
  });
  const unplacedPerson = await unplacedJobseekers([
    {
      nationalId: memberRow?.idNo ?? '',
      name: memberRow?.name,
    },
  ]);
  if (unplacedPerson.length > 0) {
    return {
      reply: `Individual application cannot continue. ${placementBlockMessage(unplacedPerson)}`,
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
    include: { location: true, bankAccount: true, member: true, recruitment: true },
  });

  let neaimsLead = '';
  if (stage === 4) {
    neaimsLead = `${await ensureRecruitmentFromPlacement(memberId)}\n\n`;
    const refreshed = await prisma.recruitmentData.findUnique({
      where: { applicationId: ind?.id || '__none__' },
    });
    if (refreshed && ind) {
      ind.recruitment = refreshed;
    }
  }

  const valueFor = (f: FieldDef): string | null => {
    if (stage === 1) {
      const dob = ind?.member?.dob
        ? ind.member.dob.toISOString().slice(0, 10)
        : null;
      const map: Record<string, string | null | undefined> = {
        fullName: ind?.member?.name,
        phone: ind?.member?.mobile,
        email: ind?.member?.email,
        idNumber: ind?.member?.idNo,
        gender: ind?.member?.gender,
        dob,
        kraPin: ind?.member?.kraPin,
        educationLevel: ind?.member?.educationLevel,
        passportNo: ind?.member?.passportNo,
      };
      return map[f.key] || null;
    }
    if (stage === 2 && ind?.location) {
      return (
        String((ind.location as Record<string, unknown>)[f.key] ?? '').trim() ||
        null
      );
    }
    if (stage === 4 && ind?.recruitment) {
      const raw = (ind.recruitment as Record<string, unknown>)[f.key];
      if (raw == null) return null;
      return String(raw).trim() || null;
    }
    if (stage === 6 && ind?.bankAccount) {
      return (
        String((ind.bankAccount as Record<string, unknown>)[f.key] ?? '').trim() ||
        null
      );
    }
    return null;
  };

  const quickReplies: ChatQuickReply[] = fields.map((f) => {
    const cur = valueFor(f);
    const filled = Boolean(cur && cur.trim());
    return {
      id: `if-${f.key}`,
      label: `${filled ? '✓' : '○'} ${f.label}${filled ? ` · ${cur!.slice(0, 24)}` : ''}`,
      value: `field:individual:${memberId}:${stage}:${f.key}`,
    };
  });
  let replies = [...quickReplies, ...navChips('individual', memberId, stage, href)];
  if (stageAllNonUploadFilled(fields, (f) => Boolean(valueFor(f)?.trim()))) {
    replies = withNextStageChip(
      replies,
      `stage:individual:${memberId}:${stage + 1}`,
      stage,
      MAX_INDIVIDUAL_STAGE,
    );
  }

  return {
    reply: `${neaimsLead}Stage ${stage}: ${step?.title}. Tap a field to update it in chat.`,
    quickReplies: replies,
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
    if (stage === 4 || fieldKey.startsWith('member.')) {
      const field =
        GROUP_MEMBER_WIZARD.find((f) => f.key === fieldKey) || GROUP_MEMBER_WIZARD[0]!;
      return beginMemberField(appId, undefined, field);
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
    const mseaHint =
      stage === 1 && field.key === 'registrationNumber'
        ? ' Prefer your MSEA certificate registration number — I will look it up and fill matching fields.'
        : '';
    return {
      reply:
        `Enter ${field.label}` +
        (cur ? ` (current: ${cur}).` : '.') +
        mseaHint +
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
  const member = await prisma.groupMember.findUnique({
    where: { id: appId },
    select: { idNo: true },
  });
  if (stage === 1 && fieldKey === 'kraPin' && member?.idNo) {
    const jobseeker = await fetchJobseekerGet(member.idNo);
    if (jobseeker.kraPin) {
      return {
        reply: `KRA PIN ${jobseeker.kraPin} comes from NEAIMS and cannot be edited.`,
        quickReplies: [
          { id: 'back', label: 'Back to fields', value: `stage:individual:${appId}:${stage}` },
        ],
        phase: 'field_pick',
      };
    }
  }
  if (stage === 4 && member?.idNo && (await recruitmentFieldLocked(member.idNo, fieldKey))) {
    return {
      reply: `${field.label} was filled from the NEAIMS placement and cannot be edited.`,
      quickReplies: [
        { id: 'back', label: 'Back to fields', value: `stage:individual:${appId}:${stage}` },
      ],
      phase: 'field_pick',
    };
  }
  const neaimsHint =
    stage === 1 && fieldKey === 'idNumber'
      ? ' I will look this National ID up on NEAIMS Jobseeker Get and Placements.'
      : stage === 4 && fieldKey === 'agentNumber'
        ? ' Type an agency name or registration number. I will search the NEAIMS licensed agency list.'
        : '';
  return {
    reply: `Enter ${field.label}.${neaimsHint}`,
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
  const fields = GROUP_FIELDS[stage] || [];
  if (!fields.length) {
    const next = Math.max(app.progress || 1, stage);
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
  const target = allFilled
    ? Math.max(stage + 1, app.progress || 1)
    : Math.max(stage, app.progress || 1);
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
  memberId?: string,
): Promise<ApplyFlowResult> {
  if (stage === 4 || fieldKey.startsWith('member.')) {
    return saveGroupMemberField(userId, appId, fieldKey, rawValue, memberId);
  }

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
    let mseaNote = '';
    if (
      stage === 1 &&
      REMOVED_GROUP_INFORMATION_FIELDS.has(fieldKey)
    ) {
      return {
        reply:
          'Group location and cluster category are no longer collected on the group application.',
        quickReplies: navChips('group', appId, stage),
      };
    }
    if (stage === 1) {
      if (fieldKey === 'registrationNumber') {
        value = normalizeMseaRegistrationNumber(value);
        const msea = await applyMseaToGroup(appId, value);
        if (msea.ok) {
          mseaNote = msea.summary;
        } else {
          await prisma.groupData.upsert({
            where: { applicationId: appId },
            create: {
              applicationId: appId,
              groupName: 'Group',
              registrationNumber: value,
              registrationDate: new Date(),
              county: '',
              constituency: '',
              ward: '',
              location: null,
              subLocation: null,
              clusterCategory: 'other',
            },
            update: { registrationNumber: value },
          });
          mseaNote = `${msea.reason} Fill the remaining fields manually.`;
        }
      } else {
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
              fieldKey === 'registrationDate'
                ? (data.registrationDate as Date)
                : new Date(),
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
      }
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
    const prefix = mseaNote
      ? `Saved registration number.\n${mseaNote}\n\n`
      : `Saved ${fieldKey}.\n\n`;
    return {
      ...fieldsAgain,
      reply: `${prefix}${fieldsAgain.reply}`,
      quickReplies: withNextStageChip(
        fieldsAgain.quickReplies,
        `stage:group:${appId}:${stage + 1}`,
        stage,
        MAX_GROUP_STAGE,
      ),
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
  const memberRow = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { idNo: true, name: true },
  });
  const unplacedPerson = await unplacedJobseekers([
    {
      nationalId: memberRow?.idNo ?? '',
      name: memberRow?.name,
    },
  ]);
  if (unplacedPerson.length > 0) {
    return {
      reply: `Individual application cannot continue. ${placementBlockMessage(unplacedPerson)}`,
      quickReplies: [{ id: 'menu', label: 'Back to menu', value: 'menu' }],
    };
  }

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
        gender: 'gender',
        kraPin: 'kraPin',
        educationLevel: 'educationLevel',
        passportNo: 'passportNo',
      };
      if (fieldKey === 'kraPin') {
        const current = await prisma.groupMember.findUnique({
          where: { id: memberId },
          select: { idNo: true },
        });
        const jobseeker = current?.idNo ? await fetchJobseekerGet(current.idNo) : null;
        if (jobseeker?.kraPin) {
          const again = await individualFieldPicker(userId, memberId, stage);
          return {
            ...again,
            reply: `KRA PIN stays ${jobseeker.kraPin} from NEAIMS.\n\n${again.reply}`,
          };
        }
      }
      if (fieldKey === 'dob') {
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) {
          return {
            reply: 'Use date format YYYY-MM-DD.',
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'individual',
              appId: memberId,
              stage,
              field: fieldKey,
              label: 'Date of birth',
            },
            quickReplies: [
              { id: 'back', label: 'Back to fields', value: `stage:individual:${memberId}:${stage}` },
            ],
          };
        }
        await prisma.groupMember.update({
          where: { id: memberId },
          data: { dob },
        });
      } else {
        const col = memberMap[fieldKey];
        if (!col) throw new Error('Unknown field');
        await prisma.groupMember.update({
          where: { id: memberId },
          data: { [col]: value },
        });
      }
      if (fieldKey === 'idNumber') {
        const note = await applyNeaimsJobseekerToMember(memberId, value);
        const again = await individualFieldPicker(userId, memberId, stage);
        return {
          ...again,
          reply: `Saved National ID. ${note}\n\n${again.reply}`,
          quickReplies: withNextStageChip(
            again.quickReplies,
            `stage:individual:${memberId}:${stage + 1}`,
            stage,
            MAX_INDIVIDUAL_STAGE,
          ),
        };
      }
    } else if (stage === 4) {
      const ind = await prisma.individualApplication.findUnique({
        where: { memberId },
        include: { member: { select: { idNo: true } } },
      });
      if (!ind) throw new Error('Individual application missing');
      if (
        ind.member.idNo &&
        (await recruitmentFieldLocked(ind.member.idNo, fieldKey))
      ) {
        const again = await individualFieldPicker(userId, memberId, stage);
        return {
          ...again,
          reply: `That recruitment field is locked from the NEAIMS placement.\n\n${again.reply}`,
        };
      }
      if (fieldKey === 'agentNumber') {
        const matches = await matchLicensedAgencies(value);
        const exact =
          matches.find(
            (agency) =>
              agency.neaRegNo.toLowerCase() === value.toLowerCase() ||
              agency.agencyName.toLowerCase() === value.toLowerCase(),
          ) || (matches.length === 1 ? matches[0] : null);
        if (!exact) {
          const chips = matches.slice(0, 8).map((agency) => ({
            id: `ag-${agency.neaRegNo}`,
            label: `${agency.neaRegNo} - ${agency.agencyName}`.slice(0, 80),
            value: agency.neaRegNo,
          }));
          return {
            reply: matches.length
              ? 'Several licensed agencies match. Tap one, or type a more specific name or number.'
              : 'No licensed agency matched that search. Try the agency name or registration number.',
            quickReplies: [
              ...chips,
              { id: 'back', label: 'Back to fields', value: `stage:individual:${memberId}:${stage}` },
            ],
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'individual',
              appId: memberId,
              stage,
              field: 'agentNumber',
              label: 'Agency name or registration number',
            },
          };
        }
        await prisma.recruitmentData.upsert({
          where: { applicationId: ind.id },
          create: {
            applicationId: ind.id,
            agentNumber: exact.neaRegNo,
            localAgentName: exact.agencyName,
          },
          update: {
            agentNumber: exact.neaRegNo,
            localAgentName: exact.agencyName,
          },
        });
      } else if (fieldKey === 'monthlyRemuneration') {
        const amount = Number(value.replace(/,/g, ''));
        if (!Number.isFinite(amount) || amount <= 0) {
          return {
            reply: 'Enter a positive monthly remuneration.',
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'individual',
              appId: memberId,
              stage,
              field: fieldKey,
              label: 'Monthly remuneration',
            },
            quickReplies: [
              { id: 'back', label: 'Back to fields', value: `stage:individual:${memberId}:${stage}` },
            ],
          };
        }
        await prisma.recruitmentData.upsert({
          where: { applicationId: ind.id },
          create: { applicationId: ind.id, monthlyRemuneration: amount },
          update: { monthlyRemuneration: amount },
        });
      } else if (fieldKey === 'currency') {
        const currency = value.toUpperCase();
        if (!['KWD', 'AED', 'RUB'].includes(currency)) {
          return {
            reply: 'Currency must be KWD, AED, or RUB.',
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'individual',
              appId: memberId,
              stage,
              field: fieldKey,
              label: 'Currency',
            },
            quickReplies: [
              { id: 'kwd', label: 'KWD', value: 'KWD' },
              { id: 'aed', label: 'AED', value: 'AED' },
              { id: 'rub', label: 'RUB', value: 'RUB' },
            ],
          };
        }
        await prisma.recruitmentData.upsert({
          where: { applicationId: ind.id },
          create: { applicationId: ind.id, currency },
          update: { currency },
        });
      } else if (fieldKey === 'durationType') {
        const durationType = value.toLowerCase();
        if (durationType !== 'months' && durationType !== 'years') {
          return {
            reply: 'Duration type must be months or years.',
            phase: 'await_field',
            expectFieldValue: true,
            fieldContext: {
              kind: 'individual',
              appId: memberId,
              stage,
              field: fieldKey,
              label: 'Duration type',
            },
            quickReplies: [
              { id: 'months', label: 'Months', value: 'months' },
              { id: 'years', label: 'Years', value: 'years' },
            ],
          };
        }
        await prisma.recruitmentData.upsert({
          where: { applicationId: ind.id },
          create: { applicationId: ind.id, durationType },
          update: { durationType },
        });
      } else {
        await prisma.recruitmentData.upsert({
          where: { applicationId: ind.id },
          create: { applicationId: ind.id, [fieldKey]: value },
          update: { [fieldKey]: value },
        });
      }
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
    return {
      ...again,
      reply: `Saved ${fieldKey}.\n\n${again.reply}`,
      quickReplies: withNextStageChip(
        again.quickReplies,
        `stage:individual:${memberId}:${stage + 1}`,
        stage,
        MAX_INDIVIDUAL_STAGE,
      ),
    };
  } catch (err) {
    return {
      reply: `Could not save: ${err instanceof Error ? err.message : 'unknown error'}`,
      quickReplies: navChips('individual', memberId, stage),
    };
  }
}
