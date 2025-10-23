import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-2xl font-semibold text-black">onlyyouz</div>
            <p className="mt-3 max-w-xl text-sm text-black/70">
              Marketplace élégante pour acheter et vendre des objets personnels.
            </p>
            <div className="mt-5 text-xs text-black/50">© {new Date().getFullYear()} onlyyouz — Tous droits réservés</div>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-black/60">EXPLORER</div>
            <ul className="mt-3 space-y-2 text-sm text-black/80">
              <li><a href="/" className="hover:underline">Accueil</a></li>
              <li><a href="/vendors" className="hover:underline">Top vendeurs</a></li>
              <li><a href="/products" className="hover:underline">Catalogue</a></li>
              <li><a href="/devenir-vendeur" className="hover:underline">Devenir vendeur</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-black/60">POLITIQUES</div>
            <ul className="mt-3 space-y-2 text-sm text-black/80">
              <li><a href="#" className="hover:underline">CGU / CGV</a></li>
              <li><a href="#" className="hover:underline">Confidentialité</a></li>
              <li><a href="#" className="hover:underline">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-black/10 pt-6 text-xs text-black/50">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>Fait avec ❤️</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Instagram</a>
              <a href="#" className="hover:underline">X</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;


