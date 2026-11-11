export default function KesfetLoading() {
  return (
    <main className="bg-stone-50 min-h-screen" aria-busy="true" aria-label="Yükleniyor">
      <div className="perde-zemin h-56 md:h-64" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="iskelet h-10 w-64 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="iskelet aspect-[2/3] rounded-2xl!" />
              <div className="iskelet h-4 mt-3" />
              <div className="iskelet h-3 w-1/2 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
