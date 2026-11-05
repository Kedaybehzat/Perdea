import Link from "next/link";
import Image from "next/image";
import { cikisYap } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import MobilMenu from "./MobilMenu";

const navLinkleri = [
  { href: "/kesfet", etiket: "Keşfet" },
  { href: "/eslesme", etiket: "Eşleş" },
  { href: "/baslik", etiket: "Başlıklar" },
  { href: "/oyun", etiket: "Oyun" },
  { href: "/vizyon", etiket: "Vizyon" },
];

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
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
          {navLinkleri.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-stone-700 hover:text-emerald-700 transition-colors"
            >
              {l.etiket}
            </Link>
          ))}
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
              <form action={cikisYap} className="hidden sm:block">
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
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium hidden sm:inline-block"
              >
                Kayıt Ol
              </Link>
            </>
          )}

          <MobilMenu girisli={Boolean(user)} navLinkleri={navLinkleri} />
        </div>
      </div>
    </header>
  );
}
