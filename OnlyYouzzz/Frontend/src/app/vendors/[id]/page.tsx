import Image from "next/image";
import VendorProducts from "./VendorProducts";
import FollowHeader from "./FollowHeader";

type Vendor = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  verified?: boolean;
  lastSeen?: string | null;
  products: Array<{ id: string; name: string; description: string; price: number; imageUrl?: string | null }>;
};

async function fetchVendor(id: string): Promise<Vendor> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/vendors/${id}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function VendorPage({ params }: { params: { id: string } }) {
  try {
    const vendor = await fetchVendor(params.id);
    return (
      <main className="mx-auto max-w-6xl px-4 pt-30">
        {/* Déplace visuellement uniquement le bloc d'infos (n'affecte pas la mise en page du reste) */}
        <div className="relative -translate-y-[50px]" data-reveal>
          <div className="mb-4 h-px bg-black/10" />
          <FollowHeader vendorId={vendor.id} vendorName={vendor.name} avatarUrl={vendor.avatarUrl || undefined} email={vendor.email} verified={vendor.verified} lastSeen={vendor.lastSeen || undefined} />
          <div className="mt-4 h-px bg-black/10" />
        </div>
        <div className="mb-[70px]">
          <h2 className="mb-4 text-lg font-semibold" data-reveal>Produits</h2>
          <div data-reveal-group>
            <VendorProducts products={vendor.products} />
          </div>
        </div>
      </main>
    );
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") {
      return (
        <main className="mx-auto max-w-6xl px-4 pt-10">
          <h1 className="mb-2 text-2xl font-semibold">Vendeur introuvable</h1>
          <p className="text-sm text-black/60">Ce vendeur n'existe pas.</p>
        </main>
      );
    }
    return (
      <main className="mx-auto max-w-6xl px-4 pt-10">
        <h1 className="mb-2 text-2xl font-semibold">Erreur</h1>
        <p className="text-sm text-black/60">Impossible de charger cette page.</p>
      </main>
    );
  }
}


