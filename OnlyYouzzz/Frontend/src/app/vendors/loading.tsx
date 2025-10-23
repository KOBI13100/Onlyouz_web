export default function VendorsLoading() {
  return (
    <div className="space-y-6 animate-pulse px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-5 w-40 rounded bg-black/10" />
          <div className="mt-1 h-3 w-24 rounded bg-black/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-40 rounded-full border border-gray-300 bg-white/80" />
          <div className="relative h-9 w-40 rounded-full border border-gray-300 bg-white/90" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-[20px] border border-gray-300 bg-black/5" />
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


