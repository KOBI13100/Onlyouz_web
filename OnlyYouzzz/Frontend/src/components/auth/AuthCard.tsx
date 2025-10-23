"use client";
import React from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-black/60">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
};

export default AuthCard;


