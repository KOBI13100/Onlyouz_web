"use client";
import React from "react";
import RoleToggle, { UserRole } from "./RoleToggle";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type RegisterFormProps = {
  onSubmit?: (data: { name: string; email: string; password: string; role: UserRole }) => void;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const { login } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("acheteur");
  const [loading, setLoading] = React.useState(false);
  const [dateOfBirth, setDateOfBirth] = React.useState<string>("");
  const [gender, setGender] = React.useState<string>("non précisé");
  const [username, setUsername] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      onSubmit?.({ name: fullName, email, password, role });
      const data = await postJson<{ message: string; token: string; user: { id: string; name: string; email: string; role: string } }>("/api/auth/register", {
        name: fullName || username,
        email,
        password,
        role,
        dateOfBirth,
        gender,
        username,
      });
      setSuccess(data.message || "Compte créé");
      if (data.token && data.user) {
        login({ token: data.token, user: data.user });
        if (data.user.role === "vendeur") {
          router.replace("/mon-espace");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // Préselection du rôle via ?role=vendeur
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const r = (params.get("role") || "").trim();
      if (r === "vendeur" || r === "acheteur") {
        setRole(r as UserRole);
      }
    } catch {}
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="scale-[0.95] origin-top">
        <RoleToggle value={role} onChange={setRole} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium">Prénom</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
            placeholder="Prénom"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">Nom</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
            placeholder="Nom"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pseudo</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
            placeholder="Ex: @onlyuser"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
          >
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
            <option value="non précisé">Non précisé</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date de naissance</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
          placeholder="vous@exemple.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
          placeholder="••••••••"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border border-black/80 bg-transparent px-5 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors"
      >
        {loading ? "Création..." : "Créer un compte"}
      </button>
    </form>
  );
};

export default RegisterForm;


