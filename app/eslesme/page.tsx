import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Users, Sparkles, Star, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { enUygunEslesmeler } from "@/lib/eslesme";
import { yapimlariIdyeGoreCek, posterUrl, tmdbHazirMi } from "@/lib/tmdb";

export default async function EslesmeSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { benimFavoriSayim, benimPuanSayim, adaylar } = await enUygunEslesmeler(10);

  if (benimFavoriSayim === 0) {
    return <FavoriYokDurum />;
  }

  if (adaylar.length === 0) {
    return <AdayYokDurum benimFavoriSayim={benimFavoriSayim} />;
  }

  // Posterler için gerekli movie id'leri toplayıp TMDB'den çek
  const posterIdSet = new Set<number>();
  adaylar.forEach((a) => a.favoriIlk4.forEach((id) => posterIdSet.add(id)));
  const tmdbHaritasi = tmdbHazirMi()
    ? await yapimlariIdyeGoreCek([...posterIdSet])
    : new Map();

  const asilAday = adaylar[0];
  const digerAdaylar = adaylar.slice(1);

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 flex items-center gap-2">
              Senin için eşleşmeler
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </h1>
            <p className="text-stone-600">
              Zevkine en yakın profilleri bulduk — ortak favorilerine göre.
            </p>
          </div>
          <div className="text-sm text-stone-500 bg-white border border-stone-200 rounded-lg px-3 py-1.5">
            Seninki: <strong className="text-stone-900">{benimFavoriSayim}</strong> favori ·{" "}
            <strong className="text-stone-900">{benimPuanSayim}</strong> puan
          </div>
        </div>

        <AdayKarti aday={asilAday} tmdbHaritasi={tmdbHaritasi} />

        {digerAdaylar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">
              Sıradaki olası eşleşmeler
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {digerAdaylar.map((a) => (
                <KucukAdayKarti key={a.userId} aday={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function AdayKarti({
  aday,
  tmdbHaritasi,
}: {
  aday: Awaited<ReturnType<typeof enUygunEslesmeler>>["adaylar"][number];
  tmdbHaritasi: Map<number, { posterYolu: string | null; baslik: string }>;
}) {
  const ad = aday.displayName || aday.username || "Perdea üyesi";
  const bastHarf = ad.charAt(0).toUpperCase();

  return (
    <article className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2">
        <div className="flex items-start gap-5">
          <div className="shrink-0">
            {aday.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aday.avatarUrl}
                alt={ad}
                className="w-20 h-20 rounded-full object-cover bg-stone-200 border border-stone-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold">
                {bastHarf}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-stone-900">{ad}</h2>
              <UyumRozeti yuzde={aday.uyumYuzdesi} />
            </div>
            {aday.username && <p className="text-sm text-stone-500">@{aday.username}</p>}
            {aday.bio && (
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{aday.bio}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-emerald-600" />
            Favori Vitrini
          </h3>
          {aday.favoriIlk4.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {aday.favoriIlk4.map((id) => {
                const y = tmdbHaritasi.get(id);
                const url = y ? posterUrl(y.posterYolu, "w342") : null;
                return (
                  <div
                    key={id}
                    className="aspect-[2/3] rounded-lg overflow-hidden bg-stone-200 border border-stone-200"
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={y?.baslik ?? `#${id}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs p-2 text-center">
                        {y?.baslik ?? `#${id}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-stone-400">Favori vitrini henüz boş.</p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Geç
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Beğen
          </button>
          <p className="text-xs text-stone-400 ml-2">
            (Beğen/Geç kayıtlı değil — yakında.)
          </p>
        </div>
      </div>

      <aside className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Neden eşleştiniz?
          </h3>
          <ul className="space-y-2.5 text-sm text-stone-700">
            <li className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>{aday.ortakSayisi}</strong> ortak favoriniz var.
              </span>
            </li>
            {aday.puanYakinligi != null && (
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  Ortak filmlere verdiğiniz puanların yakınlığı:{" "}
                  <strong>%{aday.puanYakinligi}</strong>.
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <Users className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                Senin favorilerinin <strong>%{aday.uyumYuzdesi}</strong>'ini o da seviyor.
              </span>
            </li>
          </ul>
        </div>
        <div className="border-t border-stone-200 pt-4">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Eşleşme özeti
          </h3>
          <div className="text-center bg-white border border-emerald-200 rounded-xl py-4">
            <p className="text-4xl font-bold text-emerald-700">
              %{aday.uyumYuzdesi}
            </p>
            <p className="text-sm text-stone-500 mt-1">uyum</p>
          </div>
        </div>
      </aside>
    </article>
  );
}

function KucukAdayKarti({
  aday,
}: {
  aday: Awaited<ReturnType<typeof enUygunEslesmeler>>["adaylar"][number];
}) {
  const ad = aday.displayName || aday.username || "Üye";
  const bastHarf = ad.charAt(0).toUpperCase();
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
      {aday.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={aday.avatarUrl}
          alt={ad}
          className="w-14 h-14 rounded-full mx-auto object-cover bg-stone-200"
        />
      ) : (
        <div className="w-14 h-14 rounded-full mx-auto bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
          {bastHarf}
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-stone-900 truncate">{ad}</p>
      <p className="text-xs text-emerald-700 font-semibold">%{aday.uyumYuzdesi} uyum</p>
    </div>
  );
}

function UyumRozeti({ yuzde }: { yuzde: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold px-2.5 py-1 rounded-full">
      <Sparkles className="w-3.5 h-3.5" />%{yuzde} uyum
    </span>
  );
}

function FavoriYokDurum() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-2xl p-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Heart className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Önce zevkini göster
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6">
          Eşleşme algoritması zevkinden besleniyor. Keşfet'ten en az birkaç yapımı
          favorilerine ekle, sonra sana uygun kişiler burada belirsin.
        </p>
        <Link
          href="/kesfet"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Keşfet'e git
        </Link>
      </div>
    </main>
  );
}

function AdayYokDurum({ benimFavoriSayim }: { benimFavoriSayim: number }) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-2xl p-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Henüz zevkini paylaşan kimse yok
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6">
          {benimFavoriSayim} favoriden oluşan listenle örtüşen başka bir
          kullanıcı bulamadık. Perdea büyüdükçe bu sayfa dolacak. Bu arada
          favorilerini genişletmeye devam et.
        </p>
        <Link
          href="/kesfet"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Daha fazla keşfet
        </Link>
      </div>
    </main>
  );
}
