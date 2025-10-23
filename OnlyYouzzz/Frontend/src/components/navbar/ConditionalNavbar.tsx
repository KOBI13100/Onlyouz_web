"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (pathname.startsWith("/mon-espace")) return null;
  return <Navbar />;
}


