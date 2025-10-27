"use client";
import React from "react";

type MediaItem = { type: "image" | "video"; url: string };

export default function MediaCarousel({ images, videos = [], topRightOverlay }: { images: string[]; videos?: string[]; topRightOverlay?: React.ReactNode }) {
  const media: MediaItem[] = React.useMemo(() => {
    const imgs = (images || []).filter(Boolean).map((u) => ({ type: "image" as const, url: u }));
    const vids = (videos || []).filter(Boolean).map((u) => ({ type: "video" as const, url: u }));
    const all = [...imgs, ...vids];
    return all.length ? all : [];
  }, [images, videos]);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = React.useState(0);

  // Sync idx on scroll (snap)
  const onScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  }, [idx]);

  // Reset scroll when media list changes
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: 0 });
      setIdx(0);
    }
  }, [media.map(m => m.url).join('|')]);

  const go = (next: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(media.length - 1, next));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIdx(clamped);
  };

  if (!media.length) {
    return (
      <div className="relative aspect-square w-56 md:w-72 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="grid h-full w-full place-items-center text-sm text-black/50">Pas d'image</div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-56 md:w-72">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth rounded-2xl border border-black/10 bg-white shadow-sm no-scrollbar"
      >
        <div className="flex h-full w-full">
          {media.map((m, i) => (
            <div key={i} className="snap-center shrink-0 w-full h-full relative">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={`media-${i}`} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <video src={m.url} className="absolute inset-0 h-full w-full object-cover" controls playsInline />
              )}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(to left, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%), linear-gradient(to right, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay top-right */}
      {topRightOverlay ? (
        <div className="absolute right-2 top-2 z-20">
          {topRightOverlay}
        </div>
      ) : null}

      {/* Arrows */}
      {media.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Précédent"
            onClick={() => go(idx - 1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center text-gray-200 hover:text-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={() => go(idx + 1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center text-gray-200 hover:text-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>

          {/* Dots */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {media.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}


