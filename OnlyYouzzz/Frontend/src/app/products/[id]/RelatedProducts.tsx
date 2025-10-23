"use client";
import React from "react";
import Link from "next/link";

type Item = { id: string; name: string; price: number; imageUrl?: string | null };

export default function RelatedProducts({ sellerId, currentId }: { sellerId?: string; currentId?: string }) {
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!sellerId) return;
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/vendors/${sellerId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const all: Item[] = (data?.products || []).map((p: any) => ({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl }));
          const filtered = all.filter((p) => p.id !== currentId).slice(0, 8);
          if (isMounted) setItems(filtered);
        }
      } catch {}
    }
    load();
    return () => { isMounted = false; };
  }, [sellerId, currentId]);

  if (!sellerId || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h3 className="mb-3 text-sm font-semibold text-black/80">Autres produits du vendeur</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="group rounded-lg border border-black/10 bg-white/90 shadow-sm overflow-hidden hover:shadow-md transition-transform hover:-translate-y-0.5">
            <div className="relative aspect-[6/5] w-full overflow-hidden bg-black/[0.03]">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-black/50">—</div>
              )}
            </div>
            <div className="px-2.5 py-1.5 text-center">
              <div className="truncate text-[11px] font-medium">{p.name}</div>
              <div className="mt-0.5 text-[11px] text-black/80 font-medium">{p.price.toFixed(2)} €</div>
              <div className="mt-1">
                <span className="inline-flex rounded-full bg-black text-white px-3 py-0.5 text-[11px] font-medium border border-black/10 hover:bg-black/90">Consulter</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


