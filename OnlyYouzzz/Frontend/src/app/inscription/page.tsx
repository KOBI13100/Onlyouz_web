"use client";
import { AuthCard, RegisterForm } from "@/components/auth";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function InscriptionPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/');
  }
  return null;
}


