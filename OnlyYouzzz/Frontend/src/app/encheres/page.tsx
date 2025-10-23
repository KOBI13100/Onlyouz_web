"use client";
import React from "react";
import Navbar from "@/components/navbar/Navbar";

export default function EncheresComingSoon() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="grid place-items-center pt-28 pb-10">
        <div className="text-center">
          <div className="mt-40 text-[10vw] leading-none font-extrabold text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95),rgba(229,229,229,0.7),rgba(31,41,55,0.8))] select-none">
            COMING SOON...
          </div>
          <div className="mt-4 text-white/80">Les enchères arrivent très bientôt.</div>
        </div>
      </div>
    </div>
  );
}


