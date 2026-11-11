import Link from "next/link";
import {
  Armchair, ArrowRight, ArrowUpRight, Compass, Heart, HelpCircle, MessageCircle,
  MessageSquareText, Sparkles, Star, VenetianMask,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { posterUrl, tmdbHazirMi, trendYapimlar, yapimlariIdyeGoreCek } from "@/lib/tmdb";
import { acikOdalar } from "@/lib/oyun";
import { bulusmalariListele } from "@/lib/bulusma";
import Avatar from "@/components/ui/Avatar";
import Bilet from "@/components/ui/Bilet";
import KurguAfis from "@/components/ui/KurguAfis";
import BulusmaKarti from "./cosplay/BulusmaKarti";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) return <GirisliAnaSayfa userId={user.id} />;
  return <Karsilama />;
}

/* ==========================================================================
   Girişsiz karşılama sayfası
   ========================================================================== */

const akanYazi = [
  "Eşleş", "Keşfet", "Salonları puanla", "Ben Kimim?", "Cosplay buluşmaları", "Başlıklar", "Vizyon",
];

function Karsilama() {
  return (
    <main>
      {/* Perde: hero */}
      <section className="perde-zemin text-stone-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 md:pt-20 md:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left animate-belir">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-altin mb-6">
              <span className="w-8 h-px bg-altin" aria-hidden />
              Film · Dizi · Anime
            </p>
            <h1
              className="text-[2.9rem] sm:text-6xl xl:text-7xl font-bold leading-[0.98] mb-6"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Zevkini paylaş,
              <br />
              <em className="text-emerald-300">ruh eşini</em> bul.
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/85 max-w-lg mx-auto lg:mx-0 mb-9 leading-relaxed">
              Sevdiğin yapımları puanla; aynı sahnede duygulanan insanlarla eşleş,
              konuş, oyna, buluş. Hepsi Türkçe, hepsi tek perdede.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/kayit"
                className="dugme bg-stone-50! text-emerald-800! hover:bg-white! shadow-none! px-7! py-3.5! text-lg w-full sm:w-auto"
              >
                Hemen başla
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/kesfet"
                className="dugme-cizgi bg-transparent! text-stone-50! border-white/30! hover:border-white! px-7! py-3.5! text-lg w-full sm:w-auto"
              >
                Önce göz at
              </Link>
            </div>
            <p className="mt-6 text-sm text-emerald-100/60">Ücretsiz. Kayıt bir dakika.</p>
          </div>

          <HeroKolaj />
        </div>
        <div className="film-seridi text-stone-50" />
      </section>

      {/* Akan şerit */}
      <div className="bg-kum border-b border-stone-200 overflow-hidden py-3.5" aria-hidden>
        <div className="flex w-max animate-kay">
          {[0, 1].map((tekrar) => (
            <div key={tekrar} className="flex shrink-0">
              {akanYazi.map((y) => (
                <span
                  key={y}
                  className="font-display text-lg font-bold uppercase tracking-[0.14em] text-stone-800 flex items-center"
                >
                  <span className="px-6">{y}</span>
                  <span className="text-emerald-600">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Neler var */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
              Tek çatı altında
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 leading-[1.05]">
              Beş ayrı uygulamada yaptığın her şey, tek yerde.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            {/* Eşleşme */}
            <Link
              href="/eslesme"
              className="group md:col-span-3 rounded-3xl bg-emerald-600 text-white p-7 sm:p-8 flex flex-col justify-between min-h-72 hover:bg-emerald-700 transition-colors"
            >
              <div className="flex items-center">
                <Avatar ad="Deniz" boyut="lg" className="ring-4 ring-emerald-600 group-hover:ring-emerald-700" />
                <Avatar ad="Mert" boyut="lg" className="-ml-3 ring-4 ring-emerald-600 group-hover:ring-emerald-700" />
                <span className="ml-4 bg-white text-emerald-800 font-display text-2xl font-bold px-4 py-1.5 rounded-full">
                  %87 uyum
                </span>
              </div>
              <div>
                <h3 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
                  Eşleşme
                  <ArrowUpRight className="w-6 h-6 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </h3>
                <p className="text-emerald-50/90 text-lg max-w-md">
                  Favorilerin ve puanların senin yerine konuşur. Zevki sana en yakın
                  insanları buluruz; beğen, eşleş, yaz.
                </p>
              </div>
            </Link>

            {/* Keşfet */}
            <Link
              href="/kesfet"
              className="group md:col-span-3 rounded-3xl bg-white border border-stone-200 p-7 sm:p-8 flex flex-col justify-between min-h-72 hover:border-emerald-600 transition-colors overflow-hidden"
            >
              <div className="flex gap-3 -mr-24">
                {(["fener", "sehir", "gunes", "ay", "sandalye"] as const).map((s, i) => (
                  <KurguAfis
                    key={s}
                    sahne={s}
                    className={`w-24 shrink-0 transition-transform duration-300 ${
                      i % 2 ? "group-hover:-translate-y-1" : "group-hover:translate-y-1"
                    }`}
                  />
                ))}
              </div>
              <div>
                <h3 className="font-display text-3xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                  Keşfet &amp; puanla
                  <ArrowUpRight className="w-6 h-6 text-stone-400 group-hover:text-emerald-700 transition-colors" />
                </h3>
                <p className="text-stone-600 text-lg max-w-md">
                  Film, dizi, anime — ara, favorile, 10 üzerinden puanla. Vizyonda ne
                  var, tek bakışta gör.
                </p>
              </div>
            </Link>

            {/* Salon puanları */}
            <Link
              href="/salonlar"
              className="group md:col-span-2 rounded-3xl bg-kum p-7 flex flex-col justify-between min-h-64 hover:bg-stone-200 transition-colors"
            >
              <div className="flex items-end gap-3">
                <span
                  className="font-display text-6xl font-bold leading-none text-stone-900"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  4.6
                </span>
                <span className="flex gap-0.5 pb-2" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 5 ? "text-altin fill-altin" : "text-stone-400"}`} />
                  ))}
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-stone-900 mb-1.5 flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-emerald-700" />
                  Salon puanları
                </h3>
                <p className="text-stone-700">
                  Perde, ses, koltuk, temizlik, fiyat. Şehrindeki en iyi salonu bul.
                </p>
              </div>
            </Link>

            {/* Ben Kimim */}
            <Link
              href="/oyun"
              className="group md:col-span-2 rounded-3xl perde-zemin text-stone-50 p-7 flex flex-col justify-between min-h-64 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-3 ampuller opacity-70" aria-hidden />
              <div className="w-20 h-24 rounded-xl bg-stone-50 text-perde-900 flex items-center justify-center rotate-[-6deg] group-hover:rotate-[4deg] transition-transform duration-300 mt-3">
                <HelpCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold mb-1.5">Ben Kimim? odaları</h3>
                <p className="text-emerald-100/85">
                  Alnına bir karakter yazılır. Sor, daralt, bul. 2–8 kişilik oyun odaları.
                </p>
              </div>
            </Link>

            {/* Cosplay */}
            <Link
              href="/cosplay"
              className="group md:col-span-2 rounded-3xl bg-white border border-stone-200 p-7 flex flex-col justify-between min-h-64 hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center leading-none bg-emerald-50 rounded-2xl px-4 py-3">
                  <p className="font-display text-4xl font-bold text-emerald-700">21</p>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-stone-500 mt-1">KAS</p>
                </div>
                <VenetianMask className="w-9 h-9 text-stone-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-stone-900 mb-1.5">
                  Cosplay buluşmaları
                </h3>
                <p className="text-stone-600">
                  Kostümünü giy, ekibini bul. Şehrindeki buluşmalara katıl ya da kendin aç.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="px-4 sm:px-6 py-20 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 text-center mb-14">
            Üç adımda perde açılır
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { baslik: "Kaydol", metin: "Bir e-posta, bir kullanıcı adı. Bir dakikada profilin hazır." },
              { baslik: "Zevkini göster", metin: "Sevdiklerini favorile, izlediklerini puanla. Vitrinin sensin." },
              { baslik: "Eşleş", metin: "Sana en yakın zevkteki insanları gör; beğen, konuş, birlikte oyna." },
            ].map((a, i) => (
              <li key={a.baslik} className="text-center md:text-left">
                <span
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-kum font-display text-2xl font-bold text-stone-800 mb-4"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-2xl font-bold text-stone-900 mb-2">{a.baslik}</h3>
                <p className="text-stone-600 text-lg leading-relaxed">{a.metin}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Davet bileti */}
      <section className="px-4 sm:px-6 py-20">
        <Bilet ton="zumrut" centik="50%" className="max-w-4xl mx-auto">
          <div className="px-6 sm:px-12 py-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-100 mb-3">
              Davetiye · tek kişilik
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Yerin ayrıldı.</h2>
            <p className="text-lg text-emerald-50/90 max-w-xl mx-auto mb-8">
              İyi filmler, doğru insanlar ve bitmeyen sohbet seni bekliyor.
            </p>
            <Link
              href="/kayit"
              className="dugme bg-stone-50! text-emerald-800! hover:bg-white! shadow-none! px-8! py-3.5! text-lg"
            >
              Ücretsiz kayıt ol
            </Link>
          </div>
        </Bilet>
      </section>
    </main>
  );
}

function HeroKolaj() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none aspect-[5/4] hidden sm:block" aria-hidden>
      <KurguAfis sahne="sehir" className="absolute left-[2%] top-[4%] w-[27%] -rotate-6 animate-belir [animation-delay:120ms]" />
      <KurguAfis sahne="perde" className="absolute right-[1%] top-0 w-[27%] rotate-6 animate-belir [animation-delay:220ms]" />
      <KurguAfis sahne="fener" className="absolute left-0 bottom-[2%] w-[26%] rotate-3 animate-belir [animation-delay:320ms]" />
      <KurguAfis sahne="gunes" className="absolute right-[3%] bottom-0 w-[26%] -rotate-3 animate-belir [animation-delay:420ms]" />

      {/* Eşleşme kartı */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[54%] animate-belir [animation-delay:520ms]">
        <div className="bg-stone-50 text-stone-900 rounded-3xl shadow-afis p-5">
          <div className="flex items-center justify-center">
            <Avatar ad="Deniz" boyut="lg" className="ring-4 ring-stone-50" />
            <span className="-mx-2 z-10 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-stone-50">
              <Heart className="w-4 h-4 fill-current" />
            </span>
            <Avatar ad="Mert" boyut="lg" className="ring-4 ring-stone-50" />
          </div>
          <div className="flex justify-around text-sm font-semibold mt-2 px-2">
            <span>Deniz</span>
            <span>Mert</span>
          </div>
          <p className="mt-3 text-center">
            <span
              className="inline-block bg-emerald-600 text-white font-display text-2xl font-bold px-5 py-1.5 rounded-xl"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              %87 uyum
            </span>
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-stone-500">Ortak zevkleriniz</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Psikolojik gerilim", "Neo-noir", "Anime", "80'ler"].map((e) => (
              <span key={e} className="text-xs font-medium bg-kum px-2.5 py-1 rounded-full">
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Girişli ana sayfa
   ========================================================================== */

async function GirisliAnaSayfa({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [
    { data: profil },
    { data: sonFavoriler },
    { count: favoriSayisi },
    { count: puanSayisi },
    trend,
    { odalar },
    { bulusmalar },
  ] = await Promise.all([
    supabase.from("users").select("display_name, username").eq("id", userId).maybeSingle(),
    supabase
      .from("favorites")
      .select("movie_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("ratings").select("id", { count: "exact", head: true }).eq("user_id", userId),
    tmdbHazirMi() ? trendYapimlar("hepsi") : Promise.resolve([]),
    acikOdalar(),
    bulusmalariListele({ limit: 3 }),
  ]);

  const ad = profil?.display_name || profil?.username || "sinefil";
  const posterIdleri = (sonFavoriler ?? []).map((f) => f.movie_id as number);
  const tmdbHaritasi = tmdbHazirMi() ? await yapimlariIdyeGoreCek(posterIdleri) : new Map();
  const trendPosterli = trend.filter((y) => y.posterYolu).slice(0, 12);
  const yeniKullanici = (favoriSayisi ?? 0) === 0;

  const kisayollar = [
    {
      href: "/eslesme",
      icon: Sparkles,
      baslik: "Eşleşmelerin",
      aciklama: yeniKullanici
        ? "Önce birkaç favori ekle, sonra sana uyanları gösterelim."
        : "Zevkine en yakın insanlar seni bekliyor.",
    },
    {
      href: "/oyun",
      icon: HelpCircle,
      baslik: "Ben Kimim? odaları",
      aciklama: odalar.length > 0 ? `${odalar.length} açık oda oyuncu bekliyor.` : "Bir oda kur, arkadaşlarını çağır.",
      rozet: odalar.length > 0 ? "Canlı" : undefined,
    },
    {
      href: "/salonlar",
      icon: Armchair,
      baslik: "Salon puanla",
      aciklama: "Son gittiğin sinema nasıldı? Perdeyi, sesi, koltuğu oyla.",
    },
    {
      href: "/cosplay",
      icon: VenetianMask,
      baslik: "Cosplay buluşmaları",
      aciklama:
        bulusmalar.length > 0
          ? `${bulusmalar.length} yaklaşan buluşma var.`
          : "Şehrinde bir buluşma aç.",
    },
    {
      href: "/baslik",
      icon: MessageSquareText,
      baslik: "Başlıklar",
      aciklama: "Bir yapım, bir başlık; altına iki satır yaz.",
    },
    {
      href: "/sohbet",
      icon: MessageCircle,
      baslik: "Sohbetler",
      aciklama: "Eşleştiklerinle birebir konuş.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Karşılama bandı */}
      <section className="perde-zemin text-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-altin mb-2">İyi seyirler</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Hoş geldin, <em className="text-emerald-300">{ad}</em>.
            </h1>
            <p className="text-emerald-100/85 mt-2 text-lg">
              {yeniKullanici
                ? "İlk favorilerini ekle; vitrinin ve eşleşmelerin onunla başlar."
                : "Bugün ne izledin? Puanla, eşleşmelerin güncellensin."}
            </p>
          </div>
          <dl className="flex items-stretch gap-3">
            {[
              { etiket: "Favori", deger: favoriSayisi ?? 0 },
              { etiket: "Puan", deger: puanSayisi ?? 0 },
            ].map((s) => (
              <div key={s.etiket} className="bg-white/10 border border-white/15 rounded-2xl px-5 py-3 text-center">
                <dd className="font-display text-3xl font-bold leading-none tabular-nums">{s.deger}</dd>
                <dt className="text-xs text-emerald-100/75 mt-1">{s.etiket}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {/* Gündem şeridi */}
        {trendPosterli.length > 0 && (
          <section>
            <BolumBasligi baslik="Bu hafta gündemde" href="/kesfet" linkMetni="Keşfet'e git" />
            <div className="flex gap-4 overflow-x-auto kaydirma-gizli -mx-4 px-4 sm:-mx-6 sm:px-6 pb-2 snap-x">
              {trendPosterli.map((y, i) => (
                <Link
                  key={`${y.tur}-${y.id}`}
                  href={`/kesfet?q=${encodeURIComponent(y.baslik)}`}
                  className="group shrink-0 w-36 sm:w-40 snap-start"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-stone-200 shadow-kart">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterUrl(y.posterYolu, "w342") ?? ""}
                      alt={y.baslik}
                      loading={i < 6 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-2 bottom-1 font-display text-5xl font-bold text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-stone-900 line-clamp-1">{y.baslik}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-altin fill-altin" />
                    {y.tmdbPuani ? y.tmdbPuani.toFixed(1) : "—"} · {y.tur}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Kısayollar */}
        <section>
          <BolumBasligi baslik="Nereden başlayalım?" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kisayollar.map((k) => (
              <Link
                key={k.href}
                href={k.href}
                className="group relative bg-white border border-stone-200 hover:border-emerald-600 hover:shadow-kart transition-all rounded-2xl p-5 flex items-start gap-4"
              >
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <k.icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="font-semibold text-stone-900 flex items-center gap-2">
                    {k.baslik}
                    {k.rozet && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                        {k.rozet}
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-stone-600 mt-0.5 leading-relaxed">{k.aciklama}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Son favoriler */}
        <section>
          <BolumBasligi baslik="Son favorilerin" href="/profil" linkMetni="Profilin" />
          {sonFavoriler && sonFavoriler.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {sonFavoriler.map((f) => {
                const y = tmdbHaritasi.get(f.movie_id);
                const url = y ? posterUrl(y.posterYolu, "w342") : null;
                return (
                  <div
                    key={f.movie_id}
                    className="aspect-[2/3] rounded-xl overflow-hidden bg-stone-200 shadow-kart"
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={y?.baslik ?? `#${f.movie_id}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs p-2 text-center">
                        {y?.baslik ?? `#${f.movie_id}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-stone-300 rounded-3xl px-6 py-12 text-center">
              <Compass className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <p className="text-stone-700 text-lg mb-4">
                Vitrinin boş. Sevdiğin ilk üç yapımı ekle, gerisi gelir.
              </p>
              <Link href="/kesfet" className="dugme">
                Keşfet&apos;e git
              </Link>
            </div>
          )}
        </section>

        {/* Yaklaşan buluşmalar */}
        {bulusmalar.length > 0 && (
          <section>
            <BolumBasligi baslik="Yaklaşan cosplay buluşmaları" href="/cosplay" linkMetni="Tümü" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bulusmalar.map((b) => (
                <BulusmaKarti key={b.id} bulusma={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function BolumBasligi({
  baslik, href, linkMetni,
}: {
  baslik: string;
  href?: string;
  linkMetni?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <h2 className="text-2xl md:text-3xl font-bold text-stone-900">{baslik}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0">
          {linkMetni}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
