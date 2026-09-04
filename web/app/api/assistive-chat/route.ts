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

async function statusForUser(userId: string, reference: string): Promise<string> {
  const ref = reference.trim();
  if (!ref) {
    return 'Please send an acknowledgment / reference number.';
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
    return (
      `Group application ${groupHit.acknowledgmentNumber}: ${plainMajuuStatus(groupHit.status)}. ` +
      `${getGroupProgressLabel(groupHit.progress)}. Open /dashboard for details.`
    );
  }

  for (const m of memberships) {
    const ind = m.individualApplication;
    const ack = ind?.acknowledgmentNumber;
    if (ack && ack.toLowerCase() === ref.toLowerCase()) {
      if (!ownedGroupIds.has(m.applicationId) && !ind) continue;
      return (
        `Individual application ${ack}: ${plainMajuuStatus(ind?.status)}. ` +
        `Open /apply/individual/${m.id}/dashboard for the latest stage.`
      );
    }
  }

  const anyGroup = await getGroupApplicationByAck(ref);
  if (anyGroup && !ownedAcks.has(anyGroup.acknowledgmentNumber)) {
    return 'No application with that reference was found on your account.';
  }

  const anyInd = await prisma.individualApplication.findFirst({
    where: { acknowledgmentNumber: ref },
    select: { id: true, memberId: true },
  });
  if (anyInd) {
    const allowed = memberships.some((m) => m.id === anyInd.memberId);
    if (!allowed) {
      return 'No application with that reference was found on your account.';
    }
  }

  if (/^(list|all|mine)$/i.test(ref)) {
    const lines: string[] = [];
    for (const g of groups.slice(0, 5)) {
      lines.push(
        `• Group ${g.acknowledgmentNumber}: ${plainMajuuStatus(g.status)} (${getGroupProgressLabel(g.progress)})`,
      );
    }
    for (const m of memberships.slice(0, 5)) {
      const ind = m.individualApplication;
      if (ind?.acknowledgmentNumber) {
        lines.push(
          `• Individual ${ind.acknowledgmentNumber}: ${plainMajuuStatus(ind.status)}`,
        );
      }
    }
    return lines.length
      ? `Your applications:\n${lines.join('\n')}`
      : 'No applications found on your account yet. Choose Apply for a loan to start.';
  }

  return 'No application with that reference was found on your account. Send “list” to see yours, or check /dashboard.';
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
      'You already have in-progress group application(s). Continue one of these instead of starting a new file:',
    );
    inProgress.slice(0, 6).forEach((g, i) => {
      const href = getGroupApplicationUrl(g.id, g.progress, g.status);
      const label = `${i + 1}. ${g.acknowledgmentNumber} — ${getGroupProgressLabel(g.progress)}`;
      lines.push(`• ${label}`);
      quickReplies.push({
        id: `grp-${g.id}`,
        label,
        value: `continue:${g.id}`,
      });
      links.push({ label: g.acknowledgmentNumber, href });
    });
    lines.push(
      '\nTap a button to open the next incomplete stage. Soft-duplicate and field guidance run on the apply forms; document authenticity checks are available after you choose Attach.',
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
    lines.push('Continue an existing individual application:');
    withInd.slice(0, 6).forEach((m, i) => {
      const ind = m.individualApplication!;
      const label = `${i + 1}. ${ind.acknowledgmentNumber || m.idNo} (step ${ind.progress || 1})`;
      lines.push(`• ${label}`);
      quickReplies.push({
        id: `ind-${m.id}`,
        label,
        value: `individual_continue:${m.id}`,
      });
    });
  } else if (memberships.length) {
    lines.push(
      'You are listed on a group but have not started an individual file. Open your membership dashboard to continue.',
    );
    memberships.slice(0, 4).forEach((m) => {
      quickReplies.push({
        id: `mem-${m.id}`,
        label: `Open member ${m.idNo}`,
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
    const reply = await statusForUser(userId, ref);
    return NextResponse.json({
      reply,
      source: 'status',
      authenticated: true,
      quickReplies: MAIN_MENU_REPLIES,
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
        `Continue ${g.acknowledgmentNumber}.\n${getGroupProgressLabel(g.progress)}\n\n` +
        `Stages:\n${stepHints}\n\n` +
        'Open the link to edit the next incomplete stage. Forms use soft-duplicate, field guidance, and document checks — officers still confirm authenticity.',
      openUrl: href,
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
      reply: `Continue your individual application at ${href}. Complete remaining steps; use Attach here for assistive ID/KRA checks.`,
      openUrl: href,
      quickReplies: [
        { id: 'open', label: 'Open individual apply', value: `open:${href}` },
        { id: 'docs', label: 'Check a document here', value: 'docs' },
        { id: 'menu', label: 'Back to menu', value: 'menu' },
      ],
      authenticated: true,
      phase: 'apply_docs',
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
    const reply = await statusForUser(userId, trimmed);
    return NextResponse.json({
      reply,
      source: 'status',
      authenticated: true,
      quickReplies: MAIN_MENU_REPLIES,
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
