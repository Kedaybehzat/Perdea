import Link from "next/link";
import { Search, Film, Tv, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { trendYapimlar, yapimAra, posterUrl, tmdbHazirMi } from "@/lib/tmdb";
import YapimKart from "./YapimKart";

type Props = {
  searchParams: Promise<{ q?: string; tur?: "film" | "dizi" | "hepsi" }>;
};

export default async function KesfetSayfasi({ searchParams }: Props) {
  const { q, tur } = await searchParams;
  const sorgu = (q ?? "").trim();
  const seciliTur: "film" | "dizi" | "hepsi" = tur ?? "hepsi";

  if (!tmdbHazirMi()) {
    return <TmdbKurulumu />;
  }

  const yapimlar = sorgu
    ? (await yapimAra(sorgu)).filter((y) =>
        seciliTur === "hepsi"
          ? true
          : seciliTur === "film"
          ? y.tur === "film"
          : y.tur === "dizi"
      )
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

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
            Keşfet
          </h1>
          <p className="text-stone-600">
            Haftanın öne çıkan yapımları, zevkine katacakların. Favoriye ekle, puan ver.
          </p>
        </div>

        {/* Arama + filtre */}
        <form
          action="/kesfet"
          method="get"
          className="bg-white border border-stone-200 rounded-2xl p-4 md:p-5 mb-8 flex flex-col md:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              name="q"
              defaultValue={sorgu}
              placeholder="Film, dizi, anime ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <TurRadio ad="hepsi" etiket="Hepsi" secili={seciliTur} icon={<Sparkles className="w-4 h-4" />} />
            <TurRadio ad="film" etiket="Film" secili={seciliTur} icon={<Film className="w-4 h-4" />} />
            <TurRadio ad="dizi" etiket="Dizi" secili={seciliTur} icon={<Tv className="w-4 h-4" />} />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Ara
          </button>
        </form>

        {!user && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <span>
              Favorilerini kaydetmek ve puan vermek için{" "}
              <Link href="/giris" className="underline font-medium">
                giriş yap
              </Link>
              .
            </span>
            <Link
              href="/kayit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-1.5 rounded-lg text-sm"
            >
              Kayıt ol
            </Link>
          </div>
        )}

        {yapimlar.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl">
            <p className="text-stone-500">
              {sorgu
                ? `"${sorgu}" için sonuç bulunamadı.`
                : "TMDB'den sonuç alınamadı. Birazdan tekrar dene."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

        <p className="text-center text-xs text-stone-400 mt-10">
          Film verileri TMDB tarafından sağlanır.
        </p>
      </div>
    </main>
  );
}

function TurRadio({
  ad,
  etiket,
  secili,
  icon,
}: {
  ad: "film" | "dizi" | "hepsi";
  etiket: string;
  secili: string;
  icon: React.ReactNode;
}) {
  const aktif = secili === ad;
  return (
    <label
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer text-sm font-medium transition-colors ${
        aktif ? "bg-white text-emerald-700 shadow-sm" : "text-stone-600 hover:text-stone-900"
      }`}
    >
      <input type="radio" name="tur" value={ad} defaultChecked={aktif} className="sr-only" />
      {icon}
      {etiket}
    </label>
  );
}

function TmdbKurulumu() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-2xl p-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Film className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Keşfet için TMDB kurulumu gerekiyor
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-5">
          Film verileri TMDB'den çekiliyor.{" "}
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 underline"
          >
            TMDB API anahtarı
          </a>{" "}
          al, sonra <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">.env.local</code>'a şu satırı ekle:
        </p>
        <pre className="bg-stone-900 text-stone-100 text-xs rounded-lg p-3 text-left overflow-x-auto mb-5">
          TMDB_API_KEY=buraya_anahtari_yapistir
        </pre>
        <p className="text-xs text-stone-500">
          Anahtar <strong>NEXT_PUBLIC</strong> değil — sadece sunucu tarafından
          okunur. Değiştirince <code className="bg-stone-100 px-1 rounded">npm run dev</code>'i yeniden başlat.
        </p>
      </div>
    </main>
  );
}
