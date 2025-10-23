"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

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
      router.push('/connexion');
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

  return (
    <div className="flex items-center justify-between gap-4" data-reveal>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-black/[0.05]" data-reveal>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={vendorName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div data-reveal-group>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{vendorName}</h1>
            {verified ? (
              <span title="Vérifié" className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
            ) : null}
          </div>
          <p className="text-sm text-black/60">{email}</p>
          <Activity lastSeen={lastSeen} />
          <div className="mt-1 text-sm"><span className="font-semibold">{followers}</span> abonnés</div>
        </div>
      </div>
      <div className="flex items-center gap-2" data-reveal-group>
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


