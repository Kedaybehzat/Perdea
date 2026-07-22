import Link from "next/link";

type YakindaSayfasiProps = {
  baslik: string;
  aciklama: string;
  faz: string;
};

export default function YakindaSayfasi({ baslik, aciklama, faz }: YakindaSayfasiProps) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
          <span className="text-3xl">🎬</span>
        </div>

        <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full mb-6">
          {faz}
        </span>

        <h1 className="text-5xl font-bold text-stone-900 mb-4">
          {baslik}
        </h1>

        <p className="text-lg text-stone-600 leading-relaxed mb-10">
          {aciklama}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Ana sayfaya dön
          </Link>
          <Link
            href="/kayit"
            className="inline-block px-6 py-3 border border-stone-300 text-stone-700 rounded-lg font-semibold hover:border-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Perdea'ya kayıt ol
          </Link>
        </div>
      </div>
    </main>
  );
}