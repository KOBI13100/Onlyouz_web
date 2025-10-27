"use client";
import React from "react";
import Navbar from "@/components/navbar/Navbar";

export default function EncheresComingSoon() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="grid place-items-center pt-28 pb-10">
        <div className="text-center">
          <div className="mt-40 text-[10vw] leading-none font-extrabold text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(0,0,0,0.4),rgba(0,0,0,0.2),rgba(0,0,0,0.1))] select-none">
            COMING SOON...
          </div>
          <div className="mt-4 text-black/50">Les enchères arrivent très bientôt.</div>
        </div>
      </div>
    </div>
  );
}


