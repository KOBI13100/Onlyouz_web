"use client";
import React from "react";
import { useRouter } from "next/navigation";

type AuthButtonProps = {
  onClick?: () => void;
  isAuthenticated?: boolean;
};

const AuthButton: React.FC<AuthButtonProps> = ({ onClick, isAuthenticated }) => {
  const router = useRouter();
  const defaultAction = () => {
    if (isAuthenticated) {
      router.push("/profil");
    } else {
      router.push("/connexion");
    }
  };
  return (
    <button
      type="button"
      onClick={onClick ?? defaultAction}
      className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black/90"
    >
      {isAuthenticated ? "Profil" : "Connexion"}
    </button>
  );
};

export default AuthButton;


