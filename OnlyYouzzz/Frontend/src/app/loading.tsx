export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 animate-pulse">
      <div className="h-6 w-40 rounded bg-black/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl border border-black/10 bg-black/5" />
        ))}
      </div>
    </div>
  );
}


