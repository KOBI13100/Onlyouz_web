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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 py-1.5">
          <label className="text-xs font-medium">Nom du produit</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs focus:border-black/20 focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div className="space-y-1.5 py-1.5">
          <label className="text-xs font-medium">Prix (€)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs focus:border-black/20 focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>
      <div className="space-y-1.5 py-1.5">
        <label className="text-xs font-medium">Description</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs focus:border-black/20 focus:ring-2 focus:ring-black/10"
          rows={2}
        />
      </div>
      <div className="space-y-1.5 py-1.5">
        <label className="text-xs font-medium">Médias</label>
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-full overflow-x-auto">
            <div className="flex items-center gap-2 w-max">
              {previews.length ? previews.map((src, i) => (
                <div key={i} className="relative rounded-lg border border-black/10 bg-white p-1.5">
                  <div className="aspect-square w-20 md:w-24 overflow-hidden rounded-md bg-black/[0.03]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {files[i]?.type?.startsWith('video') ? (
                      <video src={src} className="h-full w-full object-cover" muted loop playsInline />
                    ) : (
                      <img src={src} alt={`Aperçu ${i+1}`} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFileAt(i)}
                    className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-transparent hover:bg-black/5"
                    aria-label="Retirer ce média"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              )) : (
                <div className="grid h-20 w-full place-items-center text-[10px] text-black/50">Aucun fichier</div>
              )}
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-black/90">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => { const incoming = Array.from(e.target.files || []); setFiles((prev) => [...prev, ...incoming]); if (e.target) e.target.value = ""; }}
              className="hidden"
            />
            Ajouter des médias
          </label>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5 py-1.5">
        <label className="text-xs font-medium">Tags</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium">
              #{t}
              <button type="button" onClick={() => onRemoveTag(t)} className="ml-1 text-black/50 hover:text-black">×</button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-black/60 text-xs">#</span>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); } }}
            placeholder="ajouter un tag et Entrée"
            className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs focus:border-black/20 focus:ring-2 focus:ring-black/10"
          />
          <button type="button" onClick={onAddTag} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-black/5">Ajouter</button>
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <div className="flex items-center justify-center pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#ff4747] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#ff4747]/90"
        >
          {loading ? "Envoi..." : "Ajouter le produit"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;


