import Link from "next/link";
import { Search, Film, Tv, Sparkles, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { trendYapimlar, yapimAra, posterUrl, tmdbHazirMi } from "@/lib/tmdb";
import PerdeBandi from "@/components/ui/PerdeBandi";
import BosDurum from "@/components/ui/BosDurum";
import YapimKart from "./YapimKart";

export const metadata = {
  title: "Keşfet — Perdea",
  description: "Haftanın öne çıkan filmleri ve dizileri. Favoriye ekle, puan ver.",
};

type Tur = "film" | "dizi" | "hepsi";
type Props = {
  searchParams: Promise<{ q?: string; tur?: Tur }>;
};

export default async function KesfetSayfasi({ searchParams }: Props) {
  const { q, tur } = await searchParams;
  const sorgu = (q ?? "").trim();
  const seciliTur: Tur = tur === "film" || tur === "dizi" ? tur : "hepsi";

  if (!tmdbHazirMi()) {
    return <TmdbKurulumu />;
  }

  const yapimlar = sorgu
    ? (await yapimAra(sorgu)).filter((y) => (seciliTur === "hepsi" ? true : y.tur === seciliTur))
    : await trendYapimlar(seciliTur);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Kullanıcının favori + puan haritaları
  let favoriSet = new Set<number>();
  let puanMap = new Map<number, number>();
  if (user) {
    const idler = yapimlar.map((y) => y.id);
    if (idler.length) {
      const { data: favs } = await supabase
        .from("favorites")
        .select("movie_id")
        .eq("user_id", user.id)
        .in("movie_id", idler);
      favoriSet = new Set((favs ?? []).map((f) => f.movie_id));

      const { data: puanlar } = await supabase
        .from("ratings")
        .select("movie_id, score")
        .eq("user_id", user.id)
        .in("movie_id", idler);
      puanMap = new Map((puanlar ?? []).map((r) => [r.movie_id, r.score]));
    }
  }

  const turBaglantisi = (t: Tur) => {
    const p = new URLSearchParams();
    if (sorgu) p.set("q", sorgu);
    if (t !== "hepsi") p.set("tur", t);
    const s = p.toString();
    return s ? `/kesfet?${s}` : "/kesfet";
  };

  return (
    <main className="bg-stone-50 min-h-screen">
      <PerdeBandi
        ustEtiket="Keşfet"
        baslik="Bu hafta"
        vurgu="ne izlenir?"
        aciklama="Sevdiğini kalple işaretle, izlediğine puan ver. Eşleşmelerin bunlardan çıkıyor."
      >
        <form action="/kesfet" method="get" className="flex gap-2 md:w-96" role="search">
          {seciliTur !== "hepsi" && <input type="hidden" name="tur" value={seciliTur} />}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              name="q"
              defaultValue={sorgu}
              placeholder="Film, dizi, anime ara"
              aria-label="Film, dizi, anime ara"
              className="alan pl-10! border-transparent!"
            />
          </div>
          <button type="submit" className="dugme bg-altin! text-perde-950! hover:brightness-105 shadow-none!">
            Ara
          </button>
        </form>
      </PerdeBandi>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <nav className="inline-flex p-1 bg-stone-200/70 rounded-xl" aria-label="Tür">
            <TurSekmesi href={turBaglantisi("hepsi")} aktif={seciliTur === "hepsi"} icon={<Sparkles className="w-4 h-4" />}>
              Hepsi
            </TurSekmesi>
            <TurSekmesi href={turBaglantisi("film")} aktif={seciliTur === "film"} icon={<Film className="w-4 h-4" />}>
              Film
            </TurSekmesi>
            <TurSekmesi href={turBaglantisi("dizi")} aktif={seciliTur === "dizi"} icon={<Tv className="w-4 h-4" />}>
              Dizi
            </TurSekmesi>
          </nav>
          <p className="text-sm text-stone-500">
            {sorgu ? (
              <>
                <strong className="text-stone-900">“{sorgu}”</strong> için {yapimlar.length} sonuç ·{" "}
                <Link href="/kesfet" className="underline underline-offset-4 hover:text-stone-900">
                  aramayı temizle
                </Link>
              </>
            ) : (
              "Haftanın öne çıkanları"
            )}
          </p>
        </div>

        {!user && (
          <div className="mb-6 bg-white border border-stone-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-stone-700">
              Favorilerin ve puanların kaydolsun diye önce giriş yap.
            </span>
            <span className="flex gap-2">
              <Link href="/giris" className="dugme-cizgi py-2!">Giriş yap</Link>
              <Link href="/kayit" className="dugme py-2!">Kayıt ol</Link>
            </span>
          </div>
        )}

        {yapimlar.length === 0 ? (
          <BosDurum
            icon={SearchX}
            baslik={sorgu ? "Bunu bulamadık" : "Liste şu an gelmedi"}
            aciklama={
              sorgu
                ? `“${sorgu}” için sonuç yok. Özgün adıyla ya da daha kısa yazarak dene.`
                : "Film verisi şu an alınamadı. Bir dakika sonra sayfayı yenile."
            }
          >
            {sorgu && <Link href="/kesfet" className="dugme">Öne çıkanlara dön</Link>}
          </BosDurum>
        ) : (
          <div className="sirali grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
            {yapimlar.map((y) => (
              <YapimKart
                key={`${y.tur}-${y.id}`}
                yapim={y}
                posterUrl={posterUrl(y.posterYolu, "w342")}
                favoriBaslangic={favoriSet.has(y.id)}
                puanBaslangic={puanMap.get(y.id) ?? null}
                girisli={Boolean(user)}
              />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-stone-400 mt-12">
          Film verileri TMDB tarafından sağlanır.
        </p>
      </div>
    </main>
  );
}

function TurSekmesi({
  href,
  aktif,
  icon,
  children,
}: {
  href: string;
  aktif: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={aktif ? "page" : undefined}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        aktif ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600 hover:text-stone-900"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function TmdbKurulumu() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-3xl p-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 mb-5">
          <Film className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Keşfet için TMDB anahtarı gerekiyor
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-5">
          Film verileri TMDB&apos;den çekiliyor.{" "}
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 underline"
          >
            TMDB API anahtarı
          </a>{" "}
          al, sonra <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> dosyasına şu satırı ekle:
        </p>
        <pre className="bg-stone-900 text-stone-100 text-xs rounded-lg p-3 text-left overflow-x-auto mb-5">
          TMDB_API_KEY=buraya_anahtari_yapistir
        </pre>
        <p className="text-xs text-stone-500">
          Anahtar <strong>NEXT_PUBLIC</strong> değil; yalnızca sunucu okur. Değiştirince{" "}
          <code className="bg-stone-100 px-1 rounded">npm run dev</code> komutunu yeniden başlat.
        </p>
      </div>
    </main>
  );
}
