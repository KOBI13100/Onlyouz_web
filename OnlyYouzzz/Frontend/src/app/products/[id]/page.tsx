import Image from "next/image";
import Link from "next/link";
import ProductActions from "./ProductActions";
import MediaCarousel from "./MediaCarousel";
import RelatedProducts from "./RelatedProducts";

type Product = {
  id: string;
  sellerId?: string;
  sellerName?: string | null;
  sellerVerified?: boolean | null;
  sellerAvatarUrl?: string | null;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrls?: string[];
};

async function fetchProduct(id: string): Promise<Product> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error(`Erreur chargement produit: HTTP ${res.status}`);
  }
  return res.json();
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let product: Product | null = null;
  try {
    product = await fetchProduct(params.id);
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") {
      return (
        <main className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="mb-4 text-2xl font-semibold">Produit introuvable</h1>
          <p className="text-sm text-black/60">Le produit demandé n'existe pas ou a été supprimé.</p>
        </main>
      );
    }
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold">Erreur</h1>
        <p className="text-sm text-black/60">Impossible de charger ce produit.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 mt-4" data-reveal>
      <div className="grid gap-2 md:gap-2 md:grid-cols-2">
        <div className="flex items-start gap-12" data-reveal-group>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Retour
          </Link>
          <MediaCarousel
            key={product.id}
            images={(product.imageUrls && product.imageUrls.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []))}
            videos={product.videoUrls || []}
          />
        </div>
        <div className="space-y-4" data-reveal-group>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{product.name}</h1>
          <div className="text-lg font-semibold" data-price={product.price}>{product.price.toFixed(2)} €</div>
          <p className="text-black/70 leading-relaxed">{product.description}</p>

          {/* Infos vendeur */}
          {product.sellerId ? (
            <div className="mt-3 flex items-center gap-3" data-reveal>
              <span className="h-8 w-px bg-black/10" aria-hidden />
              <Link href={`/vendors/${product.sellerId}`} className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-black/10 bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {product.sellerAvatarUrl ? (
                  <img src={product.sellerAvatarUrl} alt={product.sellerName || 'Vendeur'} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-xs text-black/60">—</span>
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/vendors/${product.sellerId}`} className="block truncate text-sm font-medium hover:underline">@{product.sellerName}</Link>
                {product.sellerVerified ? <span title="Vérifié" className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] align-middle">✓</span> : null}
                <div className="text-xs text-black/60">Profil du vendeur</div>
                {/* puce supprimée */}
              </div>
              <span className="h-8 w-px bg-black/10" aria-hidden />
            </div>
          ) : null}

          {/* Actions: commander, favoris, back */}
          <ProductActions productId={product.id} vendorId={product.sellerId} />
        </div>
      </div>
      <RelatedProducts sellerId={product.sellerId} currentId={product.id} />
    </main>
  );
}


