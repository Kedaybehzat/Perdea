export default function ProfilLoading() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="h-48 md:h-56 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="-mt-16 md:-mt-20 flex items-end gap-5">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white bg-stone-200 animate-pulse" />
          <div className="pb-2 flex-1 min-w-0 space-y-2">
            <div className="h-9 w-64 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 h-64 animate-pulse" />
          <div className="bg-white border border-stone-200 rounded-2xl p-6 h-80 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 h-48 animate-pulse" />
          <div className="bg-white border border-stone-200 rounded-2xl p-6 h-40 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
