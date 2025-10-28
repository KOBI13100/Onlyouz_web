"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const isSeller = user?.role === 'vendeur';
  const [loading, setLoading] = React.useState(false);
  const [myProducts, setMyProducts] = React.useState<Array<{ id: string; price: number; sold?: boolean; soldAt?: string | null; createdAt?: string }>>([]);
  const [rangeStart, setRangeStart] = React.useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isSeller) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products/mine', {
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setMyProducts(Array.isArray(data) ? data : []);
        }
      } catch {}
      finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isSeller, token]);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const inRange = (d: Date) => {
    if (rangeStart && rangeEnd) return d >= startOfDay(rangeStart) && d <= endOfDay(rangeEnd);
    if (rangeStart && !rangeEnd) return d >= startOfDay(rangeStart);
    if (!rangeStart && rangeEnd) return d <= endOfDay(rangeEnd);
    return true;
  };

  const stats = React.useMemo(() => {
    const active = myProducts.filter(p => !p.sold).length;
    const soldAll = myProducts.filter(p => p.sold).length;
    const revenueAll = myProducts.filter(p => p.sold).reduce((acc, p) => acc + Number(p.price || 0), 0);
    const soldInRange = myProducts.filter(p => p.sold && p.soldAt && inRange(new Date(p.soldAt))).length;
    const revenueInRange = myProducts.filter(p => p.sold && p.soldAt && inRange(new Date(p.soldAt))).reduce((acc, p) => acc + Number(p.price || 0), 0);
    const now = new Date();
    const months: Array<{ key: string; label: string; value: number }> = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      months.push({ key, label, value: 0 });
    }
    const byKey = new Map(months.map(m => [m.key, m]));
    for (const p of myProducts) {
      if (!p.sold || !p.soldAt) continue;
      const d = new Date(p.soldAt);
      if (!inRange(d)) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.value += Number(p.price || 0);
    }
    const monthly = months;
    const maxV = Math.max(1, ...monthly.map(m => m.value));
    return { active, soldAll, revenueAll, soldInRange, revenueInRange, monthly, maxV };
  }, [myProducts, rangeStart, rangeEnd]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section removed per design */}

      <div className="p-0">
        <div className="max-w-6xl mx-auto">
          {/* Summary header */}
          <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5 mb-6 shadow-[0_6px_30px_rgba(0,0,0,0.06)] relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-black/60">Tableau de bord</div>
                <h2 className="mt-1 text-xl font-semibold text-black">Bonjour {user?.name} {!user?.name ? '' : '👋'}</h2>
                <p className="mt-1 text-sm text-black/60">{(() => {
                  if (!rangeStart && !rangeEnd) return 'Toutes les dates';
                  const fmt = (d: Date) => d.toLocaleDateString('fr-FR');
                  if (rangeStart && rangeEnd) return `${fmt(rangeStart)} → ${fmt(rangeEnd)}`;
                  if (rangeStart) return `Depuis le ${fmt(rangeStart)}`;
                  return `Jusqu\'au ${fmt(rangeEnd as Date)}`;
                })()}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <button
                  aria-label="Filtrer la période"
                  onClick={() => setFilterOpen(v => !v)}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-black/10 hover:bg-black/5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M3 5h18M6 12h12M10 19h4" />
                  </svg>
                </button>
              </div>
            </div>
            {filterOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                  onClick={() => setFilterOpen(false)}
                />
                {/* Centered modal */}
                <div className="fixed inset-0 z-50 grid place-items-center p-3">
                  <div
                    className="w-[min(95vw,900px)] rounded-2xl border border-black/10 bg-white p-4 md:p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <div className="text-xs font-semibold mb-2">Raccourcis</div>
                    <div className="flex flex-col gap-2">
                      <button className="px-2.5 py-1.5 rounded-md border border-black/15 text-xs hover:bg-black/5" onClick={() => { const d=new Date(); const s=new Date(d.getFullYear(), d.getMonth(), 1); const e=new Date(d.getFullYear(), d.getMonth()+1, 0); setRangeStart(s); setRangeEnd(e); setCalendarMonth(new Date(s.getFullYear(), s.getMonth(), 1)); }}>Ce mois-ci</button>
                      <button className="px-2.5 py-1.5 rounded-md border border-black/15 text-xs hover:bg-black/5" onClick={() => { const d=new Date(); const day=d.getDay(); const monday=new Date(d); monday.setDate(d.getDate()-((day+6)%7)); const sunday=new Date(monday); sunday.setDate(monday.getDate()+6); setRangeStart(monday); setRangeEnd(sunday); }}>Cette semaine</button>
                      <button className="px-2.5 py-1.5 rounded-md border border-black/15 text-xs hover:bg-black/5" onClick={() => { const d=new Date(); const day=d.getDay(); const mondayThis=new Date(d); mondayThis.setDate(d.getDate()-((day+6)%7)); const mondayLast=new Date(mondayThis); mondayLast.setDate(mondayThis.getDate()-7); const sundayLast=new Date(mondayLast); sundayLast.setDate(mondayLast.getDate()+6); setRangeStart(mondayLast); setRangeEnd(sundayLast); }}>Semaine dernière</button>
                      <button className="px-2.5 py-1.5 rounded-md border border-black/15 text-xs hover:bg-black/5" onClick={() => { const end=new Date(); const start=new Date(); start.setDate(end.getDate()-29); setRangeStart(start); setRangeEnd(end); }}>30 derniers jours</button>
                      <button className="px-2.5 py-1.5 rounded-md border border-black/15 text-xs hover:bg-black/5" onClick={() => { setRangeStart(null); setRangeEnd(null); }}>Effacer</button>
                    </div>
                    <div className="mt-3 text-[11px] text-black/60">Sélection: {(() => { if (!rangeStart && !rangeEnd) return 'Toutes les dates'; const fmt=(d:Date)=>d.toLocaleDateString('fr-FR'); if (rangeStart && rangeEnd) return `${fmt(rangeStart)} → ${fmt(rangeEnd)}`; if (rangeStart) return `Depuis le ${fmt(rangeStart)}`; return `Jusqu\'au ${fmt(rangeEnd as Date)}`; })()}</div>
                  </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <button className="h-8 w-8 grid place-items-center rounded-md border border-black/10 hover:bg-black/5" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))}>{"<"}</button>
                          <div className="text-sm font-medium">{calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                          <button className="h-8 w-8 grid place-items-center rounded-md border border-black/10 hover:bg-black/5" onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))}>{">"}</button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-[11px] text-black/60">
                          {["L","M","M","J","V","S","D"].map((d,i)=>(<div key={i} className="py-1 text-center">{d}</div>))}
                          {(() => {
                            const firstDay=new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                            const startIdx=(firstDay.getDay()+6)%7;
                            const days: JSX.Element[]=[];
                            for(let i=0;i<startIdx;i++) days.push(<div key={`e${i}`} />);
                            const lastDate=new Date(calendarMonth.getFullYear(), calendarMonth.getMonth()+1, 0).getDate();
                            for(let d=1; d<=lastDate; d++){
                              const date=new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d);
                              const equal=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
                              const selected=(rangeStart && equal(rangeStart,date)) || (rangeEnd && equal(rangeEnd,date));
                              const between=rangeStart && rangeEnd && date>rangeStart && date<rangeEnd;
                              days.push(
                                <button key={`d${d}`} onClick={()=>{ if(!rangeStart || (rangeStart && rangeEnd)){ setRangeStart(date); setRangeEnd(null);} else { if(date<rangeStart){ setRangeEnd(rangeStart); setRangeStart(date);} else { setRangeEnd(date);} } }} className={`py-1.5 rounded-md text-xs text-center border ${selected?'bg-black text-white border-black':between?'bg-black/5 border-black/10':'border-transparent hover:bg-black/5'}`}>{d}</button>
                              );
                            }
                            return days;
                          })()}
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button className="px-3 py-1.5 rounded-md border border-black/15 text-xs hover:bg-black/5" onClick={()=>setFilterOpen(false)}>Fermer</button>
                          <button className="px-3 py-1.5 rounded-md bg-black text-white text-xs" onClick={()=>setFilterOpen(false)}>Appliquer</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stats and charts */}
            <div className="grid gap-4 lg:grid-cols-3 mb-6">
            {/* Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {/* Revenu total (compact) */}
              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="text-xs text-black/60">Revenu total (période)</div>
                <div className="mt-1 text-2xl font-semibold text-black">{formatCurrency(stats.revenueInRange)}</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="text-xs text-black/60">Produits actifs</div>
                <div className="mt-1 text-2xl font-semibold text-black">{stats.active}</div>
                <div className="mt-2 text-[11px] text-black/50">Articles en vente</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="text-xs text-black/60">Ventes sur période</div>
                <div className="mt-1 text-2xl font-semibold text-black">{stats.soldInRange}</div>
                <div className="mt-2 text-[11px] text-black/50">Nombre d'articles vendus</div>
              </div>
            </div>

            {/* Line chart */}
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-black">Aperçu mensuel</div>
                <div className="text-xs text-black/60">8 derniers mois</div>
              </div>
              {/* Removed month chips above chart */}
              <div className="relative mt-2 h-28 w-full">
                <svg viewBox="0 0 320 120" className="w-full h-full" onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = e.clientX - rect.left;
                  const x320 = Math.max(10, Math.min(310, (relX / rect.width) * 320));
                  const t = (x320 - 10) / 300;
                  const i = Math.round(t * (stats.monthly.length - 1));
                  setHoverIdx(i);
                }} onMouseLeave={() => setHoverIdx(null)} onClick={() => {
                  if (hoverIdx == null) return;
                  const key = stats.monthly[hoverIdx]?.key;
                  if (key) toggleMonth(key);
                }}>
                  <defs>
                    <linearGradient id="gradLine" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const pts = stats.monthly.map((m, i) => {
                      const x = (i / (stats.monthly.length - 1)) * 300 + 10;
                      const y = 110 - (m.value / stats.maxV) * 100;
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <>
                        <polyline fill="none" stroke="url(#gradLine)" strokeWidth="2" strokeLinecap="round" points={pts} />
                        {stats.monthly.map((m, i) => {
                          const x = (i / (stats.monthly.length - 1)) * 300 + 10;
                          const y = 110 - (m.value / stats.maxV) * 100;
                          return <circle key={m.key} cx={x} cy={y} r="3" fill="#111" />
                        })}
                      </>
                    );
                  })()}
                </svg>
                {hoverIdx !== null && (() => {
                  const m = stats.monthly[hoverIdx];
                  if (!m) return null;
                  const x = (hoverIdx / (stats.monthly.length - 1)) * 300 + 10;
                  const y = 110 - (m.value / stats.maxV) * 100;
                  const left = `${(x / 320) * 100}%`;
                  const top = `${(y / 120) * 100}%`;
                  return (
                    <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-3 rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] text-black shadow-sm" style={{ left, top }}>
                      <div className="font-medium">{m.label}</div>
                      <div className="text-black/70">{formatCurrency(m.value)}</div>
                    </div>
                  );
                })()}
              </div>
              {/* Removed month labels row */}
            </div>

            {/* Donut */}
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-black">Répartition</div>
              <div className="mt-3 flex items-center gap-5">
                <div
                  className="relative h-28 w-28 rounded-full"
                  style={{
                    background: `conic-gradient(#0a0a0a ${stats.soldInRange + stats.active > 0 ? (stats.soldInRange / (stats.soldInRange + stats.active)) * 360 : 0}deg, #e5e7eb 0deg)`
                  }}
                >
                  <div className="absolute inset-2 rounded-full bg-white grid place-items-center">
                    <div className="text-sm font-semibold text-black">{stats.soldInRange}</div>
                    <div className="text-[10px] text-black/50">vendus</div>
                  </div>
                </div>
                <div className="text-[12px] text-black/70 space-y-1">
                  <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-black" /> Vendus</div>
                  <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-gray-200" /> Actifs</div>
                </div>
              </div>
              {/* Removed month chips under donut */}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-black/10 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-black mb-1">Actions rapides</h2>
              <p className="text-sm text-black/60">Accédez rapidement aux fonctionnalités principales</p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {isSeller ? (
                <a 
                  href="/mon-espace/mes-produits" 
                  className="flex items-center gap-4 p-3 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
                >
                  <div className="p-3 bg-black/10 rounded-xl">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Mes produits</div>
                    <div className="text-xs text-black/60">Gérer mes annonces</div>
                  </div>
                </a>
              ) : (
                <a 
                  href="/products" 
                  className="flex items-center gap-4 p-3 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
                >
                  <div className="p-3 bg-black/10 rounded-xl">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                      <path d="M12 1v22M3 6h18M3 12h18M3 18h18" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Parcourir le catalogue</div>
                    <div className="text-xs text-black/60">Acheter de nouveaux produits</div>
                  </div>
                </a>
              )}

              <a 
                href="/mon-espace/messages" 
                className="flex items-center gap-4 p-3 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
              >
                <div className="p-3 bg-black/10 rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-black">Messages</div>
                  <div className="text-xs text-black/60">Conversations clients</div>
                </div>
              </a>

              <a 
                href="/mon-espace/profile" 
                className="flex items-center gap-4 p-3 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
              >
                <div className="p-3 bg-black/10 rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="M20 21a8 8 0 10-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-black">Mon profil</div>
                  <div className="text-xs text-black/60">Informations personnelles</div>
                </div>
              </a>
            </div>
          </div>

          {/* Sections acheteur: favoris et achats */}
          {!isSeller && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Mes favoris</h3>
                <div className="text-xs text-black/60">Bientôt: vos produits enregistrés</div>
              </section>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Mes achats</h3>
                <div className="text-xs text-black/60">Bientôt: historique d’achats</div>
              </section>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Mes conversations récentes</h3>
                  <a href="/mon-espace/messages" className="text-xs text-black/60 hover:text-black">Voir tout</a>
                </div>
                {/* Placeholder conversations; remplacez par des données réelles */}
                <div className="space-y-2">
                  {/* Etat vide */}
                  <div className="text-xs text-black/60">Vous n'avez aucune conversation récente</div>
                  {/* Exemple de carte conversation (commentée jusqu’à branchement des données) */}
                  {false && [
                    { id: 1, name: 'Boutique Sakura', lastAt: 'il y a 2h', unread: 2 },
                    { id: 2, name: 'Atelier Orion', lastAt: 'hier', unread: 0 },
                    { id: 3, name: 'Maison Éclipse', lastAt: 'il y a 3 jours', unread: 1 },
                  ].sort((a,b)=>a.id-b.id).map((c) => (
                    <a key={c.id} href={`/mon-espace/messages?peer=${c.id}`} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3 hover:bg-black/5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-black/10" />
                        <div>
                          <div className="text-sm font-medium text-black">{c.name}</div>
                          <div className="text-[11px] text-black/60">Dernier message {c.lastAt}</div>
                        </div>
                      </div>
                      {c.unread > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white">
                          {c.unread}
                        </span>
                      ) : (
                        <span className="text-[11px] text-black/40">Lu</span>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


