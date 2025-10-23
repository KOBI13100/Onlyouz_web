"use client";
import React from "react";

const SellerCTA: React.FC = () => {
  return (
    <section data-reveal className="relative py-12 md:py-16">
      {/* Décor subtil en arrière-plan (respecte le fond blanc) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-48 w-[80%] max-w-5xl rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(232,177,153,0.22) 0%, rgba(232,177,153,0.08) 60%, transparent 75%)" }}
      />

      <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:p-12">
        <div data-reveal-group className="text-center">
          <h2 className="mx-auto mt-0 max-w-4xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            L'érotisme mérite une belle vitrine
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-black/70 md:text-lg">
            Lancez vos ventes aujourd'hui, en toute élégance
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <Chip icon={<IconShield />} label="Anonymat & paiements sécurisés" />
            <Chip icon={<IconTruck />} label="Expéditions confidentielles" />
            <Chip icon={<IconWand />} label="Support créateurs dédié" />
          </div>

          <div className="mt-10 flex items-center justify-center">
            <a
              href="/devenir-vendeur"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8B199] px-6 py-3 text-sm font-medium text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[#E8B199] hover:shadow-md hover:scale-[1.04]"
            >
              Devenir vendeur
              <IconArrow />
            </a>
          </div>

          {/* punchline optionnelle retirée */}
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;

// Sous-composants
function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] shadow-sm">
      <span className="text-black/70">{icon}</span>
      {label}
    </span>
  );
}

//

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17l8-8" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="7" r="3" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <circle cx="17" cy="9" r="2" />
      <path d="M22 21a5 5 0 0 0-7-4" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconWand() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 18l8-8" />
      <path d="M14 10l2 2" />
      <path d="M16 4l0.01 0" />
      <path d="M20 8l0.01 0" />
      <path d="M4 14l0.01 0" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-4" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="18.5" cy="18.5" r="1.5" />
    </svg>
  );
}


