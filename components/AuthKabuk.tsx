import KurguAfis from "@/components/ui/KurguAfis";

// Giriş / kayıt sayfalarının ortak kabuğu: solda perde + afişler, sağda form.
export default function AuthKabuk({
  slogan,
  children,
}: {
  slogan: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[calc(100dvh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      <section className="perde-zemin text-stone-50 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-altin mb-4">Perdea</p>
          <h1 className="text-5xl font-bold leading-[1.02]">{slogan}</h1>
        </div>
        <div className="relative h-72" aria-hidden>
          <KurguAfis sahne="ay" className="absolute left-0 bottom-0 w-36 -rotate-6" />
          <KurguAfis sahne="perde" className="absolute left-28 bottom-6 w-36 rotate-3" />
          <KurguAfis sahne="gunes" className="absolute left-60 bottom-0 w-36 -rotate-2" />
          <KurguAfis sahne="fener" className="absolute left-[23rem] bottom-8 w-36 rotate-6" />
        </div>
      </section>

      <section className="flex items-center justify-center px-4 sm:px-6 py-12 kagit">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
