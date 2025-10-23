"use client";
import React from "react";
import { useLocale } from "@/providers/LocaleProvider";

type LanguageSwitcherProps = {
  variant?: "compact" | "pill";
};

export default function LanguageSwitcher({ variant = "pill" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const gradientId = React.useId();

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      {variant === "pill" ? (
        <div className={`rounded-full p-[2px] bg-transparent ${open ? "ring-2 ring-gray-300/70" : ""}`}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-16 items-center justify-between rounded-full bg-white px-2 hover:bg-black/5 hover:text-black"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span className="sr-only">Changer de langue</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M8 10l4 4 4-4" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white/10 backdrop-blur-md hover:bg-white/20 ${open ? "ring-2 ring-gray-300/70" : ""}`}
          aria-haspopup="menu"
          aria-expanded={open}
          title="Langue"
        >
          <span className="sr-only">Changer de langue</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
          </svg>
        </button>
      )}
      {open && (
        <div role="menu" className="absolute right-0 mt-2 rounded-2xl border border-gray-200 bg-white/95 shadow-xl p-2 text-sm w-40">
          {([
            { code: "en", label: "EN" },
            { code: "fr", label: "FR" },
          ] as const).map((opt) => (
            <button
              key={opt.code}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 ${locale === opt.code ? "font-semibold" : ""}`}
              onClick={() => { setLocale(opt.code as any); setOpen(false); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
              </svg>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


