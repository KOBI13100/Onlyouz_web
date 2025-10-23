"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

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

export default function MesExpeditionsPage() {
  const { token } = useAuth();
  const [items, setItems] = React.useState<Shipment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<{ status?: string; trackingNumber?: string; labelUrl?: string }>({});
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/shipping/my-seller`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  }, [token, base]);

  React.useEffect(() => { load(); }, [load]);

  async function onSave(id: string) {
    if (!token) return;
    const res = await fetch(`${base}/api/shipping/${id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditing(null);
      setForm({});
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Mes expéditions</h1>
        <p className="text-sm text-black/60">Suivi et mise à jour des colis vendus</p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
        {loading ? (
          <div className="grid place-items-center py-10 text-sm text-black/60">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center py-16 text-sm text-black/60">Aucune expédition pour le moment</div>
        ) : (
          <div className="grid gap-4">
            {items.map((s) => (
              <div key={s.id} className="rounded-xl border border-black/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-black/60">Commande: {s.orderId || '—'} · Produit: {s.productId || '—'}</div>
                    <div className="text-xs text-black/50">{(s.carrier || 'mondialrelay').toUpperCase()} · {s.method === 'home' ? 'Domicile' : 'Point Relais'}</div>
                  </div>
                  {editing === s.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input value={form.status || ''} onChange={e=>setForm(f=>({ ...f, status: e.target.value }))} placeholder="Statut (ex: shipped)" className="rounded border px-3 py-1.5 text-sm" />
                      <input value={form.trackingNumber || ''} onChange={e=>setForm(f=>({ ...f, trackingNumber: e.target.value }))} placeholder="N° de suivi" className="rounded border px-3 py-1.5 text-sm" />
                      <input value={form.labelUrl || ''} onChange={e=>setForm(f=>({ ...f, labelUrl: e.target.value }))} placeholder="URL étiquette" className="rounded border px-3 py-1.5 text-sm w-64" />
                      <button onClick={()=>onSave(s.id)} className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white">Enregistrer</button>
                      <button onClick={()=>{setEditing(null); setForm({});}} className="rounded-full px-4 py-1.5 text-sm">Annuler</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="rounded-full bg-black/5 px-2 py-0.5">Statut: <b>{s.status || 'pending'}</b></span>
                      {s.trackingNumber ? <span className="rounded-full bg-black/5 px-2 py-0.5">Suivi: <span className="font-mono">{s.trackingNumber}</span></span> : null}
                      <button onClick={()=>{setEditing(s.id); setForm({ status: s.status || '', trackingNumber: s.trackingNumber || '', labelUrl: s.labelUrl || '' });}} className="rounded-full border px-3 py-1.5 hover:bg-black/5">Mettre à jour</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


