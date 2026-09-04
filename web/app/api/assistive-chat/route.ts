import { answerAssistiveChat } from '@/lib/assistive-chatbot-faq';
import {
  MAJUU_APPLY_MENU,
  plainMajuuStatus,
} from '@/lib/assistive-chat-guidance';
import {
  getGroupApplicationByAck,
  getUserGroupApplications,
  getUserIndividualMemberships,
} from '@/lib/data/applications';
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

  // Exact group ack owned by user
  const groupHit = groups.find(
    (g) => g.acknowledgmentNumber.toLowerCase() === ref.toLowerCase(),
  );
  if (groupHit) {
    return (
      `Group application ${groupHit.acknowledgmentNumber}: ${plainMajuuStatus(groupHit.status)}. ` +
      `Progress step ${groupHit.progress}. Open /dashboard for details.`
    );
  }

  // Individual ack (groupAck-idNo) among memberships
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

  // If ack exists but not owned — do not leak
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

  // Partial list if user asks generically
  if (/^(list|all|mine)$/i.test(ref)) {
    const lines: string[] = [];
    for (const g of groups.slice(0, 5)) {
      lines.push(`• Group ${g.acknowledgmentNumber}: ${plainMajuuStatus(g.status)}`);
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

/**
 * Assistive chat endpoint.
 * Actions: menu | status | faq | apply_guide
 * Auth via existing session cookies (set by /api/assistive-chat/login).
 */
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

  if (action === 'session') {
    return NextResponse.json({
      authenticated: Boolean(userId),
      menu: MAJUU_APPLY_MENU,
    });
  }

  if (action === 'menu') {
    if (!userId) {
      return NextResponse.json({
        reply: 'Please sign in first (email, then password).',
        needAuth: true,
      });
    }
    return NextResponse.json({
      reply:
        'What would you like to do?\n' +
        MAJUU_APPLY_MENU.map((m, i) => `${i + 1}. ${m.label}`).join('\n') +
        '\n\nReply with 1 or 2, or type apply / status.',
      menu: MAJUU_APPLY_MENU,
      authenticated: true,
    });
  }

  if (action === 'status' || (/status|track|where/i.test(message) && reference)) {
    if (!userId) {
      return NextResponse.json({
        reply: 'Sign in first to check application status on your account.',
        needAuth: true,
      });
    }
    const reply = await statusForUser(userId, reference);
    return NextResponse.json({ reply, source: 'status', authenticated: true });
  }

  if (action === 'apply_guide' || /^(1|apply)\b/i.test(message.trim())) {
    return NextResponse.json({
      reply: MAJUU_APPLY_MENU[0].reply,
      source: 'apply',
      authenticated: Boolean(userId),
      needAuth: !userId,
    });
  }

  if (/^(2|status)\b/i.test(message.trim())) {
    return NextResponse.json({
      reply: MAJUU_APPLY_MENU[1].reply,
      source: 'status_prompt',
      authenticated: Boolean(userId),
      needAuth: !userId,
      expectReference: true,
    });
  }

  // Ack-like tokens
  if (userId && /^UWZ-[\w-]+$/i.test(message.trim())) {
    const reply = await statusForUser(userId, message.trim());
    return NextResponse.json({ reply, source: 'status', authenticated: true });
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
        if (reply) return NextResponse.json({ reply, source: 'llm' });
      }
    } catch {
      /* FAQ */
    }
  }

  return NextResponse.json({
    reply: answerAssistiveChat(message),
    source: 'faq',
    authenticated: Boolean(userId),
  });
}
