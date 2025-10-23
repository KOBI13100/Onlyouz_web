export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 mt-4 animate-pulse">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[4/5] rounded-2xl bg-black/5" />
        <div className="space-y-4">
          <div className="h-5 w-3/4 rounded bg-black/10" />
          <div className="h-4 w-1/3 rounded bg-black/10" />
          <div className="h-24 w-full rounded bg-black/5" />
          <div className="h-9 w-40 rounded-full bg-black/10" />
        </div>
      </div>
    </div>
  );
}


