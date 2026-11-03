import Link from "next/link";
import Image from "next/image";
import { cikisYap } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import MobilMenu from "./MobilMenu";

const navLinkleri = [
  { href: "/kesfet", etiket: "Keşfet" },
  { href: "/eslesme", etiket: "Eşleş" },
  { href: "/topluluk", etiket: "Topluluk" },
  { href: "/vizyon", etiket: "Vizyon" },
];

async function aktifYol(): Promise<string> {
  // Server component'ten pathname yok — proxy'nin sized header'ı okuyabilir.
  // Yoksa boş döneriz (vurgusuz).
  try {
    const h = await headers();
    return h.get("x-pathname") ?? "";
  } catch {
    return "";
  }
}

export default async function Header() {
  const supabase = await createClient();
  const [{ data: { user } }, yol] = await Promise.all([
    supabase.auth.getUser(),
    aktifYol(),
  ]);

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
          {navLinkleri.map((l) => {
            const aktif = yol === l.href || yol.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors ${
                  aktif
                    ? "text-emerald-700 font-semibold"
                    : "text-stone-700 hover:text-emerald-700"
                }`}
              >
                {l.etiket}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/profil"
                className={`transition-colors hidden sm:block ${
                  yol.startsWith("/profil")
                    ? "text-emerald-700 font-semibold"
                    : "text-stone-700 hover:text-emerald-700"
                }`}
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
