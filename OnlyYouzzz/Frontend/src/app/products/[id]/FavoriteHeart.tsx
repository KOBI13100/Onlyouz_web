"use client";
import React from "react";

export default function FavoriteHeart({ productId }: { productId: string }) {
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
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-black shadow-md ring-1 ring-black/10 hover:shadow-lg"
      aria-label="Basculer favoris"
      onClick={(e) => { e.stopPropagation(); toggleFav(); }}
      title="Favori"
    >
      {isFav ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4747" aria-hidden>
          <path fillRule="evenodd" d="M11.995 21c-.3 0-.6-.106-.84-.316C6.28 16.73 3 13.66 3 9.75 3 7.11 5.09 5.25 7.5 5.25c1.57 0 3.06.79 3.995 2.06.935-1.27 2.425-2.06 3.995-2.06C17.9 5.25 20 7.11 20 9.75c0 3.91-3.28 6.98-8.155 10.934-.24.19-.54.316-.85.316z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4747" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 9.75c0-2.64-2.1-4.5-4.51-4.5-1.57 0-3.06.79-3.995 2.06C10.56 6.04 9.07 5.25 7.5 5.25 5.09 5.25 3 7.11 3 9.75c0 3.91 3.28 6.98 8.155 10.934.24.19.54.316.85.316s.61-.126.85-.316C16.72 16.73 20 13.66 20 9.75z"/>
        </svg>
      )}
    </button>
  );
}


