import Link from "next/link";
import { Clapperboard } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-stone-50 min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Clapperboard className="w-7 h-7" />
        </div>
        <h1 className="text-5xl font-bold text-stone-900 mb-3">404</h1>
        <p className="text-stone-600 mb-6 leading-relaxed">
          Aradığın sayfa yok ya da kaldırılmış. Filmlerdeki o alternatif
          evrenlerden birinde kalmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ana sayfaya dön
          </Link>
          <Link
            href="/kesfet"
            className="border border-stone-300 hover:border-emerald-600 text-stone-700 hover:text-emerald-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Keşfet'e git
          </Link>
        </div>
      </div>
    </main>
  );
}
