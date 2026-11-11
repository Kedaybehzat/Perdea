import Link from "next/link";
import { LogOut, MessageCircle, Search } from "lucide-react";
import { cikisYap } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import Logo from "./Logo";
import MobilMenu from "./MobilMenu";
import NavBaglantilari from "./NavBaglantilari";
import Avatar from "./ui/Avatar";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profil: { username: string; display_name: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profil = data;
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Logo />

        <NavBaglantilari />

        <div className="flex items-center gap-2">
          {/* Arama: her sayfadan Keşfet'e. Geniş ekranda alan, dar ekranda ikon. */}
          <form action="/kesfet" method="get" role="search" className="hidden xl:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              name="q"
              placeholder="Film, dizi, anime ara"
              aria-label="Film, dizi, anime ara"
              className="w-56 pl-9 pr-3 py-2 text-sm bg-white border border-stone-200 rounded-full focus:outline-none focus:border-emerald-600 focus:w-64 transition-all placeholder:text-stone-400"
            />
          </form>
          <Link
            href="/kesfet"
            aria-label="Ara"
            className="xl:hidden p-2 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-stone-100"
          >
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <>
              <Link
                href="/sohbet"
                aria-label="Sohbetler"
                className="hidden sm:block p-2 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-stone-100"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
              <Link
                href="/profil"
                className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-stone-200 bg-white hover:border-emerald-600 transition-colors"
              >
                <Avatar
                  ad={profil?.display_name || profil?.username || "?"}
                  url={profil?.avatar_url ?? null}
                  boyut="sm"
                />
                <span className="text-sm font-semibold text-stone-800 max-w-28 truncate">
                  {profil?.display_name || profil?.username || "Profil"}
                </span>
              </Link>
              <form action={cikisYap} className="hidden sm:block">
                <button
                  type="submit"
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/giris"
                className="hidden sm:block px-3 py-2 text-[0.95rem] font-medium text-stone-700 hover:text-emerald-700"
              >
                Giriş
              </Link>
              <Link href="/kayit" className="dugme hidden sm:inline-flex py-2! px-4! text-[0.95rem]">
                Kayıt Ol
              </Link>
            </>
          )}

          <MobilMenu girisli={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
