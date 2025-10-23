"use client";
import React from "react";

export default function RevealMount() {
  React.useEffect(() => {
    const singles = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal-group]"));
    const processed = new WeakSet<HTMLElement>();

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("revealed");
          } else {
            el.classList.remove("revealed");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    const setupSingle = (el: HTMLElement) => {
      if (processed.has(el)) return;
      processed.add(el);
      el.classList.add("reveal");
      io.observe(el);
    };

    const setupGroup = (group: HTMLElement) => {
      if (processed.has(group)) return;
      processed.add(group);
      const baseDelay = parseInt(group.getAttribute('data-reveal-base') || '0', 10) || 0;
      const step = parseInt(group.getAttribute('data-reveal-step') || '90', 10) || 90;
      const mode = group.getAttribute('data-reveal-by');
      const children = Array.from(group.children) as HTMLElement[];
      if (mode === 'row') {
        // Calcul par lignes: regrouper les enfants partageant un top similaire
        const groupRect = group.getBoundingClientRect();
        const rows: { top: number; items: HTMLElement[] }[] = [];
        const tolerance = 6; // px
        children.forEach((child) => {
          const r = child.getBoundingClientRect();
          const top = r.top - groupRect.top;
          // trouver une ligne existante proche
          let row = rows.find((rw) => Math.abs(rw.top - top) <= tolerance);
          if (!row) {
            row = { top, items: [] };
            rows.push(row);
          }
          row.items.push(child);
        });
        rows.sort((a, b) => a.top - b.top);
        rows.forEach((row) => {
          // Même délai pour toutes les lignes (pas d'accumulation par index de ligne)
          const delay = baseDelay;
          row.items.forEach((child) => {
            child.classList.add('reveal');
            (child.style as any).transitionDelay = `${delay}ms`;
            io.observe(child);
          });
        });
      } else {
        // Stagger élément par élément (comportement existant)
        children.forEach((child, index) => {
          child.classList.add('reveal');
          (child.style as any).transitionDelay = `${baseDelay + index * step}ms`;
          io.observe(child);
        });
      }
    };

    // Singles
    singles.forEach(setupSingle);

    // Groups with stagger
    groups.forEach(setupGroup);

    // Ensure reveal on initial load for elements already in view
    const ensureInitial = () => {
      [...singles, ...groups.flatMap((g) => Array.from(g.children) as HTMLElement[])].forEach((el) => {
        if (inView(el)) el.classList.add("revealed");
      });
    };
    // Run after paint and again after images/fonts settle
    requestAnimationFrame(ensureInitial);
    window.addEventListener("load", ensureInitial);

    // Dynamically observe new nodes (route changes / CSR)
    const mo = new MutationObserver((records) => {
      records.forEach((rec) => {
        rec.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.hasAttribute('data-reveal')) setupSingle(n);
          if (n.hasAttribute('data-reveal-group')) setupGroup(n);
          n.querySelectorAll<HTMLElement>('[data-reveal]').forEach(setupSingle);
          n.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach(setupGroup);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return null;
}


