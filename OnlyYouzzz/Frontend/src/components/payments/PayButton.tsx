"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export type PayProduct = { id: string };

export default function PayButton({ product }: { product: PayProduct }) {
  const { token } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [method, setMethod] = React.useState<'relay' | 'home'>('relay');
  const [postalCode, setPostalCode] = React.useState('');
  const [city, setCity] = React.useState('');
  const [country, setCountry] = React.useState('FR');
  const [relays, setRelays] = React.useState<any[]>([]);
  const [selectedRelayId, setSelectedRelayId] = React.useState<string>('');
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  async function searchRelays() {
    try {
      const res = await fetch(`${base}/api/shipping/relays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postalCode, city, country }),
      });
      const data = await res.json();
      setRelays(Array.isArray(data?.relays) ? data.relays : []);
    } catch (e) {
      console.error(e);
      setRelays([]);
    }
  }
  async function handlePay() {
    try {
      const shipping: any = method === 'relay'
        ? { method: 'relay', relay: { id: selectedRelayId }, address: { postalCode, city, country } }
        : { method: 'home', address: { postalCode, city, country } };
      const res = await fetch(`${base}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ productId: product.id, shipping }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert("Paiement indisponible pour le moment.");
      console.error(e);
    }
  }

  return (
    <div className="pt-1">
      <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4">
        <div className="flex items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="ship_method" value="relay" checked={method==='relay'} onChange={() => setMethod('relay')} />
            <span>Point Relais</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="ship_method" value="home" checked={method==='home'} onChange={() => setMethod('home')} />
            <span>Domicile</span>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="Code postal" className="rounded border px-3 py-2 text-sm" />
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Ville" className="rounded border px-3 py-2 text-sm" />
          <input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Pays" className="rounded border px-3 py-2 text-sm" />
        </div>
        {method === 'relay' && (
          <div className="grid gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={searchRelays} className="rounded-full border px-4 py-1.5 text-sm hover:bg-black/5">Chercher des relais</button>
              <select value={selectedRelayId} onChange={e=>setSelectedRelayId(e.target.value)} className="flex-1 rounded border px-3 py-2 text-sm">
                <option value="">Sélectionner un point relais</option>
                {relays.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} — {r.address1}, {r.postalCode} {r.city}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <button onClick={handlePay} className="inline-flex justify-center rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90">
          Acheter
        </button>
      </div>
    </div>
  );
}


