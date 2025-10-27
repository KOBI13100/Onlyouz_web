"use client";
import React from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose?: () => void;
};

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, onClose }) => {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center">
      <div className="relative mb-5">
        <h1 className="text-2xl font-semibold tracking-tight leading-none">{title}</h1>
        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="close-btn absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center text-black/80 hover:text-black"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
        {subtitle ? (
          <p className="mt-2 text-sm text-black/60">{subtitle}</p>
        ) : null}
      </div>
      {children}
      <style jsx>{`
        .close-btn:hover svg {
          animation: rotateHalf 0.033s linear;
          transform-origin: 50% 50%;
        }
        @keyframes rotateHalf {
          from { transform: rotate(0deg); }
          to { transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCard;


