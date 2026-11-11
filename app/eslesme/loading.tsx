export default function EslesmeLoading() {
  return (
    <main className="bg-stone-50 min-h-screen" aria-busy="true" aria-label="Yükleniyor">
      <div className="perde-zemin h-56 md:h-64" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="iskelet h-[26rem] rounded-3xl!" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="iskelet h-32 rounded-2xl!" />
          ))}
        </div>
      </div>
    </main>
  );
}
