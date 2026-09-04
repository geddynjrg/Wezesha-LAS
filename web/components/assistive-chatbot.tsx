'use client';

import { answerAssistiveChat, type ChatMessage } from '@/lib/assistive-chatbot-faq';
import {
  MAIN_MENU_REPLIES,
  type ChatQuickReply,
} from '@/lib/assistive-chat-guidance';
import { Button } from '@workspace/ui/components/button';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
} from 'react';

type Phase =
  | 'boot'
  | 'await_username'
  | 'await_password'
  | 'menu'
  | 'apply_choice'
  | 'group_list'
  | 'status_wait'
  | 'apply_docs'
  | 'open';

const WHATSAPP_ENV =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER || ''
    : '';

function waLink(number: string): string | null {
  const digits = number.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    'Hello Uwezo Fund support — I need help with my Wezesha Majuu application.',
  )}`;
}

function pushAssistant(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  content: string,
) {
  setMessages((prev) => [...prev, { role: 'assistant', content }]);
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
}

export const AssistiveChatbot: FC<{
  productLabel?: string;
  supportWhatsApp?: string;
}> = ({
  productLabel = 'Wezesha Majuu Assistant',
  supportWhatsApp = WHATSAPP_ENV,
}) => {
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>('boot');
  const [username, setUsername] = useState('');
  const [quickReplies, setQuickReplies] = useState<ChatQuickReply[]>([]);
  const [docType, setDocType] = useState<'national_id' | 'kra_pin' | 'passport'>(
    'national_id',
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const autoOpened = useRef(false);

  const whatsappHref = useMemo(
    () => waLink(supportWhatsApp || ''),
    [supportWhatsApp],
  );
  const hide = pathname.startsWith('/ps');
  const passwordMode = phase === 'await_password';

  useEffect(() => {
    if (autoOpened.current || hide) return;
    if (isMobileViewport()) {
      autoOpened.current = true;
      setOpen(true);
      setPhase('boot');
    }
  }, [hide]);

  const startAuthFlow = useCallback(() => {
    setPhase('await_username');
    setUsername('');
    setQuickReplies([]);
    setMessages([
      {
        role: 'assistant',
        content:
          'Welcome to the Wezesha Majuu assistant. To continue, enter your account email (username).',
      },
    ]);
  }, []);

  const showSignedInMenu = useCallback(() => {
    setPhase('menu');
    setQuickReplies(MAIN_MENU_REPLIES);
    setMessages([
      {
        role: 'assistant',
        content: 'Signed in successfully.\nWhat would you like to do?',
      },
    ]);
  }, []);

  useEffect(() => {
    if (!open || phase !== 'boot') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/assistive-chat/login');
        const data = (await res.json()) as { authenticated?: boolean };
        if (cancelled) return;
        if (data.authenticated) {
          showSignedInMenu();
        } else {
          startAuthFlow();
        }
      } catch {
        if (!cancelled) startAuthFlow();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, phase, startAuthFlow, showSignedInMenu]);

  const login = useCallback(async (user: string, password: string) => {
    const res = await fetch('/api/assistive-chat/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password }),
    });
    return (await res.json()) as { ok?: boolean; error?: string; message?: string };
  }, []);

  const applyServerPayload = useCallback(
    (data: {
      reply?: string;
      needAuth?: boolean;
      expectReference?: boolean;
      quickReplies?: ChatQuickReply[];
      phase?: string;
      openUrl?: string;
    }) => {
      if (data.needAuth) {
        startAuthFlow();
        return;
      }
      if (data.expectReference) setPhase('status_wait');
      if (data.phase === 'apply_choice') setPhase('apply_choice');
      if (data.phase === 'group_list') setPhase('group_list');
      if (data.phase === 'apply_docs') setPhase('apply_docs');
      if (data.phase === 'individual') setPhase('apply_choice');
      if (Array.isArray(data.quickReplies)) setQuickReplies(data.quickReplies);
      pushAssistant(setMessages, data.reply || 'OK');
      if (data.openUrl && typeof window !== 'undefined') {
        // Deep-link offered via quick reply; do not force navigation.
      }
    },
    [startAuthFlow],
  );

  const postChat = useCallback(
    async (payload: Record<string, string>) => {
      const res = await fetch('/api/assistive-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, path: pathname }),
      });
      return (await res.json()) as {
        reply?: string;
        needAuth?: boolean;
        expectReference?: boolean;
        quickReplies?: ChatQuickReply[];
        phase?: string;
        openUrl?: string;
      };
    },
    [pathname],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setBusy(true);
      const displayUser = phase === 'await_password' ? '••••••••' : trimmed;
      setMessages((prev) => [...prev, { role: 'user', content: displayUser }]);
      setInput('');

      try {
        if (trimmed.startsWith('open:')) {
          const href = trimmed.slice(5);
          if (href.startsWith('/')) window.location.href = href;
          setBusy(false);
          return;
        }

        if (phase === 'await_username') {
          setUsername(trimmed);
          setPhase('await_password');
          setQuickReplies([]);
          pushAssistant(
            setMessages,
            'Enter your password (it stays masked and is not stored in this chat).',
          );
          setBusy(false);
          return;
        }

        if (phase === 'await_password') {
          const result = await login(username, trimmed);
          if (!result.ok) {
            pushAssistant(
              setMessages,
              `${result.error || 'Sign-in failed.'}\nEnter your email again to retry.`,
            );
            setPhase('await_username');
            setUsername('');
            setBusy(false);
            return;
          }
          showSignedInMenu();
          setBusy(false);
          return;
        }

        if (phase === 'status_wait') {
          const data = await postChat({
            action: 'status',
            reference: trimmed,
            message: trimmed,
          });
          applyServerPayload(data);
          if (!data.expectReference) setPhase('menu');
          setBusy(false);
          return;
        }

        if (phase === 'apply_docs') {
          const lower = trimmed.toLowerCase();
          if (lower.includes('kra')) setDocType('kra_pin');
          else if (lower.includes('passport')) setDocType('passport');
          else if (lower.includes('id')) setDocType('national_id');
          else if (lower === 'menu') {
            showSignedInMenu();
            setBusy(false);
            return;
          }
          pushAssistant(
            setMessages,
            `Ready for ${
              lower.includes('kra')
                ? 'KRA PIN'
                : lower.includes('passport')
                  ? 'passport'
                  : 'National ID'
            } upload. Use Attach below, or open the apply Documents step.`,
          );
          setBusy(false);
          return;
        }

        if (/^(apply|1)$/i.test(trimmed) || phase === 'menu' && trimmed === 'apply') {
          const data = await postChat({ action: 'apply', message: trimmed });
          applyServerPayload(data);
          setBusy(false);
          return;
        }

        if (/^(status|2)$/i.test(trimmed)) {
          setPhase('status_wait');
          const data = await postChat({ action: 'status', message: 'status' });
          applyServerPayload(data);
          setBusy(false);
          return;
        }

        if (
          phase === 'apply_choice' &&
          (/^individual$/i.test(trimmed) || trimmed.startsWith('1'))
        ) {
          const data = await postChat({ action: 'individual', message: 'individual' });
          applyServerPayload(data);
          setBusy(false);
          return;
        }

        if (
          phase === 'apply_choice' &&
          (/^group$/i.test(trimmed) || trimmed.startsWith('2'))
        ) {
          const data = await postChat({ action: 'group', message: 'group' });
          applyServerPayload(data);
          setBusy(false);
          return;
        }

        // Generic / continue:* / group / menu / docs
        let action = 'auto';
        if (/^menu$/i.test(trimmed)) action = 'menu';
        else if (/^group$/i.test(trimmed)) action = 'group';
        else if (/^individual$/i.test(trimmed)) action = 'individual';
        else if (/^new_group$/i.test(trimmed)) action = 'new_group';
        else if (/^docs$/i.test(trimmed)) action = 'docs';
        else if (/^continue:/i.test(trimmed)) action = trimmed;
        else if (/^individual_continue:/i.test(trimmed)) action = trimmed;
        else if (/^list$/i.test(trimmed)) action = 'status';

        const data = await postChat({
          action,
          message: trimmed,
          reference: trimmed,
        });
        if (!data.reply && !data.needAuth) {
          pushAssistant(setMessages, answerAssistiveChat(trimmed));
        } else {
          applyServerPayload(data);
        }
      } finally {
        setBusy(false);
      }
    },
    [
      busy,
      phase,
      username,
      login,
      postChat,
      applyServerPayload,
      showSignedInMenu,
    ],
  );

  const onUpload = useCallback(
    async (file: File) => {
      if (busy) return;
      setBusy(true);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `[Uploaded file: ${file.name}]` },
      ]);
      try {
        const form = new FormData();
        form.set('file', file);
        form.set('declaredType', docType);
        const res = await fetch('/api/assistive-chat/upload', {
          method: 'POST',
          body: form,
        });
        const data = (await res.json()) as {
          reply?: string;
          nextHint?: string;
          error?: string;
        };
        if (!res.ok) {
          pushAssistant(
            setMessages,
            data.error || 'Upload check failed. Sign in and try again.',
          );
          if (res.status === 401) startAuthFlow();
        } else {
          pushAssistant(
            setMessages,
            `${data.reply || 'Checked.'}\n${data.nextHint || ''}`,
          );
        }
      } catch {
        pushAssistant(
          setMessages,
          'Could not check that file. Try again or use the apply Documents step.',
        );
      }
      setBusy(false);
    },
    [busy, docType, startAuthFlow],
  );

  if (hide) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(78svh,600px)] w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          <header className="flex items-center justify-between gap-2 border-b bg-sky-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-sky-950">{productLabel}</p>
              <p className="text-[11px] text-sky-800">
                Secure assist · mobile-first · passwords never stored
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-sky-900 underline"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </header>
          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2 text-sm whitespace-pre-wrap">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={
                  m.role === 'user'
                    ? 'ml-6 rounded-md bg-primary/10 px-2 py-1.5'
                    : 'mr-4 rounded-md bg-muted px-2 py-1.5'
                }
              >
                {m.content}
              </div>
            ))}
            {quickReplies.length > 0 && !passwordMode ? (
              <div className="mr-2 flex flex-wrap gap-1.5 pt-1">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    type="button"
                    disabled={busy}
                    onClick={() => void send(qr.value)}
                    className="rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-left text-xs font-medium text-sky-950 hover:bg-sky-100 disabled:opacity-50"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {phase === 'apply_docs' || phase === 'group_list' ? (
            <div className="flex items-center gap-2 border-t px-2 py-1.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onUpload(f);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="text-xs"
                disabled={busy}
                onClick={() => {
                  setPhase('apply_docs');
                  fileRef.current?.click();
                }}
              >
                Attach{' '}
                {docType === 'kra_pin'
                  ? 'KRA'
                  : docType === 'passport'
                    ? 'passport'
                    : 'ID'}
              </Button>
              <a href="/apply" className="text-xs text-sky-800 underline">
                Open apply
              </a>
            </div>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="border-t px-3 py-1.5 text-center text-xs text-emerald-800 underline"
            >
              Continue on WhatsApp
            </a>
          ) : null}
          <form
            className="flex gap-2 border-t p-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              className="min-w-0 flex-1 rounded border px-2 py-1.5 text-sm"
              placeholder={
                passwordMode
                  ? 'Password'
                  : phase === 'await_username'
                    ? 'Email / username'
                    : phase === 'status_wait'
                      ? 'Application reference…'
                      : 'Type a message…'
              }
              type={passwordMode ? 'password' : 'text'}
              autoComplete={passwordMode ? 'current-password' : 'username'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label={passwordMode ? 'Password' : 'Chat message'}
            />
            <Button type="submit" size="sm" disabled={busy || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        className="pointer-events-auto rounded-full bg-sky-700 px-4 py-3 text-sm font-medium text-white shadow-md hover:bg-sky-800"
        onClick={() => {
          setOpen((v) => {
            if (!v) setPhase('boot');
            return !v;
          });
        }}
        aria-expanded={open}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? '×' : 'Help'}
      </button>
    </div>
  );
};

