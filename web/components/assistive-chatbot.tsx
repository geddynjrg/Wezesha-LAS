'use client';

import { answerAssistiveChat, type ChatMessage } from '@/lib/assistive-chatbot-faq';
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
  const [docType, setDocType] = useState<'national_id' | 'kra_pin' | 'passport'>(
    'national_id',
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const whatsappHref = useMemo(
    () => waLink(supportWhatsApp || ''),
    [supportWhatsApp],
  );
  const hide = pathname.startsWith('/ps');
  const passwordMode = phase === 'await_password';

  const startAuthFlow = useCallback(() => {
    setPhase('await_username');
    setUsername('');
    setMessages([
      {
        role: 'assistant',
        content:
          'Welcome to the Wezesha Majuu assistant. To continue, enter your account email (username).',
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
          setPhase('menu');
          setMessages([
            {
              role: 'assistant',
              content:
                'You are signed in. What would you like to do?\n1. Apply for a loan\n2. Check status of loan application\n\nReply 1 or 2 (or ask a question).',
            },
          ]);
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
  }, [open, phase, startAuthFlow]);

  const login = useCallback(async (user: string, password: string) => {
    const res = await fetch('/api/assistive-chat/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
    return data;
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setBusy(true);
      const displayUser =
        phase === 'await_password' ? '••••••••' : trimmed;
      setMessages((prev) => [...prev, { role: 'user', content: displayUser }]);
      setInput('');

      try {
        if (phase === 'await_username') {
          setUsername(trimmed);
          setPhase('await_password');
          pushAssistant(
            setMessages,
            'Enter your password (it stays masked and is not stored in this chat).',
          );
          setBusy(false);
          return;
        }

        if (phase === 'await_password') {
          const password = trimmed; // in-memory only for this request; never persisted
          const result = await login(username, password);
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
          setPhase('menu');
          pushAssistant(
            setMessages,
            `${result.message || 'Signed in.'}\n\nWhat would you like to do?\n1. Apply for a loan\n2. Check status of loan application`,
          );
          setBusy(false);
          return;
        }

        if (phase === 'status_wait') {
          const res = await fetch('/api/assistive-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'status',
              reference: trimmed,
              message: trimmed,
              path: pathname,
            }),
          });
          const data = (await res.json()) as { reply?: string };
          pushAssistant(setMessages, data.reply || 'Unable to look up that reference.');
          setPhase('menu');
          setBusy(false);
          return;
        }

        if (phase === 'apply_docs') {
          const lower = trimmed.toLowerCase();
          if (lower.includes('kra')) setDocType('kra_pin');
          else if (lower.includes('passport')) setDocType('passport');
          else if (lower.includes('id')) setDocType('national_id');
          pushAssistant(
            setMessages,
            `Ready for ${lower.includes('kra') ? 'KRA PIN' : lower.includes('passport') ? 'passport' : 'National ID'} upload. Use the Attach button below, or open /apply to finish official uploads.`,
          );
          setBusy(false);
          return;
        }

        // Menu / general
        if (/^(1|apply)\b/i.test(trimmed)) {
          setPhase('apply_docs');
          const res = await fetch('/api/assistive-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'apply_guide', message: trimmed, path: pathname }),
          });
          const data = (await res.json()) as { reply?: string; needAuth?: boolean };
          if (data.needAuth) {
            startAuthFlow();
            setBusy(false);
            return;
          }
          pushAssistant(
            setMessages,
            (data.reply || '') +
              '\n\nDocument checklist: reply ID, KRA, or passport, then Attach a file for an assistive authenticity check.',
          );
          setBusy(false);
          return;
        }

        if (/^(2|status)\b/i.test(trimmed)) {
          setPhase('status_wait');
          pushAssistant(
            setMessages,
            'Send your acknowledgment / reference number (or type “list”).',
          );
          setBusy(false);
          return;
        }

        let reply = answerAssistiveChat(trimmed);
        const res = await fetch('/api/assistive-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, path: pathname }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            reply?: string;
            needAuth?: boolean;
            expectReference?: boolean;
          };
          if (data.needAuth) {
            startAuthFlow();
            setBusy(false);
            return;
          }
          if (data.expectReference) setPhase('status_wait');
          if (data.reply) reply = data.reply;
        }
        pushAssistant(setMessages, reply);
      } finally {
        setBusy(false);
      }
    },
    [busy, phase, username, login, pathname, startAuthFlow],
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
          pushAssistant(setMessages, data.error || 'Upload check failed. Sign in and try again.');
          if (res.status === 401) startAuthFlow();
        } else {
          pushAssistant(
            setMessages,
            `${data.reply || 'Checked.'}\n${data.nextHint || ''}`,
          );
        }
      } catch {
        pushAssistant(setMessages, 'Could not check that file. Try again or use the apply Documents step.');
      }
      setBusy(false);
    },
    [busy, docType, startAuthFlow],
  );

  if (hide) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(72svh,560px)] w-[min(100vw-1.5rem,380px)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
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
          </div>
          {phase === 'apply_docs' ? (
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
                onClick={() => fileRef.current?.click()}
              >
                Attach {docType === 'kra_pin' ? 'KRA' : docType === 'passport' ? 'passport' : 'ID'}
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
