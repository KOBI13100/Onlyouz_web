"use client";
import React from "react";
import { useRouter } from "next/navigation";

type SignUpButtonProps = {
  onClick?: () => void;
};

const SignUpButton: React.FC<SignUpButtonProps> = ({ onClick }) => {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.push("/inscription"))}
      className="rounded-full px-3.5 py-1.5 text-sm font-medium text-white shadow-sm bg-black transition-transform hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-black/90"
    >
      Créer un compte
    </button>
  );
};

export default SignUpButton;


