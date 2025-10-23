"use client";
import React from "react";
import Image from "next/image";

type HeroProps = {
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

const Hero: React.FC<HeroProps> = ({ onPrimaryClick, onSecondaryClick }) => {
  const [stage, setStage] = React.useState(0); // 0: rien, 1: avatars+count, 2: titre, 3: sous-titre, 4: recherche, 5: boutons
  const timersRef = React.useRef<number[]>([]);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    const computeTimings = () => {
      const conn: any = (typeof navigator !== 'undefined' && (navigator as any).connection) || null;
      const ect = conn?.effectiveType as string | undefined; // 'slow-2g' | '2g' | '3g' | '4g'
      // Plus rapide par défaut; on garde un léger ralenti sur réseaux lents
      if (ect === 'slow-2g' || ect === '2g') return { start: 350, step: 320 };
      if (ect === '3g') return { start: 300, step: 280 };
      return { start: 250, step: 250 }; // 4g/unknown
    };

    const runSequence = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setStage(0); // reset pour rejouer à chaque montage
      const { start: START_DELAY, step: STEP_DELAY } = computeTimings();
      // 5 étapes: [avatars+count, title, subtitle, search, buttons]
      const delays = Array.from({ length: 5 }, (_, i) => START_DELAY + i * STEP_DELAY);
      delays.forEach((delay, idx) => {
        const id = window.setTimeout(() => {
          requestAnimationFrame(() => setStage(idx + 1));
        }, delay) as unknown as number;
        timersRef.current.push(id);
      });
    };

    const startNextFrame = () => {
      // Démarre de façon fiable après peinture (utile quand il n'y a pas de splash)
      requestAnimationFrame(() => requestAnimationFrame(runSequence));
    };

    // Démarrer quand: 1) page entièrement chargée (load) ET 2) splash terminé (ou absent)
    let observer: MutationObserver | null = null;
    let loaded = typeof document !== 'undefined' && document.readyState === 'complete';
    let splashDone = false;

    const maybeStart = () => {
      if (loaded && splashDone) startNextFrame();
    };

    const onSplashEnd = () => {
      splashDone = true;
      maybeStart();
    };

    if (typeof window !== 'undefined') {
      // load
      const onLoad = () => { loaded = true; maybeStart(); };
      if (!loaded) window.addEventListener('load', onLoad, { once: true });

      // splash
      const splash = document.querySelector('.oyz-splash');
      if (splash) {
        window.addEventListener('oyz:splash:end', onSplashEnd);
        observer = new MutationObserver(() => {
          if (!document.querySelector('.oyz-splash')) {
            splashDone = true;
            maybeStart();
            observer && observer.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        splashDone = true;
        maybeStart();
      }
    }

    const onPageShow = () => {
      // Rejoue l'animation lors d'un retour via l'historique (bfcache)
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      startedRef.current = false;
      startNextFrame();
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('oyz:splash:end', onSplashEnd);
      window.removeEventListener('pageshow', onPageShow);
      if (observer) observer.disconnect();
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      startedRef.current = false;
    };
  }, []);
  return (
    <section id="hero" className="py-12 md:py-16">
      <div className={`mx-auto max-w-5xl text-center`}>
        {/* Avatars + compteur (ensemble) */}
        <div className={`oyz-reveal ${stage >= 1 ? 'oyz-in' : ''}`} aria-hidden={stage < 1} role="presentation">
          <AvatarsRow />
        </div>
        <div className={`mt-2 text-[11px] md:text-xs text-black/60 oyz-reveal ${stage >= 1 ? 'oyz-in' : ''}`} aria-hidden={stage < 1} role="presentation">+150 vendeurs érotiques</div>
        {/* Titre principal */}
        <h1 data-reveal data-reveal-title className={`font-display mt-4 text-4xl font-semibold leading-[1.4] tracking-tight md:text-[46px] oyz-reveal ${stage >= 2 ? 'oyz-in' : ''}`} aria-hidden={stage < 2}>
          La première marketplace
          <br className="hidden md:block" />
          qui fait de votre <span className="fade-word">intimité</span> une marque
        </h1>
        <style jsx>{`
          .fade-word {
            display: inline-block;
            -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,1) 100%);
                    mask-image: linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,1) 100%);
            -webkit-mask-size: 100% 100%;
                    mask-size: 100% 100%;
          }
          .oyz-reveal {
            opacity: 0;
            transform: translateY(8px) scale(0.99);
            transition: opacity 420ms cubic-bezier(.22,.61,.36,1), transform 420ms cubic-bezier(.22,.61,.36,1);
            will-change: opacity, transform;
          }
          .oyz-reveal.oyz-in {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        `}</style>
        {/* Sous-titre */}
        <p className={`mx-auto mt-4 max-w-3xl text-black/70 md:text-lg oyz-reveal ${stage >= 3 ? 'oyz-in' : ''}`} aria-hidden={stage < 3}>
          Une solution tout-en-un pour vendre et acheter des objets érotiques personnels en ligne, avec anonymat garanti livraisons discrètes et paiements sécurisés.
        </p>

        {/* Barre de recherche */}
        <div className={`oyz-reveal ${stage >= 4 ? 'oyz-in' : ''}`} aria-hidden={stage < 4}>
          <SellerSearch />
        </div>

        {/* Boutons */}
        <div className={`mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center oyz-reveal ${stage >= 5 ? 'oyz-in' : ''}`} aria-hidden={stage < 5}>
          <a
            href="/products"
            onClick={onPrimaryClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium bg-white/10 backdrop-blur-lg border border-gray-300 text-black shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] transition-all hover:bg-gradient-to-b hover:from-gray-100 hover:to-white hover:scale-[1.02] md:w-auto"
          >
            Voir le catalogue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>
          </a>
          <a
            href="/devenir-vendeur"
            onClick={onSecondaryClick}
            className="w-full rounded-full bg-[#E8B199] px-6 py-3 text-sm font-medium text-white shadow-md transition-transform hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-[#E8B199] md:w-auto"
          >
            Devenir vendeur
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

function SellerSearch() {
  const [q, setQ] = React.useState("");

  const go = React.useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    window.location.assign(`/vendors?${params.toString()}`);
  }, [q]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go();
    }
  };

  return (
    <div id="hero-search" className="mx-auto mt-6 w-full max-w-xl">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Rechercher un vendeur…"
          className="w-full rounded-full border border-gray-300 bg-white/80 px-5 pr-12 py-3 text-sm outline-none placeholder-black/40 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)]"
        />
          <button
          onClick={go}
          aria-label="Rechercher"
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-sm transition-transform hover:scale-[1.06] hover:bg-black/90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AvatarsRow() {
  // Images importées depuis src/ (1.png, 2.png, ...)
  // Si un fichier manque, ajoute-le dans src/ et relance le dev server.
  // @ts-ignore - Next gère les imports d'images statiques
  const img1 = require("@/1.png");
  // @ts-ignore
  const img2 = require("@/2.png");
  // @ts-ignore
  const img3 = require("@/3.png");
  // @ts-ignore
  const img4 = require("@/4.png");
  // @ts-ignore
  const img5 = require("@/5.png");
  // @ts-ignore
  const img6 = require("@/6.png");
  const avatars = [img1, img2, img3, img4, img5, img6];

  return (
    <div className="mx-auto flex justify-center">
      {avatars.slice(0, 6).map((src: any, i: number) => (
        <div key={i} className={`h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden ring-2 ring-white/70 shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:scale-[1.03] transition-transform ${i === 0 ? '' : '-ml-2 md:-ml-3'} relative`} style={{ zIndex: 10 - i }}>
          <Image src={src} alt="vendeur" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}


