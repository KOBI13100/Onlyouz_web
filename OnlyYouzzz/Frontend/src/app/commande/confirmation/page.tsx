"use client";
import React from "react";
import Link from "next/link";

type SessionData = {
  id: string;
  amount_total: number | null;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
  metadata?: { productId?: string; sellerId?: string };
  line_items?: any;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
};

export default function ConfirmationPage() {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<SessionData | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${base}/api/payments/session?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
        const data = await res.json();
        setSession(data);
        const pid = data?.metadata?.productId;
        if (pid) {
          const pres = await fetch(`${base}/api/products/${pid}`, { cache: 'no-store' });
          if (pres.ok) setProduct(await pres.json());
        }
        // Si payé: notifier le backend pour supprimer l'annonce
        const paid = data?.payment_status === 'paid' || data?.status === 'complete';
        if (paid) {
          try {
            const headers: Record<string,string> = { 'Content-Type': 'application/json' };
            const t = localStorage.getItem('oy_auth_token');
            if (t) headers['Authorization'] = `Bearer ${t}`;
            await fetch(`${base}/api/payments/mark-sold`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ sessionId }),
            });
          } catch (e) {
            console.error('mark-sold failed', e);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [base]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-14" data-reveal>
        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity=".3"/><path d="M12 6v6l4 2"/></svg>
            </span>
            <div>
              <h1 className="text-lg font-semibold">Confirmation</h1>
              <p className="text-sm text-black/60">Chargement de votre commande…</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="h-5 w-40 animate-pulse rounded bg-black/10"></div>
            <div className="h-5 w-28 animate-pulse rounded bg-black/10"></div>
            <div className="h-20 w-full animate-pulse rounded-xl bg-black/5"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Commande</h1>
        <p className="mt-2 text-sm text-black/60">Session introuvable.</p>
        <div className="mt-4">
          <Link href="/products" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Retour au catalogue</Link>
        </div>
      </main>
    );
  }

  const paid = session.payment_status === 'paid' || session.status === 'complete';

  return (
    <main className="mx-auto max-w-5xl px-4 py-14" data-reveal>
      <div className="rounded-3xl border border-black/10 bg-white/90 shadow-[inset_0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white ring-8 ring-emerald-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold md:text-3xl">Commande confirmée</h1>
              <p className="mt-1 text-sm text-black/60">Merci pour votre achat. Votre paiement a bien été pris en compte.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Article */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:col-span-2">
              <div className="flex items-start gap-5">
                <div className="h-28 w-28 overflow-hidden rounded-xl bg-black/5 ring-1 ring-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {product?.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium">{product?.name || 'Article'}</div>
                      <div className="mt-1 text-xs text-black/60 leading-relaxed">
                        {product?.description?.slice(0, 160) || "Merci pour votre confiance !"}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-right">
                      <div className="rounded-full bg-black/90 px-3 py-1 text-xs font-medium text-white">
                        {(session.amount_total ? (session.amount_total / 100).toFixed(2) : (product?.price?.toFixed(2) || '—'))} {session.currency?.toUpperCase() || 'EUR'}
                      </div>
                      {product?.price ? (
                        <div className="mt-1 text-[11px] text-black/50">Prix article: {product.price.toFixed(2)} €</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Paiement */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Paiement</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">Statut</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${paid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}>
                    {paid ? 'Payé' : (session.payment_status || session.status || 'En attente')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/60">Total</span>
                  <span className="font-medium">{(session.amount_total ? (session.amount_total / 100).toFixed(2) : '—')} {session.currency?.toUpperCase() || 'EUR'}</span>
                </div>
                
              </div>
              <div className="mt-4 flex flex-col gap-2 text-xs text-black/50">
                <div>Le vendeur sera notifié et procédera à l’expédition si nécessaire.</div>
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {product ? (
              <Link href={`/products/${product.id}`} className="rounded-full px-4 py-2 text-sm border border-black/10 hover:bg-black/5">Voir le produit</Link>
            ) : null}
            <Link href="/products" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Continuer vos achats</Link>
          </div>
        </div>
      </div>
    </main>
  );
}


