"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/home/SiteFooter";

type SortOption = 'price-asc' | 'price-desc' | 'date-desc' | 'date-asc';

type Product = {
  id: string;
  sellerId?: string;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  createdAt?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<SortOption>('date-desc');
  const [page, setPage] = React.useState(0);
  const [isPaging, setIsPaging] = React.useState(false);
  const router = useRouter();

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${base}/api/products`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Erreur chargement produits: HTTP ${res.status}`);
      }
      const data = await res.json() as Product[];
      setProducts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const sortedProducts = React.useMemo(() => {
    const sorted = [...products];
    
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
  }, [products, sortBy]);

  const pageSize = 10; // 5 colonnes x 2 lignes
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = React.useMemo(() => {
    const start = currentPage * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage]);

  React.useEffect(() => {
    // Réinitialiser la page si le tri change ou si la page dépasse le max
    setPage(0);
  }, [sortBy]);

  React.useEffect(() => {
    // Remonter en haut à chaque changement de page
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  return (
    <div className="px-4" data-reveal>
      <div className="mb-6 flex items-center justify-between" data-reveal-group data-reveal-base="0" data-reveal-step="100">
        <h1 className="text-2xl font-semibold">Produits</h1>
        <div className="flex items-center gap-4">
          <label htmlFor="sort-select" className="text-sm font-medium text-black/70">
            Trier par :
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="date-desc">Plus récent en premier</option>
            <option value="date-asc">Plus ancien en premier</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <p className="text-sm text-black/60">Chargement des produits…</p>
      ) : sortedProducts.length === 0 ? (
        <p className="text-sm text-black/60">Aucun produit pour le moment.</p>
      ) : (
        <>
        {(() => {
          const displayItems: (Product | null)[] = isPaging ? Array.from({ length: pageSize }, () => null) : pageItems;
          return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" data-reveal-group data-reveal-base="0" data-reveal-step="80">
          {displayItems.map((p, idx) => (
            <div
              key={p ? p.id : `skeleton-${idx}`}
              role="link"
              tabIndex={0}
              onClick={!isPaging && p ? (() => router.push(`/products/${p.id}`)) : undefined}
              onKeyDown={!isPaging && p ? ((e) => { if (e.key === 'Enter') router.push(`/products/${p.id}`); }) : undefined}
              className={`group relative overflow-hidden rounded-[16px] bg-white/80 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] transition-transform duration-200 will-change-transform ${isPaging ? '' : 'hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)]'} ${isPaging ? '' : 'cursor-pointer'}`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/[0.03]" data-reveal>
                {!isPaging && p && p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full animate-pulse bg-black/10" />
                )}
                <div className="pointer-events-none absolute inset-0 z-10" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.7) 88%, rgba(0,0,0,0.95) 100%)' }} />
                {!isPaging && p && p.sellerId ? (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/vendors/${p.sellerId}`); }}
                    className="absolute left-2 top-2 z-20"
                    aria-label="Voir le profil du vendeur"
                  >
                    <span className="relative block h-7 w-7 md:h-8 md:w-8 overflow-hidden rounded-full bg-black/15 p-[1px]">
                      {p.sellerAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.sellerAvatarUrl} alt={p.sellerName || 'Vendeur'} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <span className="grid h-full w-full place-items-center bg-white/90 text-[10px] text-black font-medium rounded-full">
                          {(p.sellerName || '').slice(0,1).toUpperCase() || '•'}
                        </span>
                      )}
                    </span>
                  </button>
                ) : null}
                {!isPaging && p && p.sellerId && p.sellerName ? (
                  <div className="pointer-events-auto absolute top-2 left-12 right-2 z-20">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/vendors/${p.sellerId}`); }}
                      className="w-auto truncate whitespace-nowrap text-left text-xs font-medium text-white bg-black/50 rounded-full px-4 py-1 leading-snug"
                    >
                      @{p.sellerName}
                    </button>
                  </div>
                ) : null}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 px-2 text-center">
                  <h2 className="mt-1 truncate text-xs font-medium text-white max-w-[90%]">{!isPaging && p ? p.name : ' '}</h2>
                  <div className="mt-1 text-[11px] font-normal text-white/90">{!isPaging && p ? `${p.price.toFixed(2)} €` : ' '}</div>
                  <div className="mt-2 flex justify-center">
                    <span className="inline-flex rounded-full bg-white/95 text-black px-3 py-1 text-xs font-medium shadow-sm ${isPaging ? '' : 'transition-transform group-hover:-translate-y-0.5 group-hover:scale-[1.03]'}">
                      {isPaging ? ' ' : 'Consulter'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
          );
        })()}
        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (currentPage === 0) return;
                setIsPaging(true);
                setTimeout(() => {
                  setPage((p) => Math.max(0, p - 1));
                  setIsPaging(false);
                }, 350);
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
                if (currentPage >= totalPages - 1) return;
                setIsPaging(true);
                setTimeout(() => {
                  setPage((p) => Math.min(totalPages - 1, p + 1));
                  setIsPaging(false);
                }, 350);
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
