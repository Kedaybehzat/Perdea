import Link from "next/link";
import { Users, MessageCircle, Film, UserPlus, ListChecks, Heart, Sparkles, Star, Gamepad2, MessageSquareText, Clapperboard, Compass } from "lucide-react";
import KarsilamaKarti from "@/components/KarsilamaKarti";
import { createClient } from "@/lib/supabase/server";
import { yapimlariIdyeGoreCek, posterUrl, tmdbHazirMi } from "@/lib/tmdb";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return <GirisliAnaSayfa userId={user.id} />;
  }

  return (
    <main>
      {/* Hero Section — iki sütunlu: solda metin+butonlar, sağda görsel */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* SOL: başlık, açıklama, butonlar */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-stone-900 mb-6 leading-tight">
              Zevkini paylaş,<br />
              <span className="text-emerald-700">ruh eşini bul.</span>
            </h1>

            <p className="text-lg text-stone-600 mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Film, dizi ve anime zevkine göre insanlarla eşleş; birlikte keşfet,
              konuş, paylaş.
            </p>

            <div className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4">
              <Link
                href="/kayit"
                className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
              >
                Hemen Başla
              </Link>
              <Link
                href="/kesfet"
                className="px-8 py-4 border border-stone-300 text-stone-700 rounded-lg font-semibold text-lg hover:border-emerald-600 hover:text-emerald-700 transition-colors w-full sm:w-auto"
              >
                Nasıl Çalışır
              </Link>
            </div>
          </div>

          {/* SAĞ: eşleşme demo kartı — CSS ile Perdea'nın ne yaptığını gösterir. */}
          <div className="flex-1 hidden md:block">
            <EslesmeDemoKarti />
          </div>
        </div>
      </section>

      {/* Özellikler Section */}
      <section className="px-6 py-16 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Perdea'da neler var?
            </h2>
            <p className="text-lg text-stone-600">
              Sinefil bir Türk kullanıcının ihtiyacı olan her şey, tek çatı altında.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KarsilamaKarti
              icon={Users}
              baslik="Eşleşme"
              aciklama="Zevkine göre seni anlayan insanlarla eşleş. Doğru kişi, doğru filmde buluşur."
            />
            <KarsilamaKarti
              icon={MessageCircle}
              baslik="Topluluk"
              aciklama="İzlediklerin üzerine konuş, tartış, öner. Seni anlayan bir toplulukla bağ kur."
            />
            <KarsilamaKarti
              icon={Film}
              baslik="Keşif"
              aciklama="Yeni filmler, diziler ve anime'ler keşfet. Zevkini genişlet, ufkunu aç."
            />
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nasıl çalışır?
            </h2>
            <p className="text-lg text-stone-600">
              Üç basit adım, sonrası zevk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Kaydol
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Hemen ücretsiz kayıt ol ve kendi profilini oluştur.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                <ListChecks className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Zevkini göster
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sevdiğin yapımları seç, beğenilerini paylaş.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Eşleş
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sana uygun insanlarla eşleş, tanış ve birlikte keşfet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — Alta çekici bir davet */}
      <section className="px-6 py-20 bg-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sinefil topluluğuna katıl
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            İyi filmler, doğru insanlar ve sonsuz sohbet seni bekliyor.
          </p>
          <Link
            href="/kayit"
            className="inline-block px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold text-lg hover:bg-stone-100 transition-colors"
          >
            Hemen Başla
          </Link>
        </div>
      </section>
    </main>
  );
}

function EslesmeDemoKarti() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Arka plan gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100 rounded-3xl" />

      {/* Üst: kullanıcı başlıkları */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <KullaniciMini bas="D" ad="Deniz" />
        <div className="flex flex-col items-center">
          <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            %87 uyum
          </div>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 mt-1.5" />
        </div>
        <KullaniciMini bas="M" ad="Mert" />
      </div>

      {/* Orta: ortak favori posterleri (CSS kartlar) */}
      <div className="absolute inset-x-6 top-28">
        <p className="text-xs text-stone-500 uppercase tracking-wider mb-2 text-center">
          Ortak favoriler
        </p>
        <div className="grid grid-cols-3 gap-2">
          <PosterMini renk="from-rose-400 to-rose-600" ad="Kıpkırmızı" />
          <PosterMini renk="from-slate-700 to-slate-900" ad="Gece Vardiyası" />
          <PosterMini renk="from-amber-400 to-amber-600" ad="Rüzgarın Hatıraları" />
        </div>
      </div>

      {/* Alt: eşleşme çubukları */}
      <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-stone-500">Zevk uyumu</span>
          <span className="text-emerald-700 font-semibold">%87</span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "87%" }} />
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-500">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          12 ortak yapım · 3 ortak tür
        </div>
      </div>
    </div>
  );
}

function KullaniciMini({ bas, ad }: { bas: string; ad: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xl shadow-sm">
        {bas}
      </div>
      <p className="text-xs text-stone-700 font-medium mt-1.5">{ad}</p>
    </div>
  );
}

