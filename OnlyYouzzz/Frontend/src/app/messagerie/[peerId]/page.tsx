"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

async function ensureThread(base: string, token: string, peerId: string): Promise<string> {
  const res = await fetch(`${base}/api/messages/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ peerId }),
  });
  if (!res.ok) throw new Error("Erreur création conversation");
  const data = await res.json();
  return data.id as string;
}

export default function ChatPage({ params }: { params: Promise<{ peerId: string }> }) {
  const { peerId } = React.use(params);
  const { token, user } = useAuth();
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Array<{ id: string; senderId: string; content: string; createdAt: string }>>([]);
  const [peerLastReadAt, setPeerLastReadAt] = React.useState<string | null>(null);
  const [peer, setPeer] = React.useState<{ id: string; name: string; avatarUrl?: string | null } | null>(null);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  function scrollToBottom() {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }
  const [showDown, setShowDown] = React.useState(false);
  const [autoStickBottom, setAutoStickBottom] = React.useState(true);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  React.useEffect(() => {
    if (!token) return;
    ensureThread(base, token, peerId).then(setThreadId).catch(console.error);
  }, [base, token, peerId]);

  const load = React.useCallback(async () => {
    if (!token || !threadId) return;
    const res = await fetch(`${base}/api/messages/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      const peerId = data.thread.participants.find((p: string) => p !== user?.id);
      const last = data.thread.lastReadBy ? data.thread.lastReadBy[peerId] : null;
      setPeerLastReadAt(last || null);
      // fetch peer public profile (name, avatar)
      if (peerId) {
        const u = await fetch(`${base}/api/auth/user/${peerId}`).then(r => r.ok ? r.json() : null).catch(() => null);
        if (u) setPeer({ id: u.id, name: u.name, avatarUrl: u.avatarUrl });
      }
      // Auto-scroll en bas uniquement si on est collé au bas
      if (autoStickBottom) {
        requestAnimationFrame(scrollToBottom);
      }
    }
  }, [base, token, threadId, autoStickBottom]);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  // Scroll en bas à la toute première ouverture uniquement
  React.useEffect(() => {
    if (autoStickBottom) {
      requestAnimationFrame(scrollToBottom);
    }
  }, [threadId, autoStickBottom]);

  // Marquer comme lu à l'ouverture
  React.useEffect(() => {
    async function markRead() {
      if (!token || !threadId) return;
      await fetch(`${base}/api/messages/threads/${threadId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    markRead();
  }, [base, token, threadId, messages.length]);

  // Marquer comme lu juste après envoi
  React.useEffect(() => {
    async function markAfterSend() {
      if (!token || !threadId) return;
      await fetch(`${base}/api/messages/threads/${threadId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    markAfterSend();
  }, [messages.length]);

  async function sendMessage() {
    if (!token || !threadId || !input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/messages/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        await load();
        requestAnimationFrame(scrollToBottom);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full min-h-screen px-4 md:px-6 pt-30">
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-xs text-gray-400 font-medium uppercase">MESSAGE</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="mt-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {peer?.avatarUrl ? <img src={peer.avatarUrl} alt={peer.name} className="h-full w-full object-cover" /> : null}
          </div>
          <div>
            <div className="text-sm font-semibold">{peer?.name || 'Contact'}</div>
            <div className="text-[11px] text-black/50">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
        </div>

        <div className="flex-1 rounded-2xl bg-white p-2 border border-gray-200">
          <div
            ref={listRef}
            className="relative h-[42vh] overflow-auto p-3 rounded-lg"
            onScroll={(e) => {
              const el = e.currentTarget;
              const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
              setShowDown(!atBottom);
              if (!atBottom) setAutoStickBottom(false);
            }}
          >
          {messages.length === 0 ? (
            <p className="text-sm text-black/60">Aucun message.</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m, idx) => {
                const mine = m.senderId === user?.id;
                const isLastMine = mine && (idx === messages.length - 1 || messages[idx + 1].senderId !== user?.id);
                const seen = isLastMine && peerLastReadAt ? new Date(peerLastReadAt) >= new Date(m.createdAt) : false;
                const prev = idx > 0 ? messages[idx-1] : null;
                const showHeader = !prev || prev.senderId !== m.senderId;
                const d = new Date(m.createdAt);
                const dateLabel = d.toLocaleDateString();
                const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isLastMessage = idx === messages.length - 1;
                return (
                  <li key={m.id} className="w-full">
                    {isLastMessage ? (
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex-1 h-[0.5px] bg-[#FF4040]"></div>
                        <span className="px-2 text-[9px] text-[#FF4040] font-semibold uppercase tracking-wide">NOUVEAU MESSAGE</span>
                        <div className="flex-1 h-[0.5px] bg-[#FF4040]"></div>
                      </div>
                    ) : null}
                    <div className={`mb-1 flex items-center px-1 ${mine ? 'justify-end' : 'justify-between'}`}>
                      {!mine ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-black/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {peer?.avatarUrl ? <img src={peer.avatarUrl} alt={peer.name} className="h-full w-full object-cover" /> : null}
                            </div>
                            <div className="text-xs font-semibold text-black/80">{peer?.name || 'Contact'}</div>
                          </div>
                          <div className="text-[11px] text-black/50">{dateLabel} - {timeLabel}</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="text-[11px] text-black/50">{dateLabel} - {timeLabel}</div>
                          <div className="text-xs font-semibold text-black/80">toi</div>
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-black/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {user?.avatarUrl ? <img src={user.avatarUrl} alt="You" className="h-full w-full object-cover" /> : null}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`w-fit rounded-[18px] px-4 py-2 text-[13px] leading-snug tracking-widest break-words whitespace-pre-wrap ${mine ? 'ml-auto max-w-[85%] bg-white text-black text-right border border-black/10' : 'max-w-[75%] bg-gray-100 text-black'}`}>
                      {m.content}
                      {mine && isLastMine ? (
                        <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-black/20 bg-black/5 align-middle shrink-0">
                          <svg viewBox="0 0 24 24" className={`h-3 w-3 ${seen ? 'text-black' : 'text-black/40'}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
            {/* Chevron déplacé dans la barre d'actions en bas */}
          </div>
        </div>
        <div className="sticky bottom-0 left-0 right-0 mt-3 pb-5 pt-4">
          <div className="flex items-center gap-2 bg-gray-200/50 rounded-full p-2 backdrop-blur-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Écrire un message"
              className="rounded-full border border-black/10 border-[0.5px] bg-white px-4 py-2.5 text-sm focus:border-[#FF4040] flex-1 focus:outline-none"
            />
            <button onClick={sendMessage} disabled={loading} className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Envoyer</button>
            {showDown ? (
              <button
                type="button"
                aria-label="Aller en bas"
                onClick={() => {
                  setAutoStickBottom(true);
                  listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
                }}
                className="group rounded-full border border-black/10 bg-white/70 p-1.5 shadow-sm hover:border-[#FF4040]/30 hover:bg-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/60 group-hover:text-[#FF2C2C]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}


