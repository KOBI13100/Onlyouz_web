"use client";
import React from "react";

export default function SplashScreen() {
  const [mounted, setMounted] = React.useState(false);
  const [show, setShow] = React.useState(false); // évite le flash sur autres pages
  const [fade, setFade] = React.useState(false);
  const [textVisible, setTextVisible] = React.useState(false);
  const [textIn, setTextIn] = React.useState(false);
  const [exitUp, setExitUp] = React.useState(false);
  const prevOverflowRef = React.useRef("");

  React.useEffect(() => {
    setMounted(true);
    try {
      const path = typeof window !== 'undefined' ? (window.location?.pathname || '') : '';
      const isHome = path === '/' || path === '' || path === '/newhome' || path === '/newhome/';
      const already = typeof window !== 'undefined' && sessionStorage.getItem('oyz_splash_shown') === '1';
      if (!isHome || already) {
        setShow(false);
        try { window.dispatchEvent(new CustomEvent('oyz:splash:end')); } catch {}
        return;
      }
      // marquer pour cette session uniquement (premier chargement de l'onglet)
      sessionStorage.setItem('oyz_splash_shown', '1');
      setShow(true);
      // bloquer le scroll
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Timeline
      const tShowText = setTimeout(() => {
        setTextVisible(true);
        // déclenche le fade-in immédiat après insertion
        requestAnimationFrame(() => setTextIn(true));
      }, 200); // 0.2s (apparition plus rapide)
      const tFadeText = setTimeout(() => setFade(true), 1400); // fade-out du texte plus tard pour le voir
      return () => {
        clearTimeout(tShowText);
        clearTimeout(tFadeText);
        document.body.style.overflow = prevOverflowRef.current;
      };
    } catch {
      // ignore
    }
  }, []);

  if (!mounted || !show) return null;

  return (
    <div className={`oyz-splash ${exitUp ? 'oyz-splash-exit' : ''}`}>
      {textVisible ? (
        <span
          className={`oyz-word ${textIn ? 'oyz-word-in' : ''} ${fade ? 'oyz-word-fade' : ''}`}
          onTransitionEnd={(e) => {
            if (e.propertyName !== 'opacity') return;
            if (!fade) return; // ne déclenche qu'à la fin du fade-out
            setExitUp(true);
            // retirer l'overlay après l'animation de montée (plus rapide)
            setTimeout(() => {
            try { window.dispatchEvent(new CustomEvent('oyz:splash:end')); } catch {}
              setShow(false);
              try { document.body.style.overflow = prevOverflowRef.current; } catch {}
            }, 550);
          }}
        >onlyouz</span>
      ) : null}
      <style jsx>{`
        .oyz-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: #000;
          will-change: transform, opacity;
          transition: transform 550ms ease, opacity 550ms ease; /* montée plus rapide */
        }
        .oyz-splash-exit { transform: translateY(-100%); opacity: 0.96; }
        .oyz-word {
          color: #fff;
          font-family: var(--font-blanquotey);
          font-size: clamp(22px, 4.5vw, 52px);
          line-height: 1;
          opacity: 0;
          transition: opacity 500ms ease-in-out;
          will-change: opacity;
        }
        .oyz-word-in { opacity: 1; }
        .oyz-word-fade { opacity: 0; }
      `}</style>
    </div>
  );
}


