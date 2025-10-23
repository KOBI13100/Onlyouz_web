"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function AppPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const applyPad = !(pathname && pathname.startsWith("/mon-espace"));
  return <main className={applyPad ? "pt-0" : "pt-0"}>{children}</main>;
}


