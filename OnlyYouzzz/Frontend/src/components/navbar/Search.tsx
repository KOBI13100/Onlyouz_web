"use client";
import React from "react";

type SearchProps = {
  onSearch?: (query: string) => void;
};

const Search: React.FC<SearchProps> = ({ onSearch }) => {
  const [value, setValue] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Rechercher"
        className="w-full rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-black/40 focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
      >
        Chercher
      </button>
    </form>
  );
};

export default Search;


