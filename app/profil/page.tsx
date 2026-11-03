import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Pencil, Star, Heart, Film, Users, Flame } from "lucide-react";
import { yapimlariIdyeGoreCek, posterUrl, tmdbHazirMi } from "@/lib/tmdb";

export const metadata = {
  title: "Profilim — Perdea",
  description: "Favori vitrini, puanladıkların ve profil özetin.",
};

export default async function ProfilSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: profil } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: favoriler } = await supabase
    .from("favorites")
    .select("movie_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: puanlar } = await supabase
    .from("ratings")
    .select("movie_id, score, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(12);

  const { count: favoriSayisi } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: puanSayisi } = await supabase
    .from("ratings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Favori + puanladıkların poster bilgisini TMDB'den topla (varsa).
  const posterIdleri = new Set<number>();
  (favoriler ?? []).forEach((f) => posterIdleri.add(f.movie_id));
  (puanlar ?? []).forEach((p) => posterIdleri.add(p.movie_id));
  const tmdbHaritasi = tmdbHazirMi()
    ? await yapimlariIdyeGoreCek([...posterIdleri])
    : new Map();

  const goruntuAdi = profil?.display_name || profil?.username || "Perdea üyesi";
  const kullaniciAdi = profil?.username || "";
  const bio = profil?.bio;
  const avatarUrl = profil?.avatar_url;
  const bastHarf = goruntuAdi.charAt(0).toUpperCase();

  const uyelikTarihi = profil?.created_at
    ? new Date(profil.created_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
      })
    : null;

  const ortalamaPuan =
    puanlar && puanlar.length
      ? (puanlar.reduce((t, p) => t + p.score, 0) / puanlar.length).toFixed(1)
      : "—";

  return (
    <main className="bg-stone-50 min-h-screen">
      {/* Kapak + avatar */}
      <div className="relative">
        <div className="h-48 md:h-56 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="-mt-16 md:-mt-20 flex items-end gap-5">
            <div className="relative shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={goruntuAdi}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white object-cover bg-stone-200"
                />
              ) : (
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white bg-emerald-100 text-emerald-700 flex items-center justify-center text-5xl font-bold">
                  {bastHarf}
                </div>
              )}
              <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 truncate">
                {goruntuAdi}
              </h1>
              {kullaniciAdi && (
                <p className="text-stone-500 text-sm">@{kullaniciAdi}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio + chipler + düzenle */}
      <div className="max-w-6xl mx-auto px-6 pt-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          <div className="flex-1">
            {bio ? (
              <p className="text-stone-700 leading-relaxed max-w-2xl">{bio}</p>
            ) : (
              <p className="text-stone-400 italic max-w-2xl">
                Henüz bir bio yok. "Profili Düzenle"den kendini anlatabilirsin.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {uyelikTarihi && (
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  {uyelikTarihi}'den beri üye
                </span>
              )}
            </div>
          </div>
          <Link
            href="/profil/duzenle"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Pencil className="w-4 h-4" />
            Profili Düzenle
          </Link>
        </div>
      </div>

      {/* Ana grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol / orta */}
        <div className="lg:col-span-2 space-y-6">
          {/* Favori Vitrini */}
          <section className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-600" />
                Favori Vitrini
              </h2>
              <Link href="/kesfet" className="text-sm text-emerald-700 hover:text-emerald-800">
                Keşfet →
              </Link>
            </div>
            {favoriler && favoriler.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favoriler.map((f) => (
                  <PosterKart
                    key={f.movie_id}
                    movieId={f.movie_id}
                    yapim={tmdbHaritasi.get(f.movie_id)}
                  />
                ))}
              </div>
            ) : (
              <BosDurum
                icon={<Heart className="w-6 h-6" />}
                baslik="Henüz favorin yok"
                aciklama="Keşfet sayfasından sevdiğin filmleri favorilerine ekle."
                buton="Keşfet'e git"
                butonLink="/kesfet"
              />
            )}
          </section>

          {/* Puanladıklarım */}
          <section className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-600" />
                Puanladıklarım
              </h2>
              {puanSayisi && puanSayisi > 0 ? (
                <span className="text-sm text-stone-500">
                  {puanSayisi} yapım
                </span>
              ) : null}
            </div>
            {puanlar && puanlar.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {puanlar.map((p) => (
                  <PuanKart
                    key={p.movie_id}
                    movieId={p.movie_id}
                    score={p.score}
                    yapim={tmdbHaritasi.get(p.movie_id)}
                  />
                ))}
              </div>
            ) : (
              <BosDurum
                icon={<Star className="w-6 h-6" />}
                baslik="Henüz puan vermedin"
                aciklama="Bir yapıma puan ver, profilinde burada görünecek."
                buton="Keşfet'e git"
                butonLink="/kesfet"
              />
            )}
          </section>
        </div>

        {/* Sağ sidebar */}
        <aside className="space-y-6">
          <section className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
              Profil Özeti
            </h3>
            <div className="space-y-3">
              <OzetSatiri
                icon={<Heart className="w-4 h-4" />}
                etiket="Favori"
                deger={favoriSayisi ?? 0}
              />
              <OzetSatiri
                icon={<Star className="w-4 h-4" />}
                etiket="Puan"
                deger={puanSayisi ?? 0}
              />
              <OzetSatiri
                icon={<Flame className="w-4 h-4" />}
                etiket="Ortalama puan"
                deger={ortalamaPuan}
              />
              <OzetSatiri
                icon={<Users className="w-4 h-4" />}
                etiket="Eşleşme"
                deger="—"
              />
            </div>
          </section>

          <section className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
              En Aktif Türlerin
            </h3>
            <p className="text-sm text-stone-400">
              Birkaç yapım puanladıktan sonra türler burada ortaya çıkacak.
            </p>
          </section>

          <section className="bg-white border border-stone-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
              Son Aktiviteler
            </h3>
            <p className="text-sm text-stone-400">
              Aktivite akışı yakında — favori ekle, puan ver, eşleş.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function OzetSatiri({
  icon,
  etiket,
  deger,
}: {
  icon: React.ReactNode;
  etiket: string;
  deger: string | number;
}) {
  return (
    <div className="flex items-center justify-between text-stone-700">
      <span className="flex items-center gap-2 text-sm">
        <span className="text-emerald-600">{icon}</span>
        {etiket}
      </span>
      <span className="font-semibold text-stone-900">{deger}</span>
    </div>
  );
}

