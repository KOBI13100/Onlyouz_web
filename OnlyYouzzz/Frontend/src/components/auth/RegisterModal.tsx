"use client";
import React from "react";
import { createPortal } from "react-dom";
import AuthCard from "./AuthCard";
import RegisterForm from "./RegisterForm";
import { useAuth } from "@/providers/AuthProvider";

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
};

export default function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { user } = useAuth();
  React.useEffect(() => {
    if (open && user) onClose();
  }, [open, user, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="relative w-full max-w-2xl">
          <AuthCard title="Créer un compte" subtitle="Rejoignez Onlyouzz" onClose={onClose}>
            <RegisterForm />
            <div className="mt-4 text-center text-sm text-black/60">
              Déjà un compte ?
              <button onClick={onSwitchToLogin} className="ml-2 font-medium text-black hover:underline">
                Se connecter
              </button>
            </div>
          </AuthCard>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}