function PosterMini({ renk, ad }: { renk: string; ad: string }) {
  return (
    <div
      className={`aspect-[2/3] rounded-lg bg-gradient-to-br ${renk} p-2 flex items-end shadow-sm`}
    >
      <p className="text-white text-[9px] font-semibold leading-tight line-clamp-2">
        {ad}
      </p>
    </div>
  );
}

async function GirisliAnaSayfa({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [{ data: profil }, { data: sonFavoriler }, { count: favoriSayisi }, { count: puanSayisi }] =
    await Promise.all([
      supabase.from("users").select("display_name, username").eq("id", userId).single(),
      supabase
        .from("favorites")
        .select("movie_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("ratings").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

  const ad = profil?.display_name || profil?.username || "Hoş geldin";
  const posterIdleri = (sonFavoriler ?? []).map((f) => f.movie_id);
  const tmdbHaritasi = tmdbHazirMi() ? await yapimlariIdyeGoreCek(posterIdleri) : new Map();

  return (
    <main className="bg-stone-50 min-h-screen">
      <section className="px-6 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <p className="text-stone-500 text-sm mb-1">Hoş geldin,</p>
              <h1 className="text-4xl md:text-5xl font-bold text-stone-900">
                {ad} <span className="text-emerald-700">👋</span>
              </h1>
              <p className="text-stone-600 mt-2">
                Zevkine bir şeyler ekle, yeni insanlarla tanış.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm">
              <span className="text-stone-500">Favorin</span>
              <strong className="text-stone-900">{favoriSayisi ?? 0}</strong>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">Puan</span>
              <strong className="text-stone-900">{puanSayisi ?? 0}</strong>
            </div>
          </div>

          {/* Son favoriler */}
          <section className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Son favorilerin
              </h2>
              <Link href="/profil" className="text-sm text-emerald-700 hover:text-emerald-800">
                Tümü →
              </Link>
            </div>
            {sonFavoriler && sonFavoriler.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {sonFavoriler.map((f) => {
                  const y = tmdbHaritasi.get(f.movie_id);
                  const url = y ? posterUrl(y.posterYolu, "w185") : null;
                  return (
                    <div
                      key={f.movie_id}
                      className="aspect-[2/3] rounded-lg overflow-hidden bg-stone-200 border border-stone-200"
                    >
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={y?.baslik ?? `#${f.movie_id}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs p-2 text-center">
                          {y?.baslik ?? `#${f.movie_id}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl">
                <p className="text-stone-500 mb-3">
                  Henüz favori eklemedin. Keşfet'ten başla.
                </p>
                <Link
                  href="/kesfet"
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  Keşfet'e git
                </Link>
              </div>
            )}
          </section>

          {/* Hızlı erişim kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <HizliKart
              href="/kesfet"
              icon={<Compass className="w-5 h-5" />}
              baslik="Keşfet"
              aciklama="Haftanın öne çıkan filmleri. Favoriye ekle, puan ver."
              renk="emerald"
            />
            <HizliKart
              href="/eslesme"
              icon={<Sparkles className="w-5 h-5" />}
              baslik="Eşleşmelerin"
              aciklama="Zevkine en yakın insanları gör."
              renk="emerald"
            />
            <HizliKart
              href="/oyun"
              icon={<Gamepad2 className="w-5 h-5" />}
              baslik="Karakter Oyunu"
              aciklama="Ortak favoriden karakter seç, 20 soruda bulsun."
              renk="amber"
              yeni
            />
            <HizliKart
              href="/baslik"
              icon={<MessageSquareText className="w-5 h-5" />}
              baslik="Başlıklar"
              aciklama="Ekşi + Twitter — bir yapım bir başlık, altı entry."
              renk="emerald"
            />
            <HizliKart
              href="/sohbet"
              icon={<MessageCircle className="w-5 h-5" />}
              baslik="Sohbetler"
              aciklama="Eşleştiklerinle birebir mesaj."
              renk="emerald"
            />
            <HizliKart
              href="/vizyon"
              icon={<Clapperboard className="w-5 h-5" />}
              baslik="Vizyon"
              aciklama="Türkiye'de sinemada ne var, yakında ne gelecek."
              renk="emerald"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function HizliKart({
  href,
  icon,
  baslik,
  aciklama,
  renk,
  yeni,
}: {
  href: string;
  icon: React.ReactNode;
  baslik: string;
  aciklama: string;
  renk: "emerald" | "amber";
  yeni?: boolean;
}) {
  const renkSinif =
    renk === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <Link
      href={href}
      className="group relative bg-white border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all rounded-2xl p-5 block"
    >
      {yeni && (
        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Yeni
        </span>
      )}
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${renkSinif} mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-emerald-700 transition-colors">
        {baslik}
      </h3>
      <p className="text-sm text-stone-600 leading-relaxed">{aciklama}</p>
    </Link>
  );
}