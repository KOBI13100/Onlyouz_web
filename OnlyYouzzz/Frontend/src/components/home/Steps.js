"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
// import iphoneMock from "@/img/mockup/iphone3.png";
// import IpadMock from "@/img/mockup/ipad.png";
// import MacMock from "@/img/mockup/mac.png";

const Index = () => {
    const containerRef = useRef(null);
    const stepRefs = useRef([]);
    const [progress, setProgress] = useState(0); // 0 → 1 hauteur remplie
    const [stepRatios, setStepRatios] = useState([]); // position verticale relative des étapes (0..1)
    const [lineTop, setLineTop] = useState(0); // décalage du début de la ligne par rapport au conteneur
    const lineTopRef = useRef(0);
    const [lineEnd, setLineEnd] = useState(0); // position Y (px) de fin de la ligne dans le conteneur
    const lineEndRef = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    const steps = [
        {
            title: "1. Inscription",
            text:
                "Créez votre compte en 1 minute, confirmez votre e‑mail et commencez à enchérir.",
        },
        {
            title: "2. Trouvez votre bonheur",
            text:
                "Explorez nos produits, ajoutez vos favoris et dénichez la meilleure offre en un clin d’œil.",
        },
        {
            title: "3. Livraison rapide et discrète",
            text:
                "Réglez en toute sécurité. Expédition 24/48h, suivi en ligne et emballage neutre.",
        },
    ];

    // Paramètres prédéfinis (desktop) pour la timeline
    const CARD_HEIGHT = 300; // h-[300px]
    const GAP_Y = 16; // space-y-4 => 1rem = 16px
    // Décalages verticaux finaux appliqués via framer-motion (y négatif)
    const CARD_Y_OFFSETS = [0, 50, 100];
    const LINE_HEIGHT = (CARD_HEIGHT + GAP_Y) * 2 - CARD_Y_OFFSETS[2] + CARD_HEIGHT; // 832px
    const CENTER_OFFSETS = [
        CARD_HEIGHT / 2 + 0, // 150
        (CARD_HEIGHT + GAP_Y) * 1 - CARD_Y_OFFSETS[1] + CARD_HEIGHT / 2, // 316 - 50 + 150 = 416
        (CARD_HEIGHT + GAP_Y) * 2 - CARD_Y_OFFSETS[2] + CARD_HEIGHT / 2, // 632 - 100 + 150 = 682
    ];

    // Recalcule la ligne, les ratios et la progression en fonction des positions (mesure dynamique)
    useEffect(() => {
        const updateGeometry = () => {
            const container = containerRef.current;
            if (!container) return;
            const cRect = container.getBoundingClientRect();

            const firstCard = stepRefs.current[0];
            const lastCard = stepRefs.current[stepRefs.current.length - 1];
            if (!firstCard || !lastCard) return;

            const firstRect = firstCard.getBoundingClientRect();
            const lastRect = lastCard.getBoundingClientRect();

            // Ligne démarre en haut de la 1ère carte et se termine en bas de la dernière
            const start = Math.max(0, firstRect.top - cRect.top);
            const end = Math.max(start + 1, lastRect.bottom - cRect.top);

            lineTopRef.current = start;
            lineEndRef.current = end;
            setLineTop(start);
            setLineEnd(end);

            // Ratios dynamiques basés sur le centre de chaque carte
            const effectiveHeight = Math.max(1, end - start);
            const ratios = stepRefs.current.map((el) => {
                if (!el) return 0;
                const r = el.getBoundingClientRect();
                const center = (r.top - cRect.top) + (r.height / 2);
                return Math.max(0, Math.min(1, (center - start) / effectiveHeight));
            });
            setStepRatios(ratios);

            // Progression basée sur le centre viewport
            const viewportCenter = window.innerHeight / 2;
            const p = (viewportCenter - (cRect.top + start)) / effectiveHeight;
            setProgress(Math.max(0, Math.min(1, p)));
        };

        updateGeometry();
        const onScroll = () => {
            // Utilise RAF pour éviter trop de recalculs pendant le scroll
            if (typeof window !== 'undefined') {
                window.requestAnimationFrame(updateGeometry);
            } else {
                updateGeometry();
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        const id = setTimeout(updateGeometry, 80);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            clearTimeout(id);
        };
    }, []);

    // Détection responsive (mobile < sm)
    useEffect(() => {
        const detect = () => setIsMobile(window.innerWidth < 640);
        detect();
        window.addEventListener("resize", detect);
        return () => window.removeEventListener("resize", detect);
    }, []);

    // Calcule le début (top) et la fin (bottom) de la ligne pour coller aux étapes (mesure dynamique)
    useEffect(() => {
        const measure = () => {
            const container = containerRef.current;
            const first = stepRefs.current?.[0];
            const last = stepRefs.current?.[stepRefs.current.length - 1];
            if (!container || !first || !last) return;
            const cRect = container.getBoundingClientRect();
            const fRect = first.getBoundingClientRect();
            const lRect = last.getBoundingClientRect();
            const t = Math.max(0, fRect.top - cRect.top);
            const e = Math.max(t + 1, lRect.bottom - cRect.top);
            lineTopRef.current = t;
            lineEndRef.current = e;
            setLineTop(t);
            setLineEnd(e);

            // Met à jour aussi les ratios des centres des cartes
            const effectiveHeight = Math.max(1, e - t);
            const ratios = stepRefs.current.map((el) => {
                if (!el) return 0;
                const r = el.getBoundingClientRect();
                const center = (r.top - cRect.top) + (r.height / 2);
                return Math.max(0, Math.min(1, (center - t) / effectiveHeight));
            });
            setStepRatios(ratios);
        };
        measure();
        window.addEventListener("resize", measure);
        const id = setTimeout(measure, 60);
        return () => {
            window.removeEventListener("resize", measure);
            clearTimeout(id);
        };
    }, []);

    // Met à jour la progression de la ligne en fonction du scroll
    useEffect(() => {
        const onScroll = () => {
            const c = containerRef.current;
            if (!c) return;
            const rect = c.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const start = lineTopRef.current;
            const end = lineEndRef.current || rect.height;
            const p = (viewportCenter - (rect.top + start)) / Math.max(1, end - start);
            setProgress(Math.max(0, Math.min(1, p)));
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative flex flex-col sm:mt-32 mt-16 justify-center sm:px-0 px-4 w-full">
            <div className="flex flex-col space-y-4 sm:px-10 lg:px-[8vw] px-0">
                {/* Carte 1 */}
                <motion.div
                    ref={(el) => (stepRefs.current[0] = el)}
                    className="relative bg-white rounded-[26px] border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10 px-7 py-8 sm:w-[300px] lg:w-[400px] xl:w-[550px] w-full sm:h-auto xl:h-[300px] h-auto flex items-center"
                    initial={{ rotate: -8, x: -100, y: 40, opacity: 0, scale: 0.96 }}
                    whileInView={{ rotate: 0, x: 0, y: 0, opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ type: "tween", duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="flex w-full items-center xl:flex-row flex-col gap-6">
                        <div className="shrink-0 sm:block -mt-10">
                            <Image src="/step_signup.svg" alt="Inscription" width={72} height={72} />
                        </div>
                        <div className="space-y-3">
                            <div className="font-opensauce-b text-[20px] leading-relaxed text-noir mb-1">
                                {steps[0].title}
                            </div>
                            <div className="font-opensauce text-[14px] text-gray-500">
                                {steps[0].text}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Carte 2 */}
                <motion.div
                    ref={(el) => (stepRefs.current[1] = el)}
                    className="relative bg-white rounded-[26px] border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10 px-7 py-8 sm:w-[300px] lg:w-[400px] xl:w-[550px] w-full sm:h-auto xl:h-[300px] h-auto sm:self-end flex items-center"
                    initial={{ rotate: 8, x: 100, y: 40, opacity: 0, scale: 0.96 }}
                    whileInView={{ rotate: 0, x: 0, y: isMobile ? 0 : -50, opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ type: "tween", duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="flex w-full items-center xl:flex-row flex-col gap-6">
                        <div className="space-y-3 xl:order-1 order-2">
                            <div className="font-opensauce-b text-[20px] leading-relaxed text-noir/90 mb-1">
                                {steps[1].title}
                            </div>
                            <div className="font-opensauce text-[14px] text-noir/70">
                                {steps[1].text}
                            </div>
                        </div>
                        <div className="shrink-0 sm:block xl:order-2 order-1 xl:-mr-4 xl:-mt-4">
                            <Image src="/step_find.svg" alt="Trouvez votre bonheur" width={72} height={72} />
                        </div>
                    </div>
                </motion.div>

                {/* Carte 3 */}
                <motion.div
                    ref={(el) => (stepRefs.current[2] = el)}
                    className="relative bg-white rounded-[26px] border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10 px-7 py-8 sm:w-[300px] lg:w-[400px] xl:w-[550px] w-full sm:h-auto xl:h-[300px] h-auto flex items-center"
                    initial={{ rotate: -8, x: -100, y: 40, opacity: 0, scale: 0.96 }}
                    whileInView={{ rotate: 0, x: 0, y: isMobile ? 0 : -100, opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ type: "tween", duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    <div className="flex w-full items-center xl:flex-row flex-col gap-6">
                        <div className="shrink-0 sm:block xl:-ml-2 xl:-mt-4">
                            <Image src="/step_delivery.svg" alt="Livraison rapide et discrète" width={72} height={72} />
                        </div>
                        <div className="space-y-3">
                            <div className="font-opensauce-b text-[20px] leading-relaxed text-noir/90 mb-1">
                                {steps[2].title}
                            </div>
                            <div className="font-opensauce text-[14px] text-noir/70">
                                {steps[2].text}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            {/* Ligne verticale + progression (desktop uniquement >= sm) */}
            <div
                className={`pointer-events-none absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-black/15 rounded z-0 ${isMobile ? "hidden" : "hidden sm:block"}`}
                style={{
                    top: `${lineTop}px`,
                    height: `${Math.max(0, lineEnd - lineTop)}px`,
                    WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0))",
                    maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0))",
                }}
            >
                <div
                    className="absolute left-0 top-0 w-full bg-black rounded"
                    style={{ height: `${progress * 100}%` }}
                />
            </div>

            {/* Points alignés sur le trait central (desktop uniquement >= sm) */}
            {!isMobile && [0, 1, 2].map((i) => {
                const ratio = stepRatios[i] ?? ((i + 0.5) / steps.length);
                const filled = progress >= ratio - 0.001;
                const topPx = lineTop + ratio * Math.max(1, lineEnd - lineTop);
                return (
                    <div
                        key={`dot-${i}`}
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2 hidden sm:block z-10"
                        style={{ top: `${topPx}px` }}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 ${filled ? "bg-black border-black" : "bg-white border-black/20"}`} />
                    </div>
                );
            })}

            {/* Ancien mapping supprimé */}
        </div>
    );
};

export default Index;