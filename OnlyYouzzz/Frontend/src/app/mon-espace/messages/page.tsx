"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export default function MessagesPage() {
  const { token } = useAuth();
  const [threads, setThreads] = React.useState<Array<{ id: string; updatedAt: string; unreadCount: number; peerLastReadAt: string | null; peer: { id: string; name: string; email: string; avatarUrl?: string | null } | null; product?: { id: string; name: string; imageUrl?: string | null; price?: number } | null; lastMessage: { id: string; senderId: string; content: string; createdAt: string } | null }>>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/messages/threads`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setThreads(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-white">
      <div className="p-0">
        <div className="">

          {/* Messages List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Chargement des conversations…</div>
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
                <p className="text-gray-500">Vous n'avez aucune conversation récente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((t) => (
                  t.peer?.id ? (
                    <Link
                      key={t.id}
                      href={`/messagerie/${t.peer.id}`}
                      className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50/70 transition-all"
                    >
                    {/* Left: Avatar + names */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        {t.peer?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.peer.avatarUrl} alt={t.peer.name} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 truncate">{t.peer?.name || 'Utilisateur'}</div>
                          {t.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {t.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[28ch]">{t.lastMessage?.content || 'Nouveau message'}</div>
                      </div>
                    </div>

                    {/* Middle: product chip */}
                    {t.product ? (
                      <div className="hidden sm:flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                          {t.product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.product.imageUrl} alt={t.product.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[22ch]">{t.product.name}</div>
                          {typeof t.product.price === 'number' ? (
                            <div className="text-xs text-gray-500">{t.product.price.toFixed(2)} €</div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {/* Right: date + seen */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="text-xs text-gray-400">
                        {new Date(t.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })} - {new Date(t.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const seen = t.peerLastReadAt && t.lastMessage?.createdAt ? (new Date(t.peerLastReadAt) >= new Date(t.lastMessage.createdAt)) : false;
                          return (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                              <svg viewBox="0 0 24 24" className={`h-3 w-3 ${seen ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    </Link>
                  ) : (
                    <div key={t.id} className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 opacity-60">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"/>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-400 truncate">Utilisateur inconnu</div>
                          <div className="text-xs text-gray-400 truncate max-w-[28ch]">Conversation indisponible</div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


