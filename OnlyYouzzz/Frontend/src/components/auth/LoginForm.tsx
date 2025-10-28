"use client";
import React from "react";
import RoleToggle, { UserRole } from "./RoleToggle";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type LoginFormProps = {
  onSubmit?: (data: { email: string; password: string; role: UserRole }) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("acheteur");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      onSubmit?.({ email, password, role });
      const data = await postJson<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        "/api/auth/login",
        { email, password }
      );
      setSuccess(`Bienvenue ${data.user.name}`);
      login({ token: data.token, user: data.user });
      if (data.user.role === "vendeur") {
        router.replace("/mon-espace");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <RoleToggle value={role} onChange={setRole} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
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
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-black/20 focus:ring-2 focus:ring-black/10"
          placeholder="••••••••"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <div className="text-center">
        <button
        type="submit"
        disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-black/80 bg-transparent px-5 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      </div>
    </form>
  );
};

export default LoginForm;


