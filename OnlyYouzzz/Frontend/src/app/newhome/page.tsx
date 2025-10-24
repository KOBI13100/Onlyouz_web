"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/navbar/Logo";
import { useAuth } from "@/providers/AuthProvider";
import SiteFooter from "@/components/home/SiteFooter";
import SplashScreen from "@/components/SplashScreen";

type Vendor = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  verified?: boolean;
  description?: string | null;
  productsCount?: number;
};

type Product = {
  id: string;
  sellerId?: string;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  imageUrls?: string[];
  createdAt?: string;
};

// @ts-ignore - static svg icon for "Acheteurs"
const hangerIcon = require("@/clotheshanger.svg");
// @ts-ignore - static svg icon for "encheres"
const auctionIcon = require("@/auction.svg");
// certification icon (png)
// @ts-ignore - static png icon
const certifIcon = require("@/certif2.png");
// @ts-ignore - static png for profile/avatar icon
const profileIcon = require("@/profile3.png");

export default function NewHome() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [vendorQuery, setVendorQuery] = React.useState("");
  const [productQuery, setProductQuery] = React.useState("");
  const [activeSegment, setActiveSegment] = React.useState<"vendor" | "product" | null>(null);
  const [hoveredSegment, setHoveredSegment] = React.useState<"vendor" | "product" | null>(null);
  const barRef = React.useRef<HTMLFormElement | null>(null);
  const [bubbleRect, setBubbleRect] = React.useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateBubbleRect = React.useCallback(() => {
    if (!activeSegment) return;
    const container = barRef.current;
    const target =
      activeSegment === "vendor" ? vendorSegmentRef.current : productSegmentRef.current;
    if (!container || !target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setBubbleRect({
      left: targetRect.left - containerRect.left,
      width: targetRect.width,
    });
  }, [activeSegment]);

  React.useLayoutEffect(() => {
    if (!activeSegment) return;
    updateBubbleRect();
    const handleResize = () => updateBubbleRect();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSegment, updateBubbleRect]);

  React.useEffect(() => {
    if (!activeSegment) return;
    const id = requestAnimationFrame(() => updateBubbleRect());
    return () => cancelAnimationFrame(id);
  }, [activeSegment, vendorQuery, productQuery, updateBubbleRect]);

  const bubbleStyle = React.useMemo(() => {
    if (!activeSegment) {
      return {
        opacity: 0,
        transform: "scaleX(0.9)",
      } as React.CSSProperties;
    }
    return {
      opacity: 1,
      transform: "scaleX(1)",
      left: `${bubbleRect.left}px`,
      width: `${bubbleRect.width}px`,
      transition: "left 0.35s ease, width 0.35s ease, opacity 0.3s ease, transform 0.3s ease",
    } as React.CSSProperties;
  }, [activeSegment, bubbleRect]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [language, setLanguage] = React.useState<"FR" | "EN">(() => {
    try {
      const saved = localStorage.getItem("language");
      if (saved === "FR" || saved === "EN") return saved as "FR" | "EN";
    } catch {}
    if (typeof navigator !== "undefined") {
      const n = (navigator.language || "fr").toLowerCase();
      return n.startsWith("fr") ? "FR" : "EN";
    }
    return "FR";
  });
  const [langOpen, setLangOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const langRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const vendorSegmentRef = React.useRef<HTMLDivElement | null>(null);
  const productSegmentRef = React.useRef<HTMLDivElement | null>(null);

  const resolveSegmentFromTarget = React.useCallback(
    (target: EventTarget | null): "vendor" | "product" | null => {
      const node = target instanceof Node ? target : null;
      if (!node) return null;
      if (vendorSegmentRef.current?.contains(node)) return "vendor";
      if (productSegmentRef.current?.contains(node)) return "product";
      return null;
    },
    []
  );

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const base =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/vendors/top?offset=0&limit=20`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data: Vendor[] = await res.json();
          setVendors(data);
        }
        const resProducts = await fetch(`${base}/api/products`, {
          cache: "no-store",
        });
        if (resProducts.ok) {
          const ps: Product[] = await resProducts.json();
          setProducts(ps);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("language", language);
    } catch {}
  }, [language]);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (langRef.current && !langRef.current.contains(t)) setLangOpen(false);
      const isBurgerBtn = (e.target as HTMLElement)?.closest(
        "[data-burger-button]"
      );
      if (menuRef.current && !menuRef.current.contains(t) && !isBurgerBtn)
        setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative">
      <SplashScreen />
      {menuOpen ? (
        <aside
          id="burger-panel"
          ref={menuRef}
          className="fixed right-0 top-0 z-40 h-screen w-72 border-l border-gray-200 bg-white shadow-2xl p-4"
        >
          <div className="flex items-center justify-between px-3">
            <div className="text-sm font-semibold text-black/70">Menu</div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-black/70 hover:text-black transition-transform will-change-transform hover:rotate-90"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="h-px bg-black/20 my-2" />
          <nav className="mt-1 flex flex-col text-sm divide-y divide-black/10">
            <Link href="/" className="px-3 py-3 md:py-3.5 hover:bg-gray-50">
              Accueil
            </Link>
            <Link
              href="/vendors"
              className="px-3 py-3 md:py-3.5 hover:bg-gray-50"
            >
              Vendeurs
            </Link>
            <Link
              href="/products"
              className="px-3 py-3 md:py-3.5 hover:bg-gray-50"
            >
              Catalogue
            </Link>
            <Link
              href="/enchères"
              className="px-3 py-3 md:py-3.5 hover:bg-gray-50"
            >
              Enchères
            </Link>
            <Link
              href="/mon-espace"
              className="px-3 py-3 md:py-3.5 hover:bg-gray-50"
            >
              Mon espace
            </Link>
            <Link
              href="/mon-espace/settings"
              className="px-3 py-3 md:py-3.5 hover:bg-gray-50"
            >
              Réglages
            </Link>
          </nav>
        </aside>
      ) : null}
      <div
        className={`min-h-screen w-full bg-white overflow-x-hidden ${
          menuOpen ? "pr-72" : "pr-0"
        }`}
      >
        {/* Icon font for Flaticon UIcons (bold-rounded) */}
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/uicons-bold-rounded/css/uicons-bold-rounded.css"
        />
        {/* Header with tabs + search */}
        <header className="fixed w-full top-0 z-30 bg-white/70 backdrop-blur border-b border-black/5">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-7 md:py-8">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center">
                <Logo />
              </div>
              <div className="flex-1 flex justify-center mt-2">
                <nav className="hidden md:flex items-center gap-8 text-base h-10 mx-auto">
                  <Link
                    href="/vendors"
                    className="inline-flex h-10 items-center gap-2.5 text-black/80 hover:text-black"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20 overflow-hidden bg-white">
                      <Image
                        src={profileIcon}
                        alt=""
                        width={16}
                        height={16}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    </span>
                    <span className="font-medium">Vendeurs</span>
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex h-10 items-center gap-2.5 text-black/60 hover:text-black"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20">
                      <Image
                        src={hangerIcon}
                        alt=""
                        width={16}
                        height={16}
                        className="inline-block"
                      />
                    </span>
                    <span className="font-medium">Catalogue</span>
                  </Link>
                  <Link
                    href="/encheres"
                    className="inline-flex h-10 items-center gap-2.5 text-black/60 hover:text-black"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20">
                      <Image
                        src={auctionIcon}
                        alt=""
                        width={16}
                        height={16}
                        className="inline-block"
                      />
                    </span>
                    <span className="font-medium capitalize">Enchères</span>
                  </Link>
                </nav>
              </div>
              <div className="hidden md:flex items-center gap-6 mt-2">
                {/* Connexion/Deconnexion text to the left of language selector */}
                {user ? (
                  <button
                    onClick={logout}
                    className="text-[14px] font-medium text-black hover:text-black/80"
                    title="deconnexion"
                  >
                    deconnexion
                  </button>
                ) : (
                  <Link
                    href="/connexion"
                    className="text-[14px] font-medium text-black hover:text-black/80"
                    title="connexion"
                  >
                    connexion
                  </Link>
                )}
                <div className="relative" ref={langRef}>
                  <button
                    onClick={() => setLangOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={langOpen}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:shadow-md transition-shadow"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </button>
                  {langOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-12 z-40 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                    >
                      <button
                        role="menuitem"
                        className={`block w-full px-3 py-2 text-left text-sm ${
                          language === "FR"
                            ? "bg-gray-100 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setLanguage("FR");
                          setLangOpen(false);
                        }}
                      >
                        FR
                      </button>
                      <button
                        role="menuitem"
                        className={`block w-full px-3 py-2 text-left text-sm ${
                          language === "EN"
                            ? "bg-gray-100 font-semibold"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setLanguage("EN");
                          setLangOpen(false);
                        }}
                      >
                        EN
                      </button>
                    </div>
                  ) : null}
                </div>
                <button
                  data-burger-button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-controls="burger-panel"
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-6 md:mt-8">
              <div className="mx-auto max-w-5xl">
                <form
                  ref={barRef}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const vendorTerm = vendorQuery.trim();
                    const productTerm = productQuery.trim();
                    if (vendorTerm) {
                      router.push(
                        `/vendors?q=${encodeURIComponent(vendorTerm)}`
                      );
                      return;
                    }
                    if (productTerm) {
                      router.push(
                        `/products?q=${encodeURIComponent(productTerm)}`
                      );
                    }
                  }}
                  className="relative rounded-full border border-black/10 bg-white shadow-[0_12px_44px_rgba(0,0,0,0.10)] overflow-hidden"
                >
                  <span
                    className={`pointer-events-none absolute inset-0 rounded-full opacity-0 transition-[opacity,background-color] duration-300 ease-out ${
                      activeSegment ? "opacity-100" : ""
                    }`}
                    style={{
                      backgroundColor:
                        activeSegment && hoveredSegment && hoveredSegment !== activeSegment
                        ? "rgba(0,0,0,0.12)"
                        : activeSegment
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(0,0,0,0.06)",
                    }}
                    aria-hidden
                  />
                  <span
                    className={`pointer-events-none absolute inset-y-0 rounded-[999px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] opacity-0`}
                    style={{
                      ...bubbleStyle,
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                    }}
                    aria-hidden
                  />
                  <div
                    className="relative z-10 flex flex-col sm:flex-row items-stretch group/segments"
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <div
                      ref={vendorSegmentRef}
                      className="relative flex flex-1 items-stretch sm:overflow-visible group/vendor cursor-pointer"
                      onMouseEnter={() => setHoveredSegment("vendor")}
                    >
                      <span
                        className="pointer-events-none absolute inset-y-0 left-0 right-0 rounded-[999px] transition-opacity duration-200 sm:-left-14"
                        style={{
                          opacity:
                            !activeSegment && hoveredSegment === "vendor" ? 1 : 0,
                          backgroundColor: "rgba(0,0,0,0.08)",
                          zIndex: 5,
                        }}
                        aria-hidden
                      />
                      <label
                        htmlFor="vendor-search"
                        className="peer/vendor relative z-20 flex flex-1 cursor-pointer flex-col justify-center gap-1 px-6 py-4"
                        onClick={() => setActiveSegment("vendor")}
                      >
                        <span className="text-[13px] font-bold uppercase tracking-wide text-black/80">
                          Vendeurs
                        </span>
                        <input
                          id="vendor-search"
                          type="search"
                          value={vendorQuery}
                          onChange={(e) => setVendorQuery(e.target.value)}
                          placeholder="Rechercher un vendeur"
                          autoComplete="off"
                          className="w-full bg-transparent text-sm text-black placeholder-black/40 focus:outline-none cursor-pointer focus:cursor-text"
                          onFocus={() => setActiveSegment("vendor")}
                          onBlur={(event) =>
                            setActiveSegment(
                              resolveSegmentFromTarget(event.relatedTarget)
                            )
                          }
                        />
                      </label>
                    </div>
                    <div
                      className="hidden sm:block w-px bg-black/10 transition-opacity duration-150 group-hover/segments:opacity-0 group-focus-within/segments:opacity-0"
                      aria-hidden
                    />
                    <div
                      className="sm:hidden h-px bg-black/10 mx-6"
                      aria-hidden
                    />
                    <div
                      ref={productSegmentRef}
                      className="relative flex flex-1 items-stretch sm:overflow-visible group/product cursor-pointer"
                      onMouseEnter={() => setHoveredSegment("product")}
                    >
                      <span
                        className="pointer-events-none absolute inset-y-0 left-0 right-0 rounded-[999px] transition-opacity duration-200 sm:-right-14"
                        style={{
                          opacity:
                            !activeSegment && hoveredSegment === "product" ? 1 : 0,
                          backgroundColor: "rgba(0,0,0,0.08)",
                          zIndex: 5,
                        }}
                        aria-hidden
                      />
                      <label
                        htmlFor="product-search"
                        className="peer/product relative z-20 flex flex-1 cursor-pointer flex-col justify-center gap-1 px-6 py-4"
                        onClick={() => setActiveSegment("product")}
                      >
                        <span className="text-[13px] font-bold uppercase tracking-wide text-black/80">
                          Produits
                        </span>
                        <input
                          id="product-search"
                          type="search"
                          value={productQuery}
                          onChange={(e) => setProductQuery(e.target.value)}
                          placeholder="Trouver un produit"
                          autoComplete="off"
                          className="w-full bg-transparent text-sm text-black placeholder-black/40 focus:outline-none cursor-pointer focus:cursor-text"
                          onFocus={() => setActiveSegment("product")}
                          onBlur={(event) =>
                            setActiveSegment(
                              resolveSegmentFromTarget(event.relatedTarget)
                            )
                          }
                        />
                      </label>
                      <div className="relative z-10 flex items-center justify-center sm:justify-end px-4 sm:px-3 pb-4 sm:pb-0">
                        <button
                          type="submit"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FF385C] text-white shadow-sm transition-transform hover:scale-[1.06] cursor-pointer"
                          aria-label="Rechercher"
                          onFocus={() => setActiveSegment("product")}
                          onBlur={(event) =>
                            setActiveSegment(
                              resolveSegmentFromTarget(event.relatedTarget)
                            )
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4-4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </header>

        <div className="h-40 md:h-48" aria-hidden />

        {/* Categories row */}

        {/* Popular section */}
        <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <Section title="Vendeurs Certifiés">
            {loading ? (
              <RailSkeleton type="vendor" />
            ) : (
              <Rail vendors={vendors} />
            )}
          </Section>

          <Section title="Catalogue">
            {loading ? (
              <ProductRailSkeleton />
            ) : (
              <ProductRail products={products} />
            )}
          </Section>

          {/* CTA Become a seller */}
          <div className="mt-10 md:mt-14">
            <div className="rounded-3xl border border-black/10 bg-white shadow-[0_6px_30px_rgba(0,0,0,0.06)] px-5 md:px-8 py-8 flex flex-col items-center text-center gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-black">
                  Devenir vendeur
                </h3>
                <p className="mt-1 text-sm text-black/60 max-w-2xl">
                  Rejoignez la marketplace et vendez vos produits en quelques
                  clics.
                </p>
              </div>
              <Link
                href="/devenir-vendeur"
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-medium text-black hover:bg-black/5"
              >
                En savoir plus
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </Link>
            </div>
          </div>
        </main>
        <div className="mt-16 md:mt-2" aria-hidden />
        <SiteFooter />
      </div>
    </div>
  );
}

function RailSkeleton({ type }: { type: "vendor" | "product" }) {
  return (
    <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
      <div className="flex gap-2 overflow-x-hidden pb-2">
        <div className="min-w-full">
          <div className="grid grid-cols-6 gap-2 items-stretch">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative w-full shrink-0 select-none overflow-hidden rounded-2xl border border-gray-200"
              >
                <div className="relative aspect-square w-full bg-gray-100 animate-pulse" />
                <div className="mt-2 px-2 pb-2 text-center">
                  <div className="mx-auto h-4 w-24 bg-gray-100 rounded animate-pulse" />
                  {type === "vendor" ? (
                    <div className="mx-auto mt-1 h-3 w-20 bg-gray-100 rounded animate-pulse" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRailSkeleton() {
  return (
    <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
      <div className="flex gap-2 overflow-x-hidden pb-2">
        <div className="min-w-full">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-stretch">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="relative w-full shrink-0 select-none overflow-hidden rounded-xl border border-gray-200"
              >
                <div className="relative aspect-square w-full bg-gray-100 animate-pulse" />
                <div className="p-2">
                  <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="mt-2 h-3 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const scrollBy = (delta: number) => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = root.querySelector(
      '[data-scrollable="true"]'
    ) as HTMLElement | null;
    if (scroller) scroller.scrollBy({ left: delta, behavior: "smooth" });
  };
  return (
    <section ref={rootRef as any} className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-black">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Défiler vers la gauche"
            onClick={() => scrollBy(-400)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 bg-transparent hover:bg-gray-50"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Défiler vers la droite"
            onClick={() => scrollBy(400)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-gray-200"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

function Rail({ vendors }: { vendors: Vendor[] }) {
  const pages: Vendor[][] = React.useMemo(() => {
    const res: Vendor[][] = [];
    for (let i = 0; i < vendors.length; i += 6)
      res.push(vendors.slice(i, i + 6));
    return res;
  }, [vendors]);
  return (
    <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
      <div
        className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
        data-scrollable="true"
      >
        {/* Hide scrollbar webkit */}
        <style jsx>{`
          [data-scrollable="true"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {pages.map((page, idx) => (
          <div key={idx} className="min-w-full snap-start">
            <div className="grid grid-cols-6 gap-2 items-stretch">
              {page.map((v) => (
                <Card key={v.id} vendor={v} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ vendor }: { vendor: Vendor }) {
  return (
    <article className="relative w-full shrink-0 select-none cursor-pointer overflow-hidden rounded-2xl bg-white border border-gray-200 group">
      <Link
        href={`/vendors/${vendor.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Voir ${vendor.name}`}
      />

      <div className="">
        <div className="relative aspect-square w-full bg-black/5 overflow-hidden">
          {vendor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.avatarUrl}
              alt={vendor.name}
              className="absolute inset-0 h-full w-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-black/40 text-sm">
              {vendor.name?.slice(0, 1) || "•"}
            </div>
          )}
          {/* Base state looks like previous hover: keep gradient visible */}
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 88%, rgba(0,0,0,0.8) 100%)",
            }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-2 text-center opacity-0"></div>
      </div>
      <div className="mt-2 px-2 pb-2 text-center">
        <div className="mx-auto inline-flex items-center gap-1 text-sm font-semibold text-black whitespace-nowrap">
          <span className="truncate max-w-[9rem]">{vendor.name}</span>
          <Image
            src={certifIcon}
            alt="certifié"
            width={12}
            height={12}
            className="inline-block shrink-0"
          />
        </div>
        {vendor.name ? (
          <Link
            href={`/vendors/${vendor.id}`}
            className="block text-[11px] text-black/60 truncate"
          >
            @{vendor.name.toLowerCase().replace(/\s+/g, "")}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function ProductRail({ products }: { products: Product[] }) {
  // Chunk products into pages of 12 (6 cols x 2 rows on desktop)
  const pages: Product[][] = React.useMemo(() => {
    const res: Product[][] = [];
    for (let i = 0; i < products.length; i += 12)
      res.push(products.slice(i, i + 12));
    return res;
  }, [products]);

  return (
    <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
      <div
        className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] snap-x snap-mandatory"
        data-scrollable="true"
      >
        {/* Hide scrollbar webkit */}
        <style jsx>{`
          [data-scrollable="true"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {pages.map((page, pageIdx) => (
          <div key={pageIdx} className="min-w-full snap-start">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-stretch">
              {page.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [favorite, setFavorite] = React.useState(false);
  const [hoverSeller, setHoverSeller] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("favoriteProductIds") || "[]";
      const ids = JSON.parse(raw);
      setFavorite(Array.isArray(ids) && ids.includes(product.id));
    } catch {}
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite((prev) => {
      const next = !prev;
      try {
        const raw = localStorage.getItem("favoriteProductIds") || "[]";
        let ids: string[] = [];
        try {
          ids = JSON.parse(raw);
        } catch {
          ids = [];
        }
        if (next) {
          if (!ids.includes(product.id)) ids.push(product.id);
        } else {
          ids = ids.filter((id) => id !== product.id);
        }
        localStorage.setItem("favoriteProductIds", JSON.stringify(ids));
      } catch {}
      return next;
    });
  };

  return (
    <article className="relative w-full shrink-0 select-none rounded-xl bg-white border border-gray-200 group">
      <div className="overflow-hidden rounded-xl">
        <div className="relative aspect-square w-full bg-black/5">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-black/40 text-sm">
              {product.name?.slice(0, 1) || "•"}
            </div>
          )}
          {/* Seller overlay top-left */}
          <div className="absolute left-2 top-2 z-20 flex items-center gap-2 min-w-0">
            <Link
              href={`/vendors/${product.sellerId || ""}`}
              className="h-7 w-7 rounded-full overflow-hidden ring-1 ring-white/60 shrink-0"
              aria-label={`Voir ${product.sellerName || "vendeur"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {product.sellerAvatarUrl ? (
                <img
                  src={product.sellerAvatarUrl}
                  alt={product.sellerName || "Vendeur"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-[10px] text-white/80">
                  {(product.sellerName || "")[0] || "•"}
                </div>
              )}
            </Link>
            {product.sellerName ? (
              <Link
                href={`/vendors/${product.sellerId || ""}`}
                className="truncate text-[12px] text-white hover:text-white/80"
              >
                {product.sellerName}
              </Link>
            ) : null}
          </div>
          {/* Heart (favorites) - Airbnb style */}
          <button
            className="absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-black shadow-md ring-1 ring-black/10 hover:shadow-lg transition"
            onClick={toggleFavorite}
            aria-label={
              favorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
            aria-pressed={favorite}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={favorite ? "#FF385C" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          {/* Dark gradient to improve text readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/95" />
          {/* Overlayed product info */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-2 pb-2.5 text-center text-white">
            <div className="truncate text-sm font-semibold">{product.name}</div>
            <div className="mt-0.5 text-[12px] text-white/90">
              {Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(product.price || 0)}
            </div>
            <div className="mt-1 flex justify-center">
              <Link
                href={`/products/${product.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/90 bg-white px-2.5 py-0.5 text-[10px] font-medium text-black"
              >
                Consulter
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
