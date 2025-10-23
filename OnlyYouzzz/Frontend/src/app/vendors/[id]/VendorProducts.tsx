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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-black/10 bg-white p-3 shadow-sm transition-transform duration-200 will-change-transform hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative mb-2 aspect-[5/4] w-full overflow-hidden rounded-lg bg-black/[0.03] cursor-pointer">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-black/50">Pas d'image</div>
                )}
                <Link href={`/products/${p.id}`} className="absolute inset-0 z-10 block" aria-label={`Voir ${p.name}`} />
              </div>
              <div className="space-y-0.5 text-center">
                <div className="truncate text-[12px] font-medium">{p.name}</div>
                <div className="text-[12px] text-black/80 font-medium">{p.price.toFixed(2)} €</div>
                <div>
                  <Link href={`/products/${p.id}`} className="inline-flex rounded-full bg-black text-white px-3 py-0.5 text-[11px] font-medium border border-black/10 hover:bg-black/90">Consulter</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


