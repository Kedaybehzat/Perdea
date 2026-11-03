'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { cikisYap } from "@/app/auth/actions";

type NavLinki = { href: string; etiket: string };

export default function MobilMenu({
  girisli,
  navLinkleri,
}: {
  girisli: boolean;
  navLinkleri: NavLinki[];
}) {
  const [acik, setAcik] = useState(false);

  useEffect(() => {
    if (acik) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [acik]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        aria-label="Menüyü aç"
        className="md:hidden p-2 text-stone-700 hover:text-emerald-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {acik && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setAcik(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-emerald-700">Menü</span>
              <button
                type="button"
                onClick={() => setAcik(false)}
                aria-label="Menüyü kapat"
                className="p-2 text-stone-700 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              {navLinkleri.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setAcik(false)}
                  className="px-3 py-3 rounded-lg text-stone-700 hover:bg-stone-100 hover:text-emerald-700 font-medium transition-colors"
                >
                  {l.etiket}
                </Link>
              ))}

              <div className="my-3 border-t border-stone-200" />

              {girisli ? (
                <>
                  <Link
                    href="/profil"
                    onClick={() => setAcik(false)}
                    className="px-3 py-3 rounded-lg text-stone-700 hover:bg-stone-100 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Profil
                  </Link>
                  <form action={cikisYap}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/giris"
                    onClick={() => setAcik(false)}
                    className="px-3 py-3 rounded-lg text-stone-700 hover:bg-stone-100 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/kayit"
                    onClick={() => setAcik(false)}
                    className="mt-2 px-3 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-center transition-colors"
                  >
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
