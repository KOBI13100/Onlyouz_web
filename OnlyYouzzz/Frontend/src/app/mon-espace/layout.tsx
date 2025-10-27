"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";

export default function SellerSpaceLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!ready) return;
    if (!user) return router.replace("/inscription");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <div className="">
      <div className="flex flex-col min-h-screen">
        <header className="fixed top-0 z-40 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="px-4 md:px-6 border-b border-black/10 py-4">
            <div className="flex items-center justify-between">
              <Logo />
            </div>
          </div>
        </header>
        <main className="w-full mt-20">
          <div className="px-4 md:px-6 py-6">
            <div className="flex gap-6">
              <aside className="w-56 shrink-0 fixed left-0 bg-white px-4">
                <nav className="mt-1">
                  <ul className="space-y-4 text-sm text-black/80">
                    {/* 1. Mon profil */}
                    <li>
                      <Link href="/mon-espace/profile" className={`block rounded-md px-2 py-2 ${pathname?.endsWith('/profile') ? 'bg-black/5' : ''} hover:text-black`}>
                        <span className="inline-flex items-center gap-2">
                          <Image src="/icon_espace/profile.svg" alt="" width={16} height={16} />
                          <span>Mon profil</span>
                        </span>
                      </Link>
                    </li>
                    {/* 2. Tableau de bord (vendeur uniquement) */}
                    {user.role === 'vendeur' ? (
                      <li>
                        <Link href="/mon-espace/dashboard" className={`block rounded-md px-2 py-2 ${pathname?.includes('/dashboard') ? 'bg-black/5' : ''} hover:text-black`}>
                          <span className="inline-flex items-center gap-2">
                            <Image src="/icon_espace/dashboard.svg" alt="" width={16} height={16} />
                            <span>Tableau de bord</span>
                          </span>
                        </Link>
                      </li>
                    ) : null}
                    {user.role === 'vendeur' ? (
                      <li>
                        <Link href="/mon-espace/expeditions" className={`block rounded-md px-2 py-2 ${pathname?.includes('/expeditions') ? 'bg-black/5' : ''} hover:text-black`}>
                          <span className="inline-flex items-center gap-2">
                            <Image src={require("@/livraison.png")} alt="" width={16} height={16} />
                            <span>Mes expéditions</span>
                          </span>
                        </Link>
                      </li>
                    ) : null}
                    {/* 3. Messages */}
                    <li>
                      <Link href="/mon-espace/messages" className={`block rounded-md px-2 py-2 ${pathname?.includes('/messages') ? 'bg-black/5' : ''} hover:text-black`}>
                        <span className="inline-flex items-center gap-2">
                          <Image src="/icon_espace/messages.svg" alt="" width={16} height={16} />
                          <span>Messages</span>
                        </span>
                      </Link>
                    </li>
                    {/* 4. Paramètres */}
                    <li>
                      <Link href="/mon-espace/settings" className={`block rounded-md px-2 py-2 ${pathname?.includes('/settings') ? 'bg-black/5' : ''} hover:text-black`}>
                        <span className="inline-flex items-center gap-2">
                          <Image src="/icon_espace/reglages.svg" alt="" width={16} height={16} />
                          <span>Paramètres</span>
                        </span>
                      </Link>
                    </li>
                  {/* 5. Paiement */}
                  <li>
                    <Link href="/mon-espace/paiement" className={`block rounded-md px-2 py-2 ${pathname?.includes('/paiement') ? 'bg-black/5' : ''} hover:text-black`}>
                      <span className="inline-flex items-center gap-2">
                        <Image src="/icon_espace/payement.svg" alt="" width={16} height={16} />
                        <span>Paiement</span>
                      </span>
                    </Link>
                  </li>
                    {user.role === 'vendeur' ? (
                      <li>
                        <Link href="/mon-espace/mes-produits" className={`block rounded-md px-2 py-2 ${pathname?.includes('/mes-produits') ? 'bg-black/5' : ''} hover:text-black`}>
                          <span className="inline-flex items-center gap-2">
                            <Image src="/icon_espace/produit_achat.svg" alt="" width={16} height={16} />
                            <span>Mes produits</span>
                          </span>
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <Link href="/mon-espace/mes-achats" className={`block rounded-md px-2 py-2 ${pathname?.includes('/mes-achats') ? 'bg-black/5' : ''} hover:text-black`}>
                          <span className="inline-flex items-center gap-2">
                            <Image src="/icon_espace/produit_achat.svg" alt="" width={16} height={16} />
                            <span>Mes achats</span>
                          </span>
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              </aside>
              <div className="flex-1 min-w-0 ml-56">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


