export default function ProductsLoading() {
  return (
    <div className="px-4 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-black/10" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-20 rounded bg-black/10" />
          <div className="h-9 w-40 rounded-lg bg-black/10" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-[16px] border border-gray-300 bg-white/80 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)]">
            <div className="aspect-[4/5] w-full bg-black/5" />
            <div className="p-3">
              <div className="h-3 w-3/5 rounded bg-black/10" />
              <div className="mt-2 h-3 w-1/3 rounded bg-black/10" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="h-8 w-24 rounded-full border border-black/10 bg-black/5" />
        <div className="h-4 w-24 rounded bg-black/10" />
        <div className="h-8 w-24 rounded-full border border-black/10 bg-black/5" />
      </div>
    </div>
  );
}


