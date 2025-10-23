"use client";
import React from "react";
import ProductForm from "@/components/vendor/ProductForm";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";

type SortOption = 'price-asc' | 'price-desc' | 'date-desc' | 'date-asc';

export default function MesProduitsPage() {
  const { token } = useAuth();
  const [items, setItems] = React.useState<Array<{ id: string; name: string; description: string; price: number; imageUrl?: string | null; createdAt?: string; sold?: boolean; soldAt?: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortOption>('date-desc');
  const [view, setView] = React.useState<'onSale' | 'sold'>('onSale');

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${base}/api/products/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Empêche le scroll de l'arrière-plan quand le modal est ouvert
  React.useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [open]);

  const { onSale, sold } = React.useMemo(() => {
    const onSale = items.filter(i => !i.sold);
    const sold = items.filter(i => i.sold);
    return { onSale, sold };
  }, [items]);

  const sortList = React.useCallback((list: typeof items) => {
    const sorted = [...list];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'date-asc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA.getTime() - dateB.getTime();
        });
      case 'date-desc':
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
    }
  }, [sortBy]);

  return (
    <div className="space-y-6">
      {open && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-black/50 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl border border-black/10 bg-white/95 backdrop-blur px-5 py-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-semibold">Ajouter un produit</div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm hover:bg-black/5">Fermer</button>
            </div>
            <ProductForm
              onCreated={() => {
                setOpen(false);
                load();
              }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('onSale')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border ${view === 'onSale' ? 'bg-black text-white border-black' : 'border-black/10 text-black hover:bg-black/5'}`}
                aria-pressed={view === 'onSale'}
              >
                En vente
              </button>
              <button
                type="button"
                onClick={() => setView('sold')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border ${view === 'sold' ? 'bg-black text-white border-black' : 'border-black/10 text-black hover:bg-black/5'}`}
                aria-pressed={view === 'sold'}
              >
                Vendus
              </button>
            </div>
            <label htmlFor="sort-select" className="text-sm font-medium text-black/70">
              Trier par :
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="date-desc">Plus récent en premier</option>
              <option value="date-asc">Plus ancien en premier</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un produit
          </button>
        </div>
        {(() => {
          const currentList = view === 'onSale' ? onSale : sold;
          return (
            <div className="text-xs text-black/50 mb-[20px]">{currentList.length} produit{currentList.length > 1 ? 's' : ''} · {view === 'onSale' ? 'En vente' : 'Vendus'}</div>
          );
        })()}
        {loading ? (
          <div className="grid place-items-center py-10 text-sm text-black/60">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center py-16">
            <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur px-6 py-8 text-center shadow-sm">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/70">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <div className="text-sm text-black/60">Aucun produit pour le moment</div>
            </div>
          </div>
        ) : (
          (() => {
            const currentList = view === 'onSale' ? onSale : sold;
            const sorted = sortList(currentList);
            const isSold = view === 'sold';
            if (!sorted.length) {
              return (
                <div className="text-sm text-black/60">{isSold ? 'Aucun produit vendu encore.' : 'Aucun produit en vente pour le moment.'}</div>
              );
            }
            return (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((p) => (
                  <div key={p.id} onClick={() => !isSold && window.location.assign(`/products/${p.id}`)} className={`group relative ${!isSold ? 'cursor-pointer' : ''} rounded-2xl border border-black/10 ${isSold ? 'bg-white/70' : 'bg-white/90'} shadow-sm overflow-hidden transition-transform duration-300 ${!isSold ? 'hover:-translate-y-0.5 hover:shadow-md' : ''}`}>
                    <div className="relative mb-3 aspect-square w-full overflow-hidden bg-black/[0.03]">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill className={`object-cover ${isSold ? 'grayscale' : ''}`} />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-black/50">Pas d'image</div>
                      )}
                      <div className={`pointer-events-none absolute inset-0 ${isSold ? 'bg-gradient-to-t from-black/20 via-transparent to-transparent' : 'bg-gradient-to-t from-black/10 via-transparent to-transparent'}`} />
                      <div className={`absolute right-3 top-3 rounded-full ${isSold ? 'bg-black/90 text-white' : 'bg-white/90 text-black'} px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur`}>
                        {isSold ? 'Vendu' : `${p.price.toFixed(2)} €`}
                      </div>
                    </div>
                    <div className="space-y-1 p-4">
                      <div className={`text-base font-medium tracking-tight ${isSold ? 'line-through decoration-black/30' : ''}`}>{p.name}</div>
                      <div className="line-clamp-2 text-sm text-black/60">{p.description}</div>
                      {isSold && p.soldAt ? <div className="pt-1 text-xs text-black/50">Vendu le {new Date(p.soldAt).toLocaleDateString()}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}


