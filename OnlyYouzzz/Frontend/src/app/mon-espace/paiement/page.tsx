"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

type StripeStatus = {
  connected: boolean;
  accountId: string | null;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements_due?: string[];
};

export default function PaiementSettingsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<StripeStatus | null>(null);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const fetchStatus = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/payments/connect/status`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, base]);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function startOnboarding() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/payments/connect/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data?.error || "Erreur Stripe Connect");
    } catch (e) {
      console.error(e);
      alert("Impossible de démarrer l'onboarding Stripe");
    } finally {
      setLoading(false);
    }
  }

  const connected = Boolean(status?.connected);
  const ready = Boolean(status?.charges_enabled && status?.payouts_enabled);

  return (
    <div className="space-y-6" data-reveal>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Paiement</h1>
        <p className="text-sm text-black/60">Configurez votre compte Stripe pour recevoir vos paiements.</p>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Statut Stripe Connect</div>
            {!status ? (
              <div className="text-sm text-black/60">Chargement…</div>
            ) : (
              <div className="text-sm text-black/70">
                {connected ? (
                  <>
                    <div>Compte: <span className="font-mono text-xs">{status.accountId}</span></div>
                    <div>Encaissement: {status.charges_enabled ? 'activé' : 'en attente'}</div>
                    <div>Virements: {status.payouts_enabled ? 'activés' : 'en attente'}</div>
                  </>
                ) : (
                  <div>Non connecté</div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startOnboarding}
              disabled={loading || !user || user.role !== 'vendeur'}
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
            >
              {connected ? 'Mettre à jour sur Stripe' : 'Configurer avec Stripe'}
            </button>
            <button
              type="button"
              onClick={fetchStatus}
              disabled={loading}
              className="rounded-full px-4 py-2 text-sm border border-black/10 hover:bg-black/5"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        {Array.isArray(status?.requirements_due) && status?.requirements_due?.length ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <div className="text-sm font-semibold">Informations manquantes</div>
            <ul className="mt-2 list-disc pl-4 text-xs">
              {status.requirements_due.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}


