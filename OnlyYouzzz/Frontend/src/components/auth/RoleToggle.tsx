"use client";
import React from "react";

export type UserRole = "acheteur" | "vendeur";

type RoleToggleProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

const RoleToggle: React.FC<RoleToggleProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4 grid grid-cols-2 rounded-full border border-black/10 bg-white p-1 text-sm">
      <button
        type="button"
        onClick={() => onChange("acheteur")}
        className={`rounded-full px-4 py-2 font-medium ${
          value === "acheteur" ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
        }`}
      >
        Acheteur
      </button>
      <button
        type="button"
        onClick={() => onChange("vendeur")}
        className={`rounded-full px-4 py-2 font-medium ${
          value === "vendeur" ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
        }`}
      >
        Vendeur
      </button>
    </div>
  );
};

export default RoleToggle;


