"use client";
import React from "react";
import Link from "next/link";

type Vendor = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  productsCount: number;
  verified?: boolean;
  description?: string;
  dateOfBirth?: string | null;
};

export default function TopVendors() {
  const [items, setItems] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollerRef2 = React.useRef<HTMLDivElement | null>(null);
  // Surélévation 3D gérée en CSS :hover; pas de state pour le hover
  const rafRef = React.useRef<number | null>(null);
  const rafRef2 = React.useRef<number | null>(null);
  const lastTsRef = React.useRef<number | null>(null);
  const lastTsRef2 = React.useRef<number | null>(null);
  // vitesse constante (plus de modulation liée au scroll de page)
  // Construire une base suffisamment longue même avec peu de vendeurs, puis la tripler pour une boucle infinie
  const baseSet = React.useMemo(() => {
    if (!items.length) return [] as Vendor[];
    const minItems = 12; // garantit une largeur suffisante
    const repeats = Math.max(1, Math.ceil(minItems / items.length));
    const extended = Array.from({ length: repeats }).flatMap(() => items);
    return extended;
  }, [items]);
  const displayItems = React.useMemo(() => (baseSet.length ? baseSet.concat(baseSet).concat(baseSet) : []), [baseSet]);

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const limit = 10;
      const res = await fetch(`${base}/api/vendors/top?offset=${offset}&limit=${limit}`, { cache: "no-store" });
      if (res.ok) {
        const data: Vendor[] = await res.json();
        setItems((prev) => [...prev, ...data]);
        setOffset((prev) => prev + data.length);
        setHasMore(data.length === limit);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset]);

  React.useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll logic (loops and pauses on hover)
  const tick = React.useCallback((ts: number) => {
    const el = scrollerRef.current;
    if (!el) {
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const last = lastTsRef.current ?? ts;
    const dt = ts - last; // ms
    lastTsRef.current = ts;
    const pxPerMs = 0.06; // ~60 px/s
    el.scrollLeft += pxPerMs * dt;
    const loopWidth = el.scrollWidth / 3; // tripled content => 1 set width
    if (loopWidth > 0 && el.scrollLeft >= loopWidth * 2) {
      // when we reach the start of the third set, jump back by one set
      el.scrollLeft -= loopWidth; // seamless loop keeping us in the middle set
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Auto-scroll reversed for second row (slightly different speed for parallax)
  const tickReverse = React.useCallback((ts: number) => {
    const el = scrollerRef2.current;
    if (!el) {
      lastTsRef2.current = ts;
      rafRef2.current = requestAnimationFrame(tickReverse);
      return;
    }
    const last = lastTsRef2.current ?? ts;
    const dt = ts - last; // ms
    lastTsRef2.current = ts;
    const pxPerMs = 0.06; // ~60 px/s (match top row)
    el.scrollLeft -= pxPerMs * dt;
    const loopWidth = el.scrollWidth / 3;
    if (loopWidth > 0 && el.scrollLeft <= 1) {
      // reached the start of the middle set; jump forward by one set
      el.scrollLeft += loopWidth;
    }
    rafRef2.current = requestAnimationFrame(tickReverse);
  }, []);

  React.useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    rafRef2.current = requestAnimationFrame(tickReverse);
    // plus de modulation de vitesse: aucun listener wheel
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rafRef2.current) cancelAnimationFrame(rafRef2.current);
      rafRef.current = null;
      rafRef2.current = null;
      lastTsRef.current = null;
      lastTsRef2.current = null;
      // rien à nettoyer côté wheel
    };
  }, [tick, tickReverse]);

  // Empêcher uniquement le slide horizontal (laisser passer le scroll vertical de la page)
  React.useEffect(() => {
    const el1 = scrollerRef.current as HTMLElement | null;
    const el2 = scrollerRef2.current as HTMLElement | null;
    if (!el1 && !el2) return;

    const attach = (el: HTMLElement | null) => {
      if (!el) return () => {};
      // wheel: bloquer si mouvement majoritairement horizontal ou si shift (souvent mappé à horizontal)
      const onWheel = (e: WheelEvent) => {
        const dx = Math.abs(e.deltaX || 0);
        const dy = Math.abs(e.deltaY || 0);
        if (dx > dy || (e.shiftKey && dy > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      // touch: bloquer si geste horizontal
      let touchStartX = 0;
      let touchStartY = 0;
      let tracking = false;
      const onTouchStart = (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        tracking = true;
        touchStartX = t.clientX;
        touchStartY = t.clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        if (!tracking) return;
        const t = e.touches[0];
        if (!t) return;
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);
        if (dx > dy && dx > 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      const onTouchEnd = () => { tracking = false; };

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: false });
      el.addEventListener('touchend', onTouchEnd, { passive: true });
      el.addEventListener('touchcancel', onTouchEnd, { passive: true });

      return () => {
        el.removeEventListener('wheel', onWheel as EventListener);
        el.removeEventListener('touchstart', onTouchStart as EventListener);
        el.removeEventListener('touchmove', onTouchMove as EventListener);
        el.removeEventListener('touchend', onTouchEnd as EventListener);
        el.removeEventListener('touchcancel', onTouchEnd as EventListener);
      };
    };
    const detach1 = attach(el1);
    const detach2 = attach(el2);
    return () => {
      detach1?.();
      detach2?.();
    };
  }, [scrollerRef.current, scrollerRef2.current]);

  const onScroll = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const baseWidth = el.scrollWidth / 3;
    // Recentrer lors d'un scroll manuel pour maintenir la boucle au set du milieu
    if (baseWidth > 0) {
      if (el.scrollLeft <= 1) {
        el.scrollLeft += baseWidth;
      } else if (el.scrollLeft >= baseWidth * 2) {
        el.scrollLeft -= baseWidth;
      }
    }
    if (!loading && hasMore) {
      const nearEnd = baseWidth > 0 && (el.scrollLeft + el.clientWidth >= baseWidth * 2 - 200);
      if (nearEnd) loadMore();
    }
  }, [loading, hasMore, loadMore]);

  const onScroll2 = React.useCallback(() => {
    const el = scrollerRef2.current;
    if (!el) return;
    const baseWidth = el.scrollWidth / 3;
    // Recentrer lors d'un scroll manuel pour maintenir la boucle au set du milieu
    if (baseWidth > 0) {
      if (el.scrollLeft <= 1) {
        el.scrollLeft += baseWidth;
      } else if (el.scrollLeft >= baseWidth * 2) {
        el.scrollLeft -= baseWidth;
      }
    }
  }, []);

  // Se placer au centre (2e set) au montage et quand le contenu change
  React.useEffect(() => {
    const el = scrollerRef.current;
    const el2 = scrollerRef2.current;
    if (!el && !el2) return;
    const center = () => {
      if (el) {
        const baseWidth = el.scrollWidth / 3;
        if (baseWidth > 0) el.scrollLeft = baseWidth;
      }
      if (el2) {
        const baseWidth2 = el2.scrollWidth / 3;
        if (baseWidth2 > 0) el2.scrollLeft = baseWidth2;
      }
    };
    // attendre le paint
    requestAnimationFrame(center);
  }, [displayItems.length]);

  return (
    <section className="mt-[8vh]">
      <div className=" rounded-3xl bg-white">
        <div className="relative -mx-[calc(50vw-50%)] px-[calc(50vw-50%)] overflow-x-hidden" style={{ perspective: "600px", perspectiveOrigin: "50% 55%" }}>
          {/* Liste horizontale */}
          {loading && items.length === 0 ? (
            <p className="text-sm text-black/60">Chargement…</p>
          ) : (
            <>
            <div
              ref={scrollerRef}
              id="tv-scroller"
              className="overflow-x-auto overflow-y-visible scrollbar-none py-1 px-0 touch-pan-y"
              style={{ transformStyle: "preserve-3d" }}
              onScroll={onScroll}
            >
              <div className="tv-row relative flex gap-2 pr-6" style={{ perspective: "900px", perspectiveOrigin: "50% 55%", transformStyle: "preserve-3d", isolation: "isolate" }}>
                {displayItems.map((v, idx) => {
                  const cloneKey = `${v.id}-${idx}`;
                  return (
                  <article
                    key={cloneKey}
                    className="tv-card group relative z-0 block w-44 md:w-52 shrink-0 aspect-[3/4] rounded-[22px] overflow-visible bg-transparent transform-gpu hover:z-50"
                  >
                    <div
                      className="relative h-full w-full rounded-[22px] overflow-hidden border border-gray-300/30 cursor-pointer"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <Link
                        href={`/vendors/${v.id}`}
                        className="absolute inset-0 z-20 block"
                        aria-label={`Voir ${v.name}`}
                      ></Link>
                      {v.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.avatarUrl} alt={v.name} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-black/5 text-black/50">—</div>
                      )}
                      {/* Gradient centre -> bas (plus sombre) */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          backgroundImage:
                            'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 88%, rgba(0,0,0,0.8) 100%)',
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-center gap-1 text-white text-sm font-medium translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          <span>{v.name}</span>
                          {v.verified ? <span title="Vérifié" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-1 ring-white/70">✓</span> : null}
                        </div>
                        {v.description || v.dateOfBirth ? (
                          <div className="mx-auto my-1 flex items-center justify-center gap-1">
                            <span className="inline-block h-0.5 w-6 bg-white/30"></span>
                            {v.dateOfBirth ? (
                              <span className="px-1 text-[10px] font-medium text-white/80">
                                {(() => {
                                  const d = v.dateOfBirth ? new Date(v.dateOfBirth) : null;
                                  if (!d || isNaN(d.getTime())) return '';
                                  const now = new Date();
                                  let age = now.getFullYear() - d.getFullYear();
                                  const m = now.getMonth() - d.getMonth();
                                  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
                                  return `${age} ans`;
                                })()}
                              </span>
                            ) : null}
                            <span className="inline-block h-0.5 w-6 bg-white/30"></span>
                          </div>
                        ) : null}
                        {v.description ? (
                          <div className="mt-1 text-[11px] leading-snug text-white/85 line-clamp-2">
                            {v.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );})}
              </div>
            </div>

            {/* Deuxième ligne, défilement inverse pour effet parallaxe */}
            <div
              ref={scrollerRef2}
              id="tv-scroller-2"
              className="overflow-x-auto overflow-y-visible scrollbar-none py-1 px-0 mt-0 touch-pan-y"
              style={{ transformStyle: "preserve-3d" }}
              onScroll={onScroll2}
            >
              <div className="tv-row relative flex gap-2 pr-6" style={{ perspective: "900px", perspectiveOrigin: "50% 55%", transformStyle: "preserve-3d", isolation: "isolate" }}>
                {displayItems.map((v, idx) => {
                  const cloneKey = `r-${v.id}-${idx}`;
                  return (
                  <article
                    key={cloneKey}
                    className="tv-card group relative z-0 block w-44 md:w-52 shrink-0 aspect-[3/4] rounded-[22px] overflow-visible bg-transparent transform-gpu hover:z-50"
                  >
                    <div
                      className="relative h-full w-full rounded-[22px] overflow-hidden border border-gray-300/30 cursor-pointer"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <Link
                        href={`/vendors/${v.id}`}
                        className="absolute inset-0 z-20 block"
                        aria-label={`Voir ${v.name}`}
                      ></Link>
                      {v.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.avatarUrl} alt={v.name} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-black/5 text-black/50">—</div>
                      )}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          backgroundImage:
                            'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 88%, rgba(0,0,0,0.8) 100%)',
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-center gap-1 text-white text-sm font-medium translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          <span>{v.name}</span>
                          {v.verified ? <span title="Vérifié" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-1 ring-white/70">✓</span> : null}
                        </div>
                        {v.description || v.dateOfBirth ? (
                          <div className="mx-auto my-1 flex items-center justify-center gap-1">
                            <span className="inline-block h-0.5 w-6 bg-white/30"></span>
                            {v.dateOfBirth ? (
                              <span className="px-1 text-[10px] font-medium text-white/80">
                                {(() => {
                                  const d = v.dateOfBirth ? new Date(v.dateOfBirth) : null;
                                  if (!d || isNaN(d.getTime())) return '';
                                  const now = new Date();
                                  let age = now.getFullYear() - d.getFullYear();
                                  const m = now.getMonth() - d.getMonth();
                                  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
                                  return `${age} ans`;
                                })()}
                              </span>
                            ) : null}
                            <span className="inline-block h-0.5 w-6 bg-white/30"></span>
                          </div>
                        ) : null}
                        {v.description ? (
                          <div className="mt-1 text-[11px] leading-snug text-white/85 line-clamp-2">
                            {v.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );})}
              </div>
            </div>
            {/* Masque latéral retiré pour des bords nets plein écran */}
            <style jsx>{`
              #tv-scroller { scrollbar-width: none; -ms-overflow-style: none; }
              #tv-scroller::-webkit-scrollbar { width: 0; height: 0; display: none; }
              #tv-scroller-2 { scrollbar-width: none; -ms-overflow-style: none; }
              #tv-scroller-2::-webkit-scrollbar { width: 0; height: 0; display: none; }
              .tv-card { transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 160ms cubic-bezier(0.2, 0.8, 0.2, 1); transition-delay: 0ms !important; transform-style: preserve-3d; will-change: transform, box-shadow; transform: translateZ(0); }
              /* même effet que le catalogue produit: légère élévation + scale douce + ombre douce */
              .tv-card:hover, .tv-card.is-hover { transform: translateY(-2px) scale(1.02); transform-origin: 50% 50%; z-index: 70; box-shadow: 0 10px 24px rgba(0,0,0,0.10); }
            `}</style>
            </>
          )}
        </div>
      </div>
    </section>
  );
}


