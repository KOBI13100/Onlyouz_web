"use client";
import React from "react";
import Link from "next/link";
import SiteFooter from "@/components/home/SiteFooter";

type Vendor = { id: string; name: string; email?: string; avatarUrl?: string | null; verified?: boolean };

export default function VendorsListPage() {
  const [q, setQ] = React.useState<string>("");
  const [items, setItems] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [ready, setReady] = React.useState<boolean>(false);
  const [total, setTotal] = React.useState<number | null>(null);
  const [sort, setSort] = React.useState<'popular' | 'new' | ''>('');
  const [page, setPage] = React.useState(0);
  // pagination immédiate, pas d'état d'attente
  const [cols, setCols] = React.useState(1);
  const [rows, setRows] = React.useState(1);
  // Animation de slide
  const [isPaging, setIsPaging] = React.useState(false);
  const [slideDir, setSlideDir] = React.useState<null | 'next' | 'prev'>(null);
  const [slideActive, setSlideActive] = React.useState(false); // déclenche la transition
  const [snapshot, setSnapshot] = React.useState<Vendor[]>([]); // page courante (outgoing)
  const [incoming, setIncoming] = React.useState<Vendor[]>([]); // page suivante/précédente (incoming)
  const idleRef = React.useRef<HTMLDivElement | null>(null);
  const [wrapperHeight, setWrapperHeight] = React.useState<number | null>(null);
  const [preNext, setPreNext] = React.useState<Vendor[]>([]);
  const [prePrev, setPrePrev] = React.useState<Vendor[]>([]);

  const fetchData = React.useCallback(async (search: string, sortKey: 'popular' | 'new' | '') => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const qs = new URLSearchParams();
      if (search) qs.set('name', search);
      if (sortKey) qs.set('sort', sortKey);
      const url = `${base}/api/vendors${qs.toString() ? `?${qs.toString()}` : ''}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }

      try {
        const resCount = await fetch(`${base}/api/vendors/count`, { cache: "no-store" });
        if (resCount.ok) {
          const dataCount = await resCount.json();
          setTotal(typeof dataCount?.total === 'number' ? dataCount.total : null);
        } else {
          setTotal(null);
        }
      } catch {
        setTotal(null);
      }
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = (params.get("q") || "").trim();
    const s = (params.get('sort') || '').trim();
    setQ(search);
    if (s === 'popular' || s === 'new') setSort(s);
    fetchData(search, (s === 'popular' || s === 'new') ? s : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showEmpty = ready && !loading && items.length === 0;
  // Taille de page fixe: 5 éléments par "slide"
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = React.useMemo(() => {
    const start = currentPage * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage]);

  // Précharger en permanence les 5 vendeurs de la page suivante (et précédente)
  React.useEffect(() => {
    const nextPage = Math.min(totalPages - 1, currentPage + 1);
    const prevPage = Math.max(0, currentPage - 1);
    const startNext = nextPage * pageSize;
    const startPrev = prevPage * pageSize;
    const nextItems = items.slice(startNext, startNext + pageSize);
    const prevItems = items.slice(startPrev, startPrev + pageSize);
    setPreNext(nextItems);
    setPrePrev(prevItems);
    // Précharger les images en cache navigateur
    if (typeof window !== 'undefined') {
      const urls: string[] = [];
      nextItems.forEach(v => { if (v.avatarUrl) urls.push(v.avatarUrl); });
      prevItems.forEach(v => { if (v.avatarUrl) urls.push(v.avatarUrl); });
      urls.forEach(src => { try { const img = new Image(); img.src = src; } catch {} });
    }
  }, [items, currentPage, totalPages, pageSize]);

  React.useEffect(() => {
    setPage(0);
  }, [q, sort]);

  // Déterminer dynamiquement colonnes (selon grille) et nb de lignes par écran
  React.useEffect(() => {
    const computeLayout = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      // Forcer 4 colonnes dès md et +, 2 colonnes sur sm, 1 en dessous
      if (w >= 768) setCols(4); // md, lg, xl, 2xl
      else if (w >= 640) setCols(2); // sm
      else setCols(1);
      // Lignes: <1536px (< ~15") = 1, 1536-1919px (≈15") = 2, >=1920px = 3
      if (w >= 1920) setRows(3);
      else if (w >= 1536) setRows(2);
      else setRows(1);
    };
    computeLayout();
    window.addEventListener('resize', computeLayout, { passive: true });
    return () => window.removeEventListener('resize', computeLayout);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // remonter instantanément sans animation
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentPage]);

  return (
    <div className="space-y-6 reveal" data-reveal>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between" data-reveal-group data-reveal-base="0" data-reveal-step="100">
        <div data-reveal-group data-reveal-step="80">
          <h1 className="text-xl font-semibold">Tous les vendeurs</h1>
          <div className="mt-1 text-xs text-black/50">
            {typeof total === 'number' ? `${total} ${total === 1 ? 'vendeur' : 'vendeurs'}` : '…'}
          </div>
        </div>
        <div className="flex items-center gap-2" data-reveal-group data-reveal-step="80">
          {/* Toggle moderne avec indicateur animé */}
          <div className="relative grid grid-cols-2 rounded-full border border-gray-300 bg-white/80 p-1 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <span
              className={`pointer-events-none absolute inset-1 rounded-full bg-black/90 shadow-sm transition-transform duration-200 ${sort ? 'opacity-100' : 'opacity-0'}`}
              style={{
                width: 'calc(50% - 4px)',
                transform: sort === 'new' ? 'translateX(100%)' : 'translateX(0%)',
              }}
            />
            <button
              type="button"
              onClick={() => {
                const next = sort === 'popular' ? '' : 'popular';
                setSort(next as 'popular' | 'new' | '');
                fetchData(q, next as 'popular' | 'new' | '');
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (next) params.set('sort', next);
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full text-center focus:outline-none focus-visible:outline-none ${sort === 'popular' ? 'text-white' : 'text-black/80 hover:text-black'}`}
            >
              Populaire
            </button>
            <button
              type="button"
              onClick={() => {
                const next = sort === 'new' ? '' : 'new';
                setSort(next as 'popular' | 'new' | '');
                fetchData(q, next as 'popular' | 'new' | '');
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (next) params.set('sort', next);
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full text-center focus:outline-none focus-visible:outline-none ${sort === 'new' ? 'text-white' : 'text-black/80 hover:text-black'}`}
            >
              Nouveau
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const input = form.querySelector('input[name="q"]') as HTMLInputElement | null;
              const value = (input?.value || '').trim();
              setQ(value);
              fetchData(value, sort);
              const params = new URLSearchParams();
              if (value) params.set('q', value);
              if (sort) params.set('sort', sort);
              window.history.replaceState(null, '', `?${params.toString()}`);
            }}
            className="relative"
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher…"
              className="w-[160px] rounded-full border border-gray-300 bg-white/90 px-4 py-2 text-xs placeholder-black/40 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] outline-none"
            />
            <button type="submit" aria-label="Rechercher" className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white shadow-sm hover:bg-black/90">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-black/60">Chargement…</div>
      ) : showEmpty ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">pas de vendeurs trouvés</div>
      ) : (
        <>
        {(() => {
          const displayItems: Vendor[] = pageItems;
          return (
        <div className="relative overflow-hidden mt-15" data-reveal-group data-reveal-base="0" data-reveal-step="80" style={{ height: isPaging && wrapperHeight ? wrapperHeight : undefined }}>
          {/* Panneau sortant */}
          {isPaging ? (
            <div
              className="absolute inset-0"
              style={{
                transform: slideActive ? `translateX(${slideDir === 'next' ? '-100%' : '100%'})` : 'translateX(0%)',
                transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
              }}
            >
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                {snapshot.map((v) => (
                  <Link key={`snap-${v.id}`} href={`/vendors/${v.id}`} className={`group relative block aspect-[3/4] overflow-hidden rounded-[20px] border border-gray-300 bg-black/5 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)]`}>
                    {v.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.avatarUrl} alt={v.name} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-black/40">—</div>
                    )}
                    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.36) 80%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.85) 100%)' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-end px-3 pb-8">
                      <div className="flex items-center justify-center gap-1 text-white text-sm font-semibold tracking-tight text-center">
                        <span>{v.name}</span>
                        {v.verified ? <span title="Vérifié" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-1 ring-white/70">✓</span> : null}
                      </div>
                      <div className="mt-2"><span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-black shadow-sm">Voir le profil</span></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Panneau entrant */}
          {isPaging ? (
            <div
              className="absolute inset-0"
              style={{
                transform: slideActive ? 'translateX(0%)' : `translateX(${slideDir === 'next' ? '100%' : '-100%'})`,
                transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
              }}
            >
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                {incoming.map((v) => (
                  <Link key={`inc-${v.id}`} href={`/vendors/${v.id}`} className={`group relative block aspect-[3/4] overflow-hidden rounded-[20px] border border-gray-300 bg-black/5 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)]`}>
                    {v.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.avatarUrl} alt={v.name} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-black/40">—</div>
                    )}
                    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.36) 80%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.85) 100%)' }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-end px-3 pb-8">
                      <div className="flex items-center justify-center gap-1 text-white text-sm font-semibold tracking-tight text-center">
                        <span>{v.name}</span>
                        {v.verified ? <span title="Vérifié" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-1 ring-white/70">✓</span> : null}
                      </div>
                      <div className="mt-2"><span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-black shadow-sm">Voir le profil</span></div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Panneau idle (pas d'animation) */}
          {(!isPaging) ? (
            <div className="relative" ref={idleRef}>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                {displayItems.map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className={`group relative block aspect-[3/4] overflow-hidden rounded-[20px] border border-gray-300 bg-black/5 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}
                >
                  {v.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.avatarUrl} alt={v.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-black/40">—</div>
                  )}
                  <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.36) 80%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.85) 100%)' }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-end px-3 pb-8">
                    <div className="flex items-center justify-center gap-1 text-white text-sm font-semibold tracking-tight text-center">
                      <span>{v.name}</span>
                      {v.verified ? <span title="Vérifié" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-1 ring-white/70">✓</span> : null}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-black shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:scale-[1.03]">
                        Voir le profil
                      </span>
                    </div>
                  </div>
                </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
          );
        })()}
        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (currentPage === 0 || isPaging) return;
                const prevPage = Math.max(0, currentPage - 1);
                const prevItems = prePrev;
                // Mesurer la hauteur courante pour stabiliser le conteneur
                try { setWrapperHeight(idleRef.current ? idleRef.current.offsetHeight : null); } catch {}
                setSnapshot(pageItems);
                setIncoming(prevItems);
                setIsPaging(true);
                setSlideDir('prev');
                setSlideActive(false);
                requestAnimationFrame(() => setSlideActive(true));
                // Fin d'anim -> commit
                setTimeout(() => {
                  setPage(prevPage);
                  setIsPaging(false);
                  setSlideDir(null);
                  setSlideActive(false);
                  setIncoming([]);
                  setSnapshot([]);
                  setWrapperHeight(null);
                }, 600);
              }}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border border-black/10 hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Précédente
            </button>
            <div className="text-xs text-black/60">Page {currentPage + 1} / {totalPages}</div>
            <button
              type="button"
              onClick={() => {
                if (currentPage >= totalPages - 1 || isPaging) return;
                const nextPage = Math.min(totalPages - 1, currentPage + 1);
                const nextItems = preNext;
                // Mesurer la hauteur courante pour stabiliser le conteneur
                try { setWrapperHeight(idleRef.current ? idleRef.current.offsetHeight : null); } catch {}
                setSnapshot(pageItems);
                setIncoming(nextItems);
                setIsPaging(true);
                setSlideDir('next');
                setSlideActive(false);
                requestAnimationFrame(() => setSlideActive(true));
                // Fin d'anim -> commit
                setTimeout(() => {
                  setPage(nextPage);
                  setIsPaging(false);
                  setSlideDir(null);
                  setSlideActive(false);
                  setIncoming([]);
                  setSnapshot([]);
                  setWrapperHeight(null);
                }, 600);
              }}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border border-black/10 hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivante
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        ) : null}
        </>
      )}
      <div className="mt-[120px]">
        <SiteFooter />
      </div>
    </div>
  );
}


