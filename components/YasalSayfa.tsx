import { yasal } from "@/lib/yasal";

// KVKK ve Koşullar sayfalarının ortak kabuğu: okunaklı, dar sütun.
export default function YasalSayfa({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-stone-50 min-h-screen">
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
          {yasal.urunAdi}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-[1.05]">{baslik}</h1>
        <p className="mt-3 text-sm text-stone-500">Son güncelleme: {yasal.guncelleme}</p>
        <div className="mt-8 space-y-8 text-stone-800 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-emerald-700 [&_a]:underline">
          {children}
        </div>
      </article>
    </main>
  );
}
