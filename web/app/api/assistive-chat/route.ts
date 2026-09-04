import { answerAssistiveChat } from '@/lib/assistive-chatbot-faq';
import {
  APPLY_TYPE_REPLIES,
  MAIN_MENU_REPLIES,
  MAJUU_APPLY_MENU,
  plainMajuuStatus,
  type ChatQuickReply,
} from '@/lib/assistive-chat-guidance';
import {
  getGroupApplicationByAck,
  getUserGroupApplications,
  getUserIndividualMemberships,
} from '@/lib/data/applications';
import {
  getGroupApplicationUrl,
  getGroupProgressLabel,
  GROUP_STEPS,
} from '@/lib/constants/majuu-steps';
import { getSessionUserId } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function groupDisplayName(g: {
  groupData?: { groupName?: string | null } | null;
  acknowledgmentNumber: string;
}): string {
  return g.groupData?.groupName?.trim() || 'Group application';
}

function groupChipLabel(
  g: {
    id: string;
    acknowledgmentNumber: string;
    status: string;
    progress: number;
    groupData?: { groupName?: string | null } | null;
  },
  index?: number,
): string {
  const prefix = typeof index === 'number' ? `${index + 1}. ` : '';
  const name = groupDisplayName(g);
  const stage =
    g.status === 'DRAFT' || g.progress < 9
      ? getGroupProgressLabel(g.progress)
      : plainMajuuStatus(g.status);
  return `${prefix}${name} · ${g.acknowledgmentNumber} · ${stage}`;
}

type StatusResult = {
  reply: string;
  quickReplies?: ChatQuickReply[];
  openUrl?: string;
  phase?: string;
};

async function listApplicationsForUser(
  userId: string,
  mode: 'status' | 'continue' = 'status',
): Promise<StatusResult> {
  const [groups, memberships] = await Promise.all([
    getUserGroupApplications(userId),
    getUserIndividualMemberships(userId),
  ]);

  const quickReplies: ChatQuickReply[] = [];
  let n = 0;

  for (const g of groups.slice(0, 6)) {
    const inProgress = g.status === 'DRAFT' || g.progress < 9;
    const label = groupChipLabel(g, n);
    n += 1;
    if (mode === 'continue' || inProgress) {
      quickReplies.push({
        id: `grp-${g.id}`,
        label,
        value: `continue:${g.id}`,
      });
    } else {
      quickReplies.push({
        id: `st-g-${g.id}`,
        label,
        value: `status_ref:${g.acknowledgmentNumber}`,
      });
    }
  }

  for (const m of memberships.slice(0, 6)) {
    const ind = m.individualApplication;
    if (!ind?.acknowledgmentNumber) continue;
    const groupName =
      m.application?.groupData?.groupName?.trim() || 'Individual';
    const label = `${n + 1}. ${groupName} · ${ind.acknowledgmentNumber} · ${plainMajuuStatus(ind.status)}`;
    n += 1;
    const inProgress = ind.status === 'DRAFT' || (ind.progress || 1) < 9;
    if (mode === 'continue' || inProgress) {
      quickReplies.push({
        id: `ind-${m.id}`,
        label,
        value: `individual_continue:${m.id}`,
      });
    } else {
      quickReplies.push({
        id: `st-i-${m.id}`,
        label,
        value: `status_ref:${ind.acknowledgmentNumber}`,
      });
    }
  }

  if (!quickReplies.length) {
    return {
      reply:
        'No applications found on your account yet. Choose Apply for a loan to start.',
      quickReplies: MAIN_MENU_REPLIES,
    };
  }

  quickReplies.push({ id: 'menu', label: 'Back to menu', value: 'menu' });

  return {
    reply:
      mode === 'continue'
        ? 'Tap an application to continue (opens the next incomplete stage):'
        : 'Tap an application to view its status (or continue a draft):',
    quickReplies,
  };
}

