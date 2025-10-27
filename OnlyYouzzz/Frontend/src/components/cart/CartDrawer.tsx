"use client";
import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
};

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const load = React.useCallback(async () => {
    try {
      const raw = localStorage.getItem("oy_cart") || "[]";
      const ids: string[] = JSON.parse(raw);
      if (!Array.isArray(ids) || ids.length === 0) {
        setItems([]);
        return;
      }
      const products = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`${base}/api/products/${id}`, { cache: "no-store" });
            if (!res.ok) throw new Error("not ok");
            const p = await res.json();
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              sellerId: p.sellerId ?? null,
              sellerName: p.sellerName ?? null,
              sellerAvatarUrl: p.sellerAvatarUrl ?? null,
            } as CartItem;
          } catch {
            return null;
          }
        })
      );
      setItems(products.filter(Boolean) as CartItem[]);
    } catch {
      setItems([]);
    }
  }, [base]);

  React.useEffect(() => { setMounted(true); }, []);
  React.useEffect(() => { if (open) load(); }, [open, load]);

  const removeItem = (id: string) => {
    try {
      const raw = localStorage.getItem("oy_cart") || "[]";
      let ids: string[] = [];
      try { ids = JSON.parse(raw); } catch { ids = []; }
      ids = ids.filter((x) => x !== id);
      localStorage.setItem("oy_cart", JSON.stringify(ids));
    } finally {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const totalCount = items.length;
  const totalPrice = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);

  const drawer = (
    <div className={`fixed inset-0 z-[9999] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-[360px] md:w-[420px] bg-white border-l border-black/10 shadow-2xl
        transition-transform duration-300 will-change-transform ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
          <h3 className="text-base font-semibold text-black">Panier</h3>
          <button
            onClick={onClose}
            aria-label="Fermer le panier"
            className="close-x group inline-flex h-8 w-8 items-center justify-center text-black/70 hover:text-black"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-black/60">Votre panier est vide.</div>
          ) : (
            <ul className="divide-y divide-black/10">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/products/${it.id}`} className="flex items-center gap-3 flex-1 min-w-0" onClick={onClose}>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {it.imageUrl ? (
                        <img src={it.imageUrl} alt={it.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-black">{it.name}</div>
                      <div className="text-sm text-black/70">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(it.price || 0)}</div>
                    </div>
                  </Link>
                  <div className="flex flex-col items-center w-16">
                    <Link href={it.sellerId ? `/vendors/${it.sellerId}` : '#'} onClick={onClose} className="group inline-flex flex-col items-center">
                      <span className="h-8 w-8 overflow-hidden rounded-full bg-black/5 ring-1 ring-black/10 mb-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {it.sellerAvatarUrl ? (
                          <img src={it.sellerAvatarUrl} alt={it.sellerName || 'Vendeur'} className="h-full w-full object-cover" />
                        ) : null}
                      </span>
                      {it.sellerName ? (
                        <span className="block w-full truncate text-[10px] text-black/70 group-hover:underline text-center">{it.sellerName}</span>
                      ) : null}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    aria-label="Retirer du panier"
                    className="close-x group inline-flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-700"
                    title="Retirer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length ? (
          <div className="border-t border-black/10 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <div className="text-black/70">{totalCount} {totalCount > 1 ? 'articles' : 'article'}</div>
              <div className="font-semibold text-black">{Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalPrice)}</div>
            </div>
            <Link href="/products" className="block w-full rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white text-center hover:bg-black/90" onClick={onClose}>
              Commander
            </Link>
          </div>
        ) : null}
      </aside>
      <style jsx>{`
        .close-x:hover svg { animation: rotateHalf 0.033s linear; transform-origin: 50% 50%; }
        @keyframes rotateHalf { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
      `}</style>
    </div>
  );

  if (!mounted) return null;
  return createPortal(drawer, document.body);
}


