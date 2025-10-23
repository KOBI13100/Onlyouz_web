"use client";
import React from "react";
import { useRouter } from "next/navigation";
import PayButton from "@/components/payments/PayButton";

export default function ProductActions({ productId, vendorId }: { productId: string; vendorId?: string }) {
  const router = useRouter();
  const [favOpen, setFavOpen] = React.useState(false);
  const [isFav, setIsFav] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('oy_favs') || '[]';
      const arr: string[] = JSON.parse(raw);
      setIsFav(arr.includes(productId));
    } catch {}
  }, [productId]);

  const toggleFav = () => {
    try {
      const raw = localStorage.getItem('oy_favs') || '[]';
      const arr: string[] = JSON.parse(raw);
      const next = arr.includes(productId) ? arr.filter(id => id !== productId) : [...arr, productId];
      localStorage.setItem('oy_favs', JSON.stringify(next));
      setIsFav(next.includes(productId));
    } catch {}
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <PayButton product={{ id: productId }} />
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white p-2.5 text-black hover:bg-black/5"
        aria-label="Basculer favoris"
        onClick={toggleFav}
        title="Favori"
      >
        {isFav ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4747" aria-hidden>
            <path fillRule="evenodd" d="M11.995 21c-.3 0-.6-.106-.84-.316C6.28 16.73 3 13.66 3 9.75 3 7.11 5.09 5.25 7.5 5.25c1.57 0 3.06.79 3.995 2.06.935-1.27 2.425-2.06 3.995-2.06C17.9 5.25 20 7.11 20 9.75c0 3.91-3.28 6.98-8.155 10.934-.24.19-.54.316-.85.316z"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4747" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 9.75c0-2.64-2.1-4.5-4.51-4.5-1.57 0-3.06.79-3.995 2.06C10.56 6.04 9.07 5.25 7.5 5.25 5.09 5.25 3 7.11 3 9.75c0 3.91 3.28 6.98 8.155 10.934.24.19.54.316.85.316s.61-.126.85-.316C16.72 16.73 20 13.66 20 9.75z"/>
          </svg>
        )}
      </button>
      {/* Retour supprimé ici, présent en haut à gauche près de l'image */}

      {false && favOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setFavOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Ajouter aux favoris</h3>
            <p className="mt-2 text-sm text-black/70">Confirmer l’ajout de ce produit à vos favoris ?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-full px-4 py-2 text-sm text-black/70 hover:bg-black/5" onClick={() => setFavOpen(false)}>Annuler</button>
              <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90" onClick={() => { alert('Ajouté aux favoris (placeholder)'); setFavOpen(false); }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


