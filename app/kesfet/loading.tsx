export default function KesfetLoading() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="h-8 w-48 bg-stone-200 rounded mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-5 mb-8 h-20 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden"
            >
              <div className="aspect-[2/3] bg-stone-200 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-stone-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-stone-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
