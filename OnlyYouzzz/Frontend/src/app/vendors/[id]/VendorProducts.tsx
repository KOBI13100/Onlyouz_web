"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

type P = { id: string; name: string; description: string; price: number; imageUrl?: string | null };

export default function VendorProducts({ products }: { products: P[] }) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"recent" | "priceAsc" | "priceDesc">("recent");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    if (sort === "priceAsc") arr = arr.slice().sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") arr = arr.slice().sort((a, b) => b.price - a.price);
    return arr;
  }, [products, query, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un produit"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10 sm:max-w-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="recent">Plus récent</option>
          <option value="priceAsc">Prix croissant</option>
          <option value="priceDesc">Prix décroissant</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-black/60">Aucun produit.</p>
      ) : (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-[14px] bg-white/80 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] transition-transform duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)] cursor-pointer"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/[0.03]">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full animate-pulse bg-black/10" />
                )}
                <div className="pointer-events-none absolute inset-0 z-10" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.7) 88%, rgba(0,0,0,0.95) 100%)' }} />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-6 px-2 text-center">
                  <h3 className="mt-1 truncate text-xs font-medium text-white max-w-[90%]">{p.name}</h3>
                  <div className="mt-1 text-[11px] font-normal text-white/90">{p.price.toFixed(2)} €</div>
                  <div className="mt-2 flex justify-center">
                    <span className="inline-flex rounded-full bg-white/95 text-black px-2.5 py-0.5 text-[10px] font-medium shadow-sm transition-transform group-hover:-translate-y-0.5 group-hover:scale-[1.03]">Consulter</span>
                  </div>
                </div>
                <Link href={`/products/${p.id}`} className="absolute inset-0 z-20 block" aria-label={`Voir ${p.name}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


