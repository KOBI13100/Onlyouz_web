"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FollowHeader({ vendorId, vendorName, avatarUrl, email, verified, lastSeen }: { vendorId: string; vendorName: string; avatarUrl?: string; email?: string; verified?: boolean; lastSeen?: string | Date | null; }) {
  const [followers, setFollowers] = React.useState<number>(0);
  const [following, setFollowing] = React.useState<boolean>(false);
  const { token, ready } = useAuth();
  const router = useRouter();

  const load = React.useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${base}/api/vendors/${vendorId}/followers`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers ?? 0);
        setFollowing(Boolean(data.following));
      }
    } catch {}
  }, [vendorId, token]);

  React.useEffect(() => { load(); }, [load]);

  const toggle = async () => {
    if (!token) {
      router.push('/inscription');
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const path = following ? 'unfollow' : 'follow';
      const res = await fetch(`${base}/api/vendors/${vendorId}/${path}`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers ?? 0);
        setFollowing(Boolean(data.following));
      }
    } catch {}
  };

  const handle = (vendorName || '').toLowerCase().replace(/\s+/g, '');
  return (
    <div className="flex items-center justify-between gap-6" data-reveal>
      <div className="shrink-0">
        <Link href={`/vendors/${vendorId}`} className="group inline-block w-max" aria-label={`Voir ${vendorName}`}>
          <div className="h-32 inline-block overflow-hidden rounded-xl">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={vendorName} className="h-full w-auto object-contain align-top transition-transform duration-300 ease-out group-hover:scale-110 will-change-transform" />
            ) : null}
          </div>
        </Link>
      </div>
      <div className="flex-1 self-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate max-w-[12rem] md:max-w-[16rem] text-base md:text-lg font-semibold text-black">{vendorName}</h1>
            {verified ? (
              <span title="Vérifié" className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white text-[9px]">✓</span>
            ) : null}
          </div>
          <div className="text-sm text-black/60">@{handle}</div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-black/70"><span className="font-semibold">{followers}</span> abonnés</div>
            <div className="text-xs text-black/50">•</div>
            <Activity lastSeen={lastSeen} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-center" data-reveal-group>
        <button onClick={toggle} className={`rounded-full px-5 py-2.5 text-sm font-medium text-white ${following ? 'bg-black/70 hover:bg-black/80' : 'bg-black hover:bg-black/90'}`}>
          {following ? 'Se désabonner' : 'Suivre'}
        </button>
        <a href={`/messagerie/${vendorId}`} className="rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/90 border border-gray-200">Contacter ce vendeur</a>
      </div>
    </div>
  );
}

function Activity({ lastSeen }: { lastSeen?: string | Date | null }) {
  const d = lastSeen ? new Date(lastSeen) : null;
  const minutes = d ? Math.floor((Date.now() - d.getTime()) / 60000) : Infinity;
  let color = 'bg-red-500';
  let text = 'hors ligne';
  if (minutes !== Infinity) {
    if (minutes < 1) { color = 'bg-emerald-500'; text = 'en ligne'; }
    else if (minutes < 60) { color = 'bg-gray-400'; text = `vu il y a ${minutes} min`; }
    else if (minutes < 60 * 24) { color = 'bg-gray-400'; text = `vu il y a ${Math.floor(minutes/60)} h`; }
    else if (minutes < 60 * 24 * 7) { color = 'bg-gray-400'; text = `vu il y a ${Math.floor(minutes/(60*24))} j`; }
    else { color = 'bg-gray-400'; text = `vu il y a ${Math.floor(minutes/(60*24*7))} sem`; }
  }
  return (
    <div className="mt-1 flex items-center gap-2 text-sm text-black/70">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />
      <span>{text}</span>
    </div>
  );
}


