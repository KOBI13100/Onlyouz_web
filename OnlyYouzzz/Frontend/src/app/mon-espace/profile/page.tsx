"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";

export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  if (!user) return null;

  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(user.avatarUrl || null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [verified, setVerified] = React.useState<boolean>(Boolean(user.verified));
  const [description, setDescription] = React.useState<string>(user.description || '');
  const [dateOfBirth, setDateOfBirth] = React.useState<string>(user.dateOfBirth ? user.dateOfBirth.slice(0,10) : '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [gender, setGender] = React.useState<string>(user.gender || 'non précisé');

  // Keep form fields in sync if the authenticated user object updates
  React.useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPreview(user.avatarUrl || null);
    setVerified(Boolean(user.verified));
    setDescription(user.description || '');
    setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
    setGender(user.gender || 'non précisé');
  }, [user]);

  React.useEffect(() => {
    if (!avatar) return;
    const url = URL.createObjectURL(avatar);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  const handleFileSelect = (file: File | null) => {
    setAvatar(file);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  async function handleSave() {
    if (!token) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      if (avatar) form.append('avatar', avatar);
      if (typeof description === 'string') form.append('description', description);
      if (dateOfBirth) form.append('dateOfBirth', dateOfBirth);
      if (gender) form.append('gender', gender);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/auth/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      updateUser({ name: data.name, email: data.email, verified: data.verified, lastSeen: data.lastSeen, description: data.description || '', dateOfBirth: data.dateOfBirth || null, gender: data.gender || 'non précisé', ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}) } as any);
      setMessage('Profil mis à jour');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section removed per design */}

      <div className="p-0">
        <div className="max-w-6xl mx-auto">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl border border-black/10 p-5 mb-6 shadow-sm mx-auto w-full relative">
            <button
              type="button"
              onClick={logout}
              title="Déconnexion"
              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/70 hover:text-black hover:bg-black/5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Déconnexion
            </button>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex flex-col items-center lg:items-start">
                <div 
                  className="relative h-28 w-28 overflow-hidden rounded-full bg-black/[0.05] cursor-pointer hover:bg-black/[0.08] transition-colors group mb-3"
                  onClick={handleAvatarClick}
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-black/50 group-hover:text-black/70 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📷</div>
                        <div>Cliquer pour ajouter</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-full"></div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/80 hover:bg-black/5 hover:border-black/20 transition-colors"
                >
                  Changer la photo
                </button>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} 
                  className="hidden" 
                />
              </div>
              
              <div className="flex-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-black">{user.name}</h3>
                    {verified ? (
                      <span title="Vérifié" className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-black/60">{user.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/10 text-black/80">
                      {user.role === 'vendeur' ? 'Vendeur' : 'Client'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations Section */}
          <div className="bg-white rounded-2xl border border-black/10 p-8 shadow-sm mx-auto w-full">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-black/70">Statut du compte</div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4" />
                <span>Vérifié</span>
              </label>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nom complet</label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10 transition-colors" 
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Adresse email</label>
                <input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10 transition-colors" 
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date de naissance
                  {dateOfBirth ? (
                    <span className="ml-2 text-black/50 text-xs">(
                      {formatAgeFR(dateOfBirth)}
                    )</span>
                  ) : null}
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10 transition-colors"
                  lang="fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Genre</label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-black/10 bg-white pr-12 pl-4 py-3 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10 transition-colors"
                  >
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="non précisé">Non précisé</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description vendeur */}
          {user.role === 'vendeur' ? (
            <div className="mt-6">
              <label className="block text-sm font-medium text-black mb-2">Description publique</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Décrivez votre boutique, votre style, votre expertise…"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10 transition-colors"
              />
              <div className="mt-1 text-xs text-black/50">{description.length}/1000</div>
            </div>
          ) : null}

          {/* Messages Section */}
          {(error || message) && (
            <div className="mt-6">
              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : null}
              {message ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-sm text-emerald-600">{message}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Actions Section */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
            <VerifyAction token={token} verified={verified} onUpdated={(v) => { setVerified(v); updateUser({ verified: v } as any); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAgeFR(isoDate: string): string {
  try {
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return "";
    const birth = new Date(Number(y), Number(m) - 1, Number(d));
    if (isNaN(birth.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hasNotHadBirthdayThisYear =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (hasNotHadBirthdayThisYear) age -= 1;
    return age <= 1 ? `${age} an` : `${age} ans`;
  } catch {
    return "";
  }
}

function VerifyAction({ token, verified, onUpdated }: { token: string | null; verified: boolean; onUpdated: (v: boolean) => void }) {
  const [saving, setSaving] = React.useState(false);
  if (!token) return null;
  const toggle = async () => {
    try {
      setSaving(true);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/api/auth/me/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verified: !verified })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdated(Boolean(data.verified));
      }
    } finally {
      setSaving(false);
    }
  };
  return (
    <button onClick={toggle} disabled={saving} className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-black hover:bg-white/90">
      {verified ? 'Retirer vérification' : 'Vérifier le compte'}
    </button>
  );
}


