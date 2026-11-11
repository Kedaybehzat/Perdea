'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { anaNav, toplulukNav, aktifMi } from "./navigasyon";

export default function NavBaglantilari() {
  const pathname = usePathname();
  const toplulukAktif = toplulukNav.some((l) => aktifMi(pathname, l.href));

  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Ana menü">
      {anaNav.map((l) => {
        const aktif = aktifMi(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={aktif ? "page" : undefined}
            className={`relative px-3 py-2 rounded-lg text-[0.95rem] font-medium transition-colors ${
              aktif
                ? "text-emerald-700"
                : "text-stone-700 hover:text-emerald-700 hover:bg-stone-100"
            }`}
          >
            {l.etiket}
            {aktif && (
              <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-emerald-600" />
            )}
          </Link>
        );
      })}

      {/* Topluluk açılır menüsü — hover + klavye (focus-within) ile açılır, JS yok. */}
      <div className="relative group">
        <button
          type="button"
          aria-haspopup="true"
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[0.95rem] font-medium transition-colors ${
            toplulukAktif
              ? "text-emerald-700"
              : "text-stone-700 hover:text-emerald-700 hover:bg-stone-100"
          }`}
        >
          Topluluk
          <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
        </button>
        <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150 absolute right-0 top-full pt-2 w-72 z-50">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-kart p-2">
            {toplulukNav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <span className="block font-semibold text-stone-900">{l.etiket}</span>
                <span className="block text-sm text-stone-500">{l.aciklama}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
