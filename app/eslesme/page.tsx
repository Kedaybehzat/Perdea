import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Users, Star } from "lucide-react";
import PerdeBandi from "@/components/ui/PerdeBandi";
import Avatar from "@/components/ui/Avatar";
import AfisYok from "@/components/ui/AfisYok";
import UyumHalkasi from "@/components/ui/UyumHalkasi";
import { createClient } from "@/lib/supabase/server";
import { enUygunEslesmeler } from "@/lib/eslesme";
import { yapimlariIdyeGoreCek, posterUrl, tmdbHazirMi } from "@/lib/tmdb";
import KararButonlari from "./KararButonlari";

export const metadata = {
  title: "Eşleşmeler — Perdea",
  description: "Zevkine en yakın profiller. Ortak favorilerine göre.",
};

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
      <PerdeBandi
        ustEtiket="Eşleş"
        baslik="Aynı sahnede"
        vurgu="duygulananlar"
        aciklama="Favorilerin ve puanların kimlerle örtüşüyorsa onları sıraladık."
      >
        <p className="text-sm text-emerald-50/80">
          Senin listen: <strong className="text-white">{benimFavoriSayim}</strong> favori ·{" "}
          <strong className="text-white">{benimPuanSayim}</strong> puan
        </p>
      </PerdeBandi>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdayKarti key={asilAday.userId} aday={asilAday} tmdbHaritasi={tmdbHaritasi} />

        {digerAdaylar.length > 0 && (
          <section className="mt-12 goster">
            <h2 className="text-3xl font-bold text-stone-900 mb-5">Sırada bekleyenler</h2>
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

type Aday = Awaited<ReturnType<typeof enUygunEslesmeler>>["adaylar"][number];

function AdayKarti({
  aday,
  tmdbHaritasi,
}: {
  aday: Aday;
  tmdbHaritasi: Map<number, { posterYolu: string | null; baslik: string }>;
}) {
  const ad = aday.displayName || aday.username || "Perdea üyesi";

  return (
    <article className="animate-belir bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-kart grid grid-cols-1 lg:grid-cols-[1fr_20rem]">
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-5">
          <Avatar ad={ad} url={aday.avatarUrl} boyut="xl" />
          <div className="flex-1 min-w-0">
            {aday.username ? (
              <Link
                href={`/u/${aday.username}`}
                className="font-display text-3xl md:text-4xl font-bold text-stone-900 hover:text-emerald-700 transition-colors leading-tight"
              >
                {ad}
              </Link>
            ) : (
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">{ad}</h2>
            )}
            {aday.username && <p className="text-stone-500">@{aday.username}</p>}
            {aday.bio && <p className="text-stone-700 mt-3 leading-relaxed max-w-prose">{aday.bio}</p>}
          </div>
        </div>

        <div className="mt-7">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.18em] mb-3">
            Favori vitrini
          </h3>
          {aday.favoriIlk4.length ? (
            <div className="sirali grid grid-cols-4 gap-3 max-w-xl">
              {aday.favoriIlk4.map((id) => {
                const y = tmdbHaritasi.get(id);
                const url = y ? posterUrl(y.posterYolu, "w342") : null;
                return (
                  <div key={id} className="afis aspect-[2/3]">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={y?.baslik ?? "Yapım"} className="w-full h-full object-cover" />
                    ) : (
                      <AfisYok baslik={y?.baslik ?? "Yapım"} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-stone-500">Vitrini henüz boş.</p>
          )}
        </div>

        <div className="mt-8">
          <KararButonlari
            adayId={aday.userId}
            adayAd={ad}
            adayUsername={aday.username}
            uyumYuzdesi={aday.uyumYuzdesi}
          />
        </div>
      </div>

      <aside className="perde-zemin text-white p-6 md:p-8 flex flex-col items-center text-center">
        <UyumHalkasi yuzde={aday.uyumYuzdesi} boyut={148} koyu />
        <h3 className="mt-6 text-xs font-bold text-altin uppercase tracking-[0.2em]">
          Neden bu kişi?
        </h3>
        <ul className="mt-4 space-y-3 text-emerald-50/90 text-left w-full">
          <li className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-emerald-300 mt-1 shrink-0" />
            <span>
              <strong className="text-white">{aday.ortakSayisi}</strong> ortak favoriniz var.
            </span>
          </li>
          {aday.puanYakinligi != null && (
            <li className="flex items-start gap-2.5">
              <Star className="w-4 h-4 text-emerald-300 mt-1 shrink-0" />
              <span>
                Ortak izlediklerinize verdiğiniz puanlar{" "}
                <strong className="text-white">%{aday.puanYakinligi}</strong> yakın.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-emerald-300 mt-1 shrink-0" />
            <span>
              Favorilerinin <strong className="text-white">%{aday.uyumYuzdesi}</strong> kadarını o da seviyor.
            </span>
          </li>
        </ul>
      </aside>
    </article>
  );
}

function KucukAdayKarti({ aday }: { aday: Aday }) {
  const ad = aday.displayName || aday.username || "Üye";
  const icerik = (
    <>
      <span className="flex justify-center">
        <Avatar ad={ad} url={aday.avatarUrl} boyut="lg" />
      </span>
      <p className="mt-2 font-semibold text-stone-900 truncate">{ad}</p>
      <p className="text-sm text-emerald-700 font-semibold">%{aday.uyumYuzdesi} uyum</p>
    </>
  );
  return aday.username ? (
    <Link
      href={`/u/${aday.username}`}
      className="kalkar block bg-white border border-stone-200 rounded-2xl p-4 text-center hover:border-emerald-300"
    >
      {icerik}
    </Link>
  ) : (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">{icerik}</div>
  );
}

function FavoriYokDurum() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-3xl p-8 animate-belir">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Heart className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Önce zevkini göster
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6">
          Eşleşme algoritması zevkinden besleniyor. Keşfet’ten en az birkaç yapımı
          favorilerine ekle, sonra sana uygun kişiler burada belirsin.
        </p>
        <Link
          href="/kesfet"
          className="dugme"
        >
          Keşfet’e git
        </Link>
      </div>
    </main>
  );
}

function AdayYokDurum({ benimFavoriSayim }: { benimFavoriSayim: number }) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-3xl p-8 animate-belir">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Henüz zevkini paylaşan kimse yok
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6">
          {benimFavoriSayim} favoriden oluşan listenle örtüşen başka bir
          kullanıcı bulamadık. Perdea büyüdükçe bu sayfa dolacak. Bu arada
          favorilerini genişletmeye devam et.
        </p>
        <Link
          href="/kesfet"
          className="dugme"
        >
          Daha fazla keşfet
        </Link>
      </div>
    </main>
  );
}
