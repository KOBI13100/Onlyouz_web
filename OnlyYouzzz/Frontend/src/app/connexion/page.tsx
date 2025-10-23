"use client";
import { AuthCard, LoginForm } from "@/components/auth";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  if (ready && user) {
    router.replace(user.role === "vendeur" ? "/mon-espace" : "/");
    return null;
  }
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-4 md:px-6">
      <AuthCard title="Connexion" subtitle="Accédez à votre compte">
        <LoginForm />
      </AuthCard>
    </div>
  );
}


