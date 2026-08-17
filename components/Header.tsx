import Link from "next/link";
import Image from "next/image";
import { cikisYap } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";


export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Perdea logosu"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          <span className="text-2xl font-bold text-emerald-700">Perdea</span>
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
          {user ? (
            <>
              <Link
                href="/profil"
                className="text-stone-700 hover:text-emerald-700 transition-colors hidden sm:block"
              >
                Profil
              </Link>
              <form action={cikisYap}>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Çıkış Yap
                </button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}