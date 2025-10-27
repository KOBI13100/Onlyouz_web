"use client";
import React from "react";
import { useRouter } from "next/navigation";
import PayButton from "@/components/payments/PayButton";
import dynamic from "next/dynamic";
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer"), { ssr: false });

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

  const [cartOpen, setCartOpen] = React.useState(false);

  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex-1 rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-medium text-black hover:bg-black/5"
          onClick={() => {
            try {
              const raw = localStorage.getItem('oy_cart') || '[]';
              const arr: string[] = JSON.parse(raw);
              if (!arr.includes(productId)) arr.push(productId);
              localStorage.setItem('oy_cart', JSON.stringify(arr));
            } catch {}
            setCartOpen(true);
          }}
        >
          Ajouter au panier
        </button>
        <span className="w-3" aria-hidden />
        <div className="flex-1">
          <PayButton product={{ id: productId }} variant="simple" />
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}


