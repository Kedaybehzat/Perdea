import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-emerald-700 mb-3">Perdea</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Film, dizi ve anime severler için sosyal eşleşme platformu.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-3">Keşfet</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/kesfet" className="text-stone-600 hover:text-emerald-700">Keşfet</Link></li>
              <li><Link href="/eslesme" className="text-stone-600 hover:text-emerald-700">Eşleş</Link></li>
              <li><Link href="/vizyon" className="text-stone-600 hover:text-emerald-700">Vizyon</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-3">Topluluk</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/topluluk" className="text-stone-600 hover:text-emerald-700">Gruplar</Link></li>
              <li><Link href="/topluluk" className="text-stone-600 hover:text-emerald-700">Forum</Link></li>
              <li><Link href="/topluluk" className="text-stone-600 hover:text-emerald-700">Listeler</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-3">Perdea</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hakkimizda" className="text-stone-600 hover:text-emerald-700">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-stone-600 hover:text-emerald-700">İletişim</Link></li>
              <li><Link href="/gizlilik" className="text-stone-600 hover:text-emerald-700">Gizlilik</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            © 2026 Perdea. Tüm hakları saklıdır.
          </p>
          <p className="text-stone-500 text-xs italic">
            Bu ürün TMDB API kullanmaktadır ancak TMDB tarafından onaylanmamıştır.
          </p>
        </div>
      </div>
    </footer>
  );
}