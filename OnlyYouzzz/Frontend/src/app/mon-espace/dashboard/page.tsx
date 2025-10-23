"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();
  const isSeller = user?.role === 'vendeur';
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section removed per design */}

      <div className="p-0">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-[#ff4747] rounded-2xl border border-black/10 p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Bonjour {user?.name} !</h2>
                <p className="text-white/80 text-sm">
                  Voici un aperçu de votre activité sur Onlyouz
                </p>
              </div>
              <div className="hidden md:block">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <path d="M3 21h18" />
                  <path d="M4 14l5-5 4 4 7-9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white rounded-2xl border border-black/10 p-4 shadow-sm">
              <div className="flex flex-col items-center mb-3">
                <div className="p-2 bg-black/10 rounded-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                </div>
                <div className="mt-1 text-2xl font-bold text-black">—</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-sm font-medium text-black">{isSeller ? 'Produits actifs' : 'Produits achetés'}</div>
                <div className="text-xs text-black/60">{isSeller ? 'Total de vos produits en vente' : 'Total de vos achats'}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 p-4 shadow-sm">
              <div className="flex flex-col items-center mb-3">
                <div className="p-2 bg-black/10 rounded-xl">
                  {isSeller ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                      <path d="M12 1v22M3 6h18M3 12h18M3 18h18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                      <path d="M20 9.75c0-2.64-2.1-4.5-4.51-4.5-1.57 0-3.06.79-3.995 2.06C10.56 6.04 9.07 5.25 7.5 5.25 5.09 5.25 3 7.11 3 9.75c0 3.91 3.28 6.98 8.155 10.934.24.19.54.316.85.316s.61-.126.85-.316C16.72 16.73 20 13.66 20 9.75z"/>
                    </svg>
                  )}
                </div>
                <div className="mt-1 text-2xl font-bold text-black">—</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-sm font-medium text-black">{isSeller ? 'Ventes totales' : 'Favoris'}</div>
                <div className="text-xs text-black/60">{isSeller ? 'Nombre de ventes réalisées' : 'Produits que vous aimez'}</div>
              </div>
            </div>

            <a href="/mon-espace/messages" className="block bg-white rounded-2xl border border-black/10 p-4 shadow-sm hover:bg-black/5 hover:border-black/20 transition-colors">
              <div className="flex flex-col items-center mb-3">
                <div className="p-2 bg-black/10 rounded-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
                  </svg>
                </div>
                <div className="mt-1 text-2xl font-bold text-black">—</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-sm font-medium text-black">Messages</div>
                <div className="text-xs text-black/60">Vous n'avez aucune conversation récente</div>
              </div>
            </a>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-black mb-1">Actions rapides</h2>
              <p className="text-sm text-black/60">Accédez rapidement aux fonctionnalités principales</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isSeller ? (
                <a 
                  href="/mon-espace/mes-produits" 
                  className="flex items-center gap-4 p-4 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
                >
                  <div className="p-3 bg-black/10 rounded-xl">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Mes produits</div>
                    <div className="text-xs text-black/60">Gérer mes annonces</div>
                  </div>
                </a>
              ) : (
                <a 
                  href="/products" 
                  className="flex items-center gap-4 p-4 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
                >
                  <div className="p-3 bg-black/10 rounded-xl">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                      <path d="M12 1v22M3 6h18M3 12h18M3 18h18" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Parcourir le catalogue</div>
                    <div className="text-xs text-black/60">Acheter de nouveaux produits</div>
                  </div>
                </a>
              )}

              <a 
                href="/mon-espace/messages" 
                className="flex items-center gap-4 p-4 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
              >
                <div className="p-3 bg-black/10 rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-black">Messages</div>
                  <div className="text-xs text-black/60">Conversations clients</div>
                </div>
              </a>

              <a 
                href="/mon-espace/profile" 
                className="flex items-center gap-4 p-4 rounded-xl border border-black/10 hover:bg-black/5 hover:border-black/20 transition-colors"
              >
                <div className="p-3 bg-black/10 rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                    <path d="M20 21a8 8 0 10-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-black">Mon profil</div>
                  <div className="text-xs text-black/60">Informations personnelles</div>
                </div>
              </a>
            </div>
          </div>

          {/* Sections acheteur: favoris et achats */}
          {!isSeller && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Mes favoris</h3>
                <div className="text-xs text-black/60">Bientôt: vos produits enregistrés</div>
              </section>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4">Mes achats</h3>
                <div className="text-xs text-black/60">Bientôt: historique d’achats</div>
              </section>
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Mes conversations récentes</h3>
                  <a href="/mon-espace/messages" className="text-xs text-black/60 hover:text-black">Voir tout</a>
                </div>
                {/* Placeholder conversations; remplacez par des données réelles */}
                <div className="space-y-2">
                  {/* Etat vide */}
                  <div className="text-xs text-black/60">Vous n'avez aucune conversation récente</div>
                  {/* Exemple de carte conversation (commentée jusqu’à branchement des données) */}
                  {false && [
                    { id: 1, name: 'Boutique Sakura', lastAt: 'il y a 2h', unread: 2 },
                    { id: 2, name: 'Atelier Orion', lastAt: 'hier', unread: 0 },
                    { id: 3, name: 'Maison Éclipse', lastAt: 'il y a 3 jours', unread: 1 },
                  ].sort((a,b)=>a.id-b.id).map((c) => (
                    <a key={c.id} href={`/mon-espace/messages?peer=${c.id}`} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3 hover:bg-black/5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-black/10" />
                        <div>
                          <div className="text-sm font-medium text-black">{c.name}</div>
                          <div className="text-[11px] text-black/60">Dernier message {c.lastAt}</div>
                        </div>
                      </div>
                      {c.unread > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white">
                          {c.unread}
                        </span>
                      ) : (
                        <span className="text-[11px] text-black/40">Lu</span>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