async function statusForUser(
  userId: string,
  reference: string,
): Promise<StatusResult> {
  const ref = reference.trim();
  if (!ref) {
    return { reply: 'Please send an acknowledgment / reference number.' };
  }

  if (/^(list|all|mine)$/i.test(ref)) {
    return listApplicationsForUser(userId, 'status');
  }

  const [groups, memberships] = await Promise.all([
    getUserGroupApplications(userId),
    getUserIndividualMemberships(userId),
  ]);

  const ownedGroupIds = new Set(groups.map((g) => g.id));
  const ownedAcks = new Set(groups.map((g) => g.acknowledgmentNumber));

  const groupHit = groups.find(
    (g) => g.acknowledgmentNumber.toLowerCase() === ref.toLowerCase(),
  );
  if (groupHit) {
    const inProgress = groupHit.status === 'DRAFT' || groupHit.progress < 9;
    const href = getGroupApplicationUrl(
      groupHit.id,
      groupHit.progress,
      groupHit.status,
    );
    const reply =
      `Group ${groupDisplayName(groupHit)} (${groupHit.acknowledgmentNumber}): ${plainMajuuStatus(groupHit.status)}. ` +
      `${getGroupProgressLabel(groupHit.progress)}.`;
    return {
      reply,
      openUrl: inProgress ? href : `/dashboard`,
      quickReplies: [
        ...(inProgress
          ? [
              {
                id: 'cont',
                label: 'Continue this application',
                value: `continue:${groupHit.id}`,
              },
            ]
          : [
              {
                id: 'dash',
                label: 'Open dashboard',
                value: 'open:/dashboard',
              },
            ]),
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
    };
  }

  for (const m of memberships) {
    const ind = m.individualApplication;
    const ack = ind?.acknowledgmentNumber;
    if (ack && ack.toLowerCase() === ref.toLowerCase()) {
      if (!ownedGroupIds.has(m.applicationId) && !ind) continue;
      const href = `/apply/individual/${m.id}/dashboard`;
      return {
        reply:
          `Individual application ${ack}: ${plainMajuuStatus(ind?.status)}. ` +
          `Open the individual apply path to continue or review.`,
        openUrl: href,
        quickReplies: [
          {
            id: 'cont',
            label: 'Open this application',
            value: `individual_continue:${m.id}`,
          },
          { id: 'menu', label: 'Back to menu', value: 'menu' },
        ],
      };
    }
  }

  const anyGroup = await getGroupApplicationByAck(ref);
  if (anyGroup && !ownedAcks.has(anyGroup.acknowledgmentNumber)) {
    return {
      reply: 'No application with that reference was found on your account.',
    };
  }

  const anyInd = await prisma.individualApplication.findFirst({
    where: { acknowledgmentNumber: ref },
    select: { id: true, memberId: true },
  });
  if (anyInd) {
    const allowed = memberships.some((m) => m.id === anyInd.memberId);
    if (!allowed) {
      return {
        reply: 'No application with that reference was found on your account.',
      };
    }
  }

  return {
    reply:
      'No application with that reference was found on your account. Tap List to see yours, or check /dashboard.',
    quickReplies: [
      { id: 'list', label: 'List my applications', value: 'list' },
      { id: 'menu', label: 'Back to menu', value: 'menu' },
    ],
  };
}

async function groupApplyPayload(userId: string): Promise<{
  reply: string;
  quickReplies: ChatQuickReply[];
  links: { label: string; href: string }[];
}> {
  const groups = await getUserGroupApplications(userId);
  const inProgress = groups.filter((g) => g.status === 'DRAFT' || g.progress < 9);
  const submitted = groups.filter((g) => g.status !== 'DRAFT' && g.progress >= 9);

  const quickReplies: ChatQuickReply[] = [];
  const links: { label: string; href: string }[] = [];
  const lines: string[] = [];

  if (inProgress.length) {
    lines.push(
      'You already have in-progress group application(s). Tap a button to continue — do not start a new file unless needed:',
    );
    inProgress.slice(0, 6).forEach((g, i) => {
      const href = getGroupApplicationUrl(g.id, g.progress, g.status);
      const label = groupChipLabel(g, i);
      lines.push(`• ${label}`);
      quickReplies.push({
        id: `grp-${g.id}`,
        label,
        value: `continue:${g.id}`,
      });
      links.push({ label: g.acknowledgmentNumber, href });
    });
    lines.push(
      '\nEach button opens the next incomplete stage for that application.',
    );
    quickReplies.push({
      id: 'new-group',
      label: 'Start a new group (only if needed)',
      value: 'new_group',
    });
  } else {
    lines.push(
      submitted.length
        ? 'No draft group applications on your account. Start a new group or open your dashboard.'
        : 'No group applications yet. Start a new group application.',
    );
    quickReplies.push({
      id: 'new-group',
      label: 'Start new Group Application',
      value: 'new_group',
    });
  }

  quickReplies.push({
    id: 'back',
    label: 'Back to menu',
    value: 'menu',
  });

  return { reply: lines.join('\n'), quickReplies, links };
}

async function individualApplyPayload(userId: string): Promise<{
  reply: string;
  quickReplies: ChatQuickReply[];
}> {
  const memberships = await getUserIndividualMemberships(userId);
  const quickReplies: ChatQuickReply[] = [];
  const lines: string[] = [
    'Individual applications are tied to a group membership.',
  ];

  const withInd = memberships.filter((m) => m.individualApplication);
  if (withInd.length) {
    lines.push('Tap an individual application to continue:');
    withInd.slice(0, 6).forEach((m, i) => {
      const ind = m.individualApplication!;
      const groupName =
        m.application?.groupData?.groupName?.trim() || 'Individual';
      const label = `${i + 1}. ${groupName} · ${ind.acknowledgmentNumber || m.idNo} · step ${ind.progress || 1}`;
      lines.push(`• ${label}`);
      quickReplies.push({
        id: `ind-${m.id}`,
        label,
        value: `individual_continue:${m.id}`,
      });
    });
  } else if (memberships.length) {
    lines.push(
      'You are listed on a group but have not started an individual file. Tap a membership to open it:',
    );
    memberships.slice(0, 4).forEach((m, i) => {
      const groupName =
        m.application?.groupData?.groupName?.trim() || 'Group';
      quickReplies.push({
        id: `mem-${m.id}`,
        label: `${i + 1}. ${groupName} · member ${m.idNo}`,
        value: `individual_continue:${m.id}`,
      });
    });
  } else {
    lines.push(
      'No individual membership found on your account yet. Join/complete a group first, or ask your chair to add your National ID.',
    );
  }

  quickReplies.push(
    { id: 'group', label: '2. Group Application', value: 'group' },
    { id: 'back', label: 'Back to menu', value: 'menu' },
  );

  return { reply: lines.join('\n'), quickReplies };
}

export async function POST(request: Request) {
  let message = '';
  let path = '';
  let action = 'auto';
  let reference = '';
  try {
    const body = (await request.json()) as {
      message?: string;
      path?: string;
      action?: string;
      reference?: string;
    };
    message = String(body.message || '');
    path = String(body.path || '');
    action = String(body.action || 'auto');
    reference = String(body.reference || message || '');
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const userId = await getSessionUserId();
  const trimmed = message.trim();

  if (action === 'session') {
    return NextResponse.json({
      authenticated: Boolean(userId),
      menu: MAJUU_APPLY_MENU,
      quickReplies: userId ? MAIN_MENU_REPLIES : [],
    });
  }

  if (action === 'menu' || /^menu$/i.test(trimmed)) {
    if (!userId) {
      return NextResponse.json({
        reply: 'Please sign in first (email, then password).',
        needAuth: true,
      });
    }
    return NextResponse.json({
      reply: 'Signed in successfully.\nWhat would you like to do?',
      quickReplies: MAIN_MENU_REPLIES,
      authenticated: true,
    });
  }

  if (
    action === 'status' ||
    /^status$/i.test(trimmed) ||
    (action === 'auto' && /^(2|status)\b/i.test(trimmed))
  ) {
    if (!userId) {
      return NextResponse.json({
        reply: 'Sign in first to check application status on your account.',
        needAuth: true,
      });
    }
    const ref =
      action === 'status' && reference && !/^(status|2)$/i.test(reference.trim())
        ? reference.trim()
        : '';
    if (!ref) {
      return NextResponse.json({
        reply: MAJUU_APPLY_MENU[1].reply,
        expectReference: true,
        quickReplies: [
          { id: 'list', label: 'List my applications', value: 'list' },
          { id: 'menu', label: 'Back to menu', value: 'menu' },
        ],
        authenticated: true,
      });
    }
    const result = await statusForUser(userId, ref);
    return NextResponse.json({
      ...result,
      source: 'status',
      authenticated: true,
      quickReplies: result.quickReplies?.length
        ? result.quickReplies
        : MAIN_MENU_REPLIES,
    });
  }

  if (action === 'apply_choice' || action === 'apply' || /^(apply|1)$/i.test(trimmed)) {
    if (!userId) {
      return NextResponse.json({
        reply: 'Sign in first to apply.',
        needAuth: true,
      });
    }
    return NextResponse.json({
      reply: MAJUU_APPLY_MENU[0].reply,
      quickReplies: APPLY_TYPE_REPLIES,
      authenticated: true,
      phase: 'apply_choice',
    });
  }

  if (
    action === 'group' ||
    action === 'group_list' ||
    /^group$/i.test(trimmed)
  ) {
    if (!userId) {
      return NextResponse.json({ reply: 'Sign in first.', needAuth: true });
    }
    const payload = await groupApplyPayload(userId);
    return NextResponse.json({
      ...payload,
      authenticated: true,
      phase: 'group_list',
      source: 'group',
    });
  }

  if (action === 'individual' || /^individual$/i.test(trimmed)) {
    if (!userId) {
      return NextResponse.json({ reply: 'Sign in first.', needAuth: true });
    }
    const payload = await individualApplyPayload(userId);
    return NextResponse.json({
      ...payload,
      authenticated: true,
      phase: 'individual',
      source: 'individual',
    });
  }

  if (action === 'new_group' || /^new_group$/i.test(trimmed)) {
    return NextResponse.json({
      reply:
        'Starting a new group is only needed when you have no usable draft. Open /apply/create to begin. Soft-duplicate checks will warn if the group already exists.',
      openUrl: '/apply/create',
      quickReplies: [
        { id: 'open', label: 'Open /apply/create', value: 'open:/apply/create' },
        { id: 'group', label: 'Back to group list', value: 'group' },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
      authenticated: Boolean(userId),
      needAuth: !userId,
    });
  }

  const continueMatch = trimmed.match(/^continue:([a-z0-9-]+)$/i);
  if (action.startsWith('continue:') || continueMatch) {
    if (!userId) {
      return NextResponse.json({ reply: 'Sign in first.', needAuth: true });
    }
    const id = (action.startsWith('continue:') ? action.slice(9) : continueMatch![1])!;
    const groups = await getUserGroupApplications(userId);
    const g = groups.find((row) => row.id === id);
    if (!g) {
      return NextResponse.json({
        reply: 'That group application was not found on your account.',
        quickReplies: MAIN_MENU_REPLIES,
      });
    }
    const href = getGroupApplicationUrl(g.id, g.progress, g.status);
    const stepHints = GROUP_STEPS.map(
      (s) => `${s.index <= g.progress ? '✓' : '○'} ${s.index}. ${s.title}`,
    ).join('\n');
    return NextResponse.json({
      reply:
        `Opening ${groupDisplayName(g)} (${g.acknowledgmentNumber}).\n${getGroupProgressLabel(g.progress)}\n\n` +
        `Stages:\n${stepHints}`,
      openUrl: href,
      navigate: true,
      quickReplies: [
        { id: 'open', label: 'Open next stage', value: `open:${href}` },
        { id: 'docs', label: 'Check a document here', value: 'docs' },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
      authenticated: true,
      phase: 'apply_docs',
    });
  }

  const indMatch = trimmed.match(/^individual_continue:([a-z0-9-]+)$/i);
  if (action.startsWith('individual_continue:') || indMatch) {
    if (!userId) {
      return NextResponse.json({ reply: 'Sign in first.', needAuth: true });
    }
    const memberId = (
      action.startsWith('individual_continue:')
        ? action.slice('individual_continue:'.length)
        : indMatch![1]
    )!;
    const href = `/apply/individual/${memberId}/dashboard`;
    return NextResponse.json({
      reply: `Opening your individual application…`,
      openUrl: href,
      navigate: true,
      quickReplies: [
        { id: 'open', label: 'Open individual apply', value: `open:${href}` },
        { id: 'docs', label: 'Check a document here', value: 'docs' },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
      authenticated: true,
      phase: 'apply_docs',
    });
  }

  if (
    action.startsWith('status_ref:') ||
    /^status_ref:/i.test(trimmed)
  ) {
    if (!userId) {
      return NextResponse.json({ reply: 'Sign in first.', needAuth: true });
    }
    const ref = (
      action.startsWith('status_ref:')
        ? action.slice('status_ref:'.length)
        : trimmed.slice('status_ref:'.length)
    ).trim();
    const result = await statusForUser(userId, ref);
    return NextResponse.json({
      ...result,
      source: 'status',
      authenticated: true,
      quickReplies: result.quickReplies?.length
        ? result.quickReplies
        : MAIN_MENU_REPLIES,
    });
  }

  if (action === 'docs' || /^docs$/i.test(trimmed)) {
    return NextResponse.json({
      reply:
        'Document checklist: reply ID, KRA, or passport, then Attach a file for an assistive authenticity check. Suspicious files are flagged for officer review — never auto-approved.',
      phase: 'apply_docs',
      authenticated: Boolean(userId),
      needAuth: !userId,
    });
  }

  if (action === 'apply_guide') {
    return NextResponse.json({
      reply: MAJUU_APPLY_MENU[0].reply,
      quickReplies: APPLY_TYPE_REPLIES,
      source: 'apply',
      authenticated: Boolean(userId),
      needAuth: !userId,
    });
  }

  if (/^(2|status)\b/i.test(trimmed)) {
    return NextResponse.json({
      reply: MAJUU_APPLY_MENU[1].reply,
      source: 'status_prompt',
      authenticated: Boolean(userId),
      needAuth: !userId,
      expectReference: true,
      quickReplies: [
        { id: 'list', label: 'List my applications', value: 'list' },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
    });
  }

  if (userId && (/^UWZ-[\w-]+$/i.test(trimmed) || /^list$/i.test(trimmed))) {
    const result = await statusForUser(userId, trimmed);
    return NextResponse.json({
      ...result,
      source: 'status',
      authenticated: true,
      quickReplies: result.quickReplies?.length
        ? result.quickReplies
        : MAIN_MENU_REPLIES,
    });
  }

  const llmUrl = process.env.CHATBOT_LLM_API_URL;
  const llmKey = process.env.CHATBOT_LLM_API_KEY;
  if (llmUrl && llmKey) {
    try {
      const res = await fetch(llmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${llmKey}`,
        },
        body: JSON.stringify({
          message,
          path,
          product: 'majuu',
          authenticated: Boolean(userId),
          system:
            'You are an assistive Wezesha Majuu helper. Never request or repeat passwords. Guide apply steps and status only.',
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string; content?: string };
        const reply = data.reply || data.content;
        if (reply) {
          return NextResponse.json({
            reply,
            source: 'llm',
            quickReplies: userId ? MAIN_MENU_REPLIES : [],
          });
        }
      }
    } catch {
      /* FAQ */
    }
  }

  return NextResponse.json({
    reply: answerAssistiveChat(message),
    source: 'faq',
    authenticated: Boolean(userId),
    quickReplies: userId ? MAIN_MENU_REPLIES : [],
  });
}
