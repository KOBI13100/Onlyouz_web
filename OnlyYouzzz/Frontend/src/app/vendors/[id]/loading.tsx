export default function VendorDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-black/10" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-black/10" />
          <div className="h-3 w-28 rounded bg-black/10" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-[16px] border border-black/10 bg-black/5" />
        ))}
      </div>
    </div>
  );
}


