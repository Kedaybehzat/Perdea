import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-emerald-700">
          Perdea
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/kesfet" className="text-stone-700 hover:text-emerald-700 transition-colors">
            Keşfet
          </Link>
          <Link href="/eslesme" className="text-stone-700 hover:text-emerald-700 transition-colors">
            Eşleş
          </Link>
          <Link href="/topluluk" className="text-stone-700 hover:text-emerald-700 transition-colors">
            Topluluk
          </Link>
          <Link href="/vizyon" className="text-stone-700 hover:text-emerald-700 transition-colors">
            Vizyon
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/giris"
            className="text-stone-700 hover:text-emerald-700 transition-colors hidden sm:block"
          >
            Giriş
          </Link>
          <Link
            href="/kayit"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </header>
  );
}