export default function ProfilLoading() {
  return (
    <main className="bg-stone-50 min-h-screen" aria-busy="true" aria-label="Yükleniyor">
      <div className="perde-zemin h-48" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="iskelet h-40 rounded-3xl! -mt-24 relative" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="iskelet aspect-[2/3] rounded-2xl!" />
          ))}
        </div>
      </div>
    </main>
  );
}
