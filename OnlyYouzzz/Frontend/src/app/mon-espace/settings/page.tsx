"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [zip, setZip] = React.useState("");
  const [cardLast4, setCardLast4] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Paramètres du compte</h1>
        <p className="text-sm text-black/60">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Informations personnelles</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-black/70">Nom</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="text-xs text-black/70">Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Sauvegarder</button>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Adresse de livraison</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-black/70">Adresse</label>
              <input value={address} onChange={(e)=>setAddress(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-black/70">Ville</label>
                <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="text-xs text-black/70">Code postal</label>
                <input value={zip} onChange={(e)=>setZip(e.target.value)} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Sauvegarder</button>
          </div>
        </section>

        {/* Section Paiement retirée selon demande */}
      </div>
    </div>
  );
}