function BosDurum({
  icon,
  baslik,
  aciklama,
  buton,
  butonLink,
}: {
  icon: React.ReactNode;
  baslik: string;
  aciklama: string;
  buton: string;
  butonLink: string;
}) {
  return (
    <div className="text-center py-10 px-4 border-2 border-dashed border-stone-200 rounded-xl">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
        {icon}
      </div>
      <h4 className="text-stone-900 font-semibold mb-1">{baslik}</h4>
      <p className="text-sm text-stone-500 mb-4 max-w-sm mx-auto">{aciklama}</p>
      <Link
        href={butonLink}
        className="inline-block text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {buton}
      </Link>
    </div>
  );
}

type YapimOzet = { baslik: string; posterYolu: string | null; yil: number | null };

function PosterKart({ movieId, yapim }: { movieId: number; yapim?: YapimOzet }) {
  const url = yapim ? posterUrl(yapim.posterYolu, "w342") : null;
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-stone-200 border border-stone-200">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={yapim?.baslik ?? `#${movieId}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs text-center p-2">
          {yapim?.baslik ?? `#${movieId}`}
        </div>
      )}
      {yapim?.baslik && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium line-clamp-1">{yapim.baslik}</p>
        </div>
      )}
    </div>
  );
}

function PuanKart({
  movieId,
  score,
  yapim,
}: {
  movieId: number;
  score: number;
  yapim?: YapimOzet;
}) {
  const url = yapim ? posterUrl(yapim.posterYolu, "w185") : null;
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-stone-200 border border-stone-200">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={yapim?.baslik ?? `#${movieId}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs p-2 text-center">
          {yapim?.baslik ?? `#${movieId}`}
        </div>
      )}
      <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-md shadow">
        {score}
      </span>
    </div>
  );
}
