"use client";
import React from "react";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";

type Order = {
  id: string;
  productId: string;
  amount: number | null;
  currency: string | null;
  createdAt?: string;
  product?: { name?: string; price?: number; imageUrl?: string | null; description?: string } | null;
};

type Shipment = {
  id: string;
  orderId?: string | null;
  productId?: string | null;
  status?: string;
  carrier?: string;
  method?: string;
  trackingNumber?: string | null;
  labelUrl?: string | null;
  createdAt?: string;
};

export default function MesAchatsPage() {
  const { token } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [shipments, setShipments] = React.useState<Shipment[]>([]);

  const sortedOrders = React.useMemo(() => {
    const copy = [...orders];
    return copy.sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta; // plus récent -> plus ancien
    });
  }, [orders]);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${base}/api/payments/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
      // Charger les envois de l'acheteur
      const sres = await fetch(`${base}/api/shipping/my-buyer`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (sres.ok) {
        setShipments(await sres.json());
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Mes achats</h1>
        <p className="text-sm text-black/60">Historique de vos commandes</p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
        <div className="text-xs text-black/50 mb-[16px]">{sortedOrders.length} achat{sortedOrders.length > 1 ? 's' : ''}</div>
        {loading ? (
          <div className="grid place-items-center py-10 text-sm text-black/60">Chargement…</div>
        ) : sortedOrders.length === 0 ? (
          <div className="grid place-items-center py-16">
            <div className="rounded-2xl border border-black/10 bg-white/70 px-6 py-8 text-center shadow-sm">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/70">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <div className="text-sm text-black/60">Aucun achat pour le moment</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedOrders.map((o) => {
              const related = shipments.find(s => s.productId === o.productId || s.orderId === o.id);
              return (
              <div key={o.id} className="group relative rounded-2xl border border-black/10 bg-white/90 shadow-sm overflow-hidden">
                <div className="relative mb-3 aspect-square w-full overflow-hidden bg-black/[0.03]">
                  {o.product?.imageUrl ? (
                    <Image src={o.product.imageUrl} alt={o.product.name || 'Produit'} fill className="object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-black/50">—</div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                    {(o.amount ? (o.amount / 100).toFixed(2) : (o.product?.price?.toFixed(2) || '—'))} {o.currency?.toUpperCase() || 'EUR'}
                  </div>
                </div>
                <div className="space-y-1 p-4">
                  <div className="text-base font-medium tracking-tight truncate">{o.product?.name || 'Produit'}</div>
                  <div className="line-clamp-2 text-sm text-black/60">{o.product?.description || ''}</div>
                  <div className="pt-1 text-xs text-black/50">Acheté le {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</div>
                  {related ? (
                    <div className="mt-2 rounded-lg border border-black/10 bg-black/[0.03] p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-black/60">Livraison</span>
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium shadow-sm">{(related.carrier || 'mondialrelay').toUpperCase()} · {related.method === 'home' ? 'Domicile' : 'Point Relais'}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-black/60">Statut</span>
                        <span className="font-medium">{related.status || 'pending'}</span>
                      </div>
                      {related.trackingNumber ? (
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-black/60">N° de suivi</span>
                          <span className="font-mono text-[11px]">{related.trackingNumber}</span>
                        </div>
                      ) : null}
                      {related.labelUrl ? (
                        <div className="mt-2">
                          <a href={related.labelUrl} target="_blank" className="text-[11px] underline">Télécharger l’étiquette</a>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-black/10 bg-black/[0.03] p-3 text-xs text-black/60">En attente des informations d’expédition…</div>
                  )}
                </div>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}


