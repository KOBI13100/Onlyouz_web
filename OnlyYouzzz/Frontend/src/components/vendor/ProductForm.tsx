"use client";
import React from "react";
import { useAuth } from "@/providers/AuthProvider";

type ProductFormProps = {
  onCreated?: (productId: string) => void;
};

const ProductForm: React.FC<ProductFormProps> = ({ onCreated }) => {
  const { token, user } = useAuth();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Veuillez vous connecter.");
      return;
    }
    if (user?.role !== "vendeur") {
      setError("Accès réservé aux vendeurs.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      for (const f of files) formData.append("files", f);
      if (tags.length) formData.append("tags", JSON.stringify(tags));
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${base}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setMessage("Produit créé");
      onCreated?.(data.id);
      setName("");
      setDescription("");
      setPrice("");
      setFiles([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [files]);

  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onAddTag = () => {
    const cleaned = tagInput.trim().replace(/^#/, "");
    if (!cleaned) return;
    if (tags.includes(cleaned)) return;
    setTags((t) => [...t, cleaned]);
    setTagInput("");
  };

  const onRemoveTag = (t: string) => {
    setTags((all) => all.filter((x) => x !== t));
  };

  const [heroIdx, setHeroIdx] = React.useState(0);
  React.useEffect(() => {
    if (previews.length === 0) setHeroIdx(0);
    else if (heroIdx > previews.length - 1) setHeroIdx(previews.length - 1);
  }, [previews, heroIdx]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-12">
        {/* Informations générales */}
        <section className="md:col-span-7 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-black mb-3">Informations générales</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nom du produit</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Prix (€)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <label className="text-xs font-medium">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
              rows={4}
            />
          </div>
        </section>

        {/* Upload images */}
        <section className="md:col-span-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-black mb-3">Images</div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/[0.04] ring-1 ring-black/5">
            {previews[heroIdx] ? (
              files[heroIdx]?.type?.startsWith('video') ? (
                <video src={previews[heroIdx]} className="h-full w-full object-cover" muted loop playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[heroIdx]} alt="Aperçu principal" className="h-full w-full object-cover" />
              )
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-black/40">Aucune image</div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto">
            {previews.map((src, i) => (
              <button type="button" key={i} onClick={() => setHeroIdx(i)} className={`relative shrink-0 rounded-lg border ${i === heroIdx ? 'border-black ring-2 ring-black/20' : 'border-black/10'} bg-white p-1 transition-shadow`}> 
                <div className="aspect-square w-16 overflow-hidden rounded-md bg-black/[0.03]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {files[i]?.type?.startsWith('video') ? (
                    <video src={src} className="h-full w-full object-cover" muted loop playsInline />
                  ) : (
                    <img src={src} alt={`Miniature ${i+1}`} className="h-full w-full object-cover" />
                  )}
                </div>
              </button>
            ))}
            <label className="shrink-0 inline-flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-black/15 bg-white px-3 py-2 text-xs font-medium text-black hover:bg-black/5">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => { const incoming = Array.from(e.target.files || []); setFiles((prev) => [...prev, ...incoming]); if (e.target) e.target.value = ""; }}
                className="hidden"
              />
              + Ajouter
            </label>
          </div>
        </section>
      </div>

      {/* Pricing & Tags */}
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-black mb-3">Tarification et tags</div>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <label className="text-xs font-medium">Prix (€)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
            />
          </div>
          <div className="md:col-span-9">
            <label className="text-xs font-medium">Tags</label>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-medium">
                  #{t}
                  <button type="button" onClick={() => onRemoveTag(t)} className="ml-1 text-black/50 hover:text-black">×</button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-black/60 text-xs">#</span>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); } }}
                placeholder="ajouter un tag et Entrée"
                className="flex-1 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
              />
              <button type="button" onClick={onAddTag} className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm hover:bg-black/5">Ajouter</button>
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" disabled={loading} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/5">Enregistrer le brouillon</button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black/90"
        >
          {loading ? "Envoi..." : "Ajouter le produit"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;


