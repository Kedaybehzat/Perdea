'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Search } from "lucide-react";
import { cikisYap } from "@/app/auth/actions";
import { anaNav, toplulukNav, aktifMi } from "./navigasyon";

export default function MobilMenu({ girisli }: { girisli: boolean }) {
  const [acik, setAcik] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (acik) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [acik]);

  const satir = (href: string) =>
    `px-3 py-2.5 rounded-xl font-medium transition-colors ${
      aktifMi(pathname, href)
        ? "bg-emerald-50 text-emerald-800"
        : "text-stone-700 hover:bg-stone-100"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        aria-label="Menüyü aç"
        className="lg:hidden p-2 rounded-lg text-stone-700 hover:text-emerald-700 hover:bg-stone-100"
      >
        <Menu className="w-6 h-6" />
      </button>

      {acik && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-perde-950/50 backdrop-blur-sm"
            onClick={() => setAcik(false)}
          />
          <div className="absolute right-0 top-0 h-dvh w-80 max-w-[88%] bg-stone-50 shadow-xl p-5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-2xl font-bold text-emerald-700">Menü</span>
              <button
                type="button"
                onClick={() => setAcik(false)}
                aria-label="Menüyü kapat"
                className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action="/kesfet" method="get" role="search" className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="search"
                name="q"
                placeholder="Film, dizi, anime ara"
                aria-label="Film, dizi, anime ara"
                className="alan pl-9! rounded-full!"
              />
            </form>

            <nav className="flex flex-col gap-0.5 flex-1" aria-label="Mobil menü">
              {anaNav.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setAcik(false)} className={satir(l.href)}>
                  {l.etiket}
                </Link>
              ))}

              <p className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                Topluluk
              </p>
              {toplulukNav.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setAcik(false)} className={satir(l.href)}>
                  {l.etiket}
                </Link>
              ))}

              <div className="my-3 border-t border-stone-200" />

              {girisli ? (
                <>
                  <Link href="/profil" onClick={() => setAcik(false)} className={satir("/profil")}>
                    Profilim
                  </Link>
                  <form action={cikisYap}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/giris" onClick={() => setAcik(false)} className={satir("/giris")}>
                    Giriş
                  </Link>
                  <Link href="/kayit" onClick={() => setAcik(false)} className="dugme mt-2">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
