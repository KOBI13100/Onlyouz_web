"use client";
import React from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
};

type LatestAuctionsProps = {
  title?: string;
  onBid?: (id: string) => void;
};

const LatestAuctions: React.FC<LatestAuctionsProps> = ({
  title = "Catalogue",
  onBid,
}) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cols, setCols] = React.useState(2);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/products`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as Product[];
          setProducts(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Déterminer le nombre de colonnes (suivant la grille: 2, 3 (sm), 5 (md))
  React.useEffect(() => {
    const computeCols = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w >= 768) setCols(5); // md:grid-cols-5
      else if (w >= 640) setCols(3); // sm:grid-cols-3
      else setCols(2); // grid-cols-2
    };
    computeCols();
    window.addEventListener('resize', computeCols, { passive: true });
    return () => window.removeEventListener('resize', computeCols);
  }, []);
  return (
    <section data-reveal className="pt-6 pb-8 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
      <div data-reveal-group className="mb-5 text-center">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        <div className="mt-2 text-center">
          <Link href="/products" className="rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-xs shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:bg-white">
            Tout découvrir
          </Link>
        </div>
      </div>
      <div data-reveal>
        {loading ? (
          <p className="text-sm text-black/60">Chargement…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-black/60">Aucun produit pour le moment.</p>
        ) : (
          <div data-reveal-group data-reveal-by="row" data-reveal-step="120" className="reveal-row-smooth grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {products.slice(0, Math.max(0, cols * 2)).map((p) => (
              <article key={p.id} className="group rounded-xl border border-gray-300/40 bg-white transition-transform duration-200 will-change-transform hover:-translate-y-0.5 hover:scale-[1.03]">
                <div className="p-2">
                  <Link href={`/products/${p.id}`} className="relative block aspect-square w-full overflow-hidden rounded-lg bg-black/5">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                        backgroundImage:
                          'linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.75) 78%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,0.98) 100%)',
                      }} />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-white text-sm font-medium">{p.name}</div>
                      <div className="mt-1 text-white/90 text-xs">{p.price?.toFixed?.(2) ?? p.price} €</div>
                      <div className="mt-2">
                        <span className="inline-flex rounded-full bg-[#E8B199] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-transform group-hover:scale-[1.03]">
                          Consulter
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-2 h-0"></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      </div>
    </section>
  );
};

export default LatestAuctions;


