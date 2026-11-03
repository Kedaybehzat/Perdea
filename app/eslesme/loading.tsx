export default function EslesmeLoading() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="h-8 w-56 bg-stone-200 rounded mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-stone-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-7 w-48 bg-stone-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-stone-200 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 h-64 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
