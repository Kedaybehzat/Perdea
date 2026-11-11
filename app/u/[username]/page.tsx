import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Star, Heart, Film, Flame, MessageCircle, Sparkles } from "lucide-react";
import { sohbetBaslatAction } from "@/app/sohbet/actions";
import AfisYok from "@/components/ui/AfisYok";
import { yapimlariIdyeGoreCek, posterUrl, tmdbHazirMi } from "@/lib/tmdb";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return {
    title: `@${username} — Perdea`,
    description: `${username} adlı kullanıcının Perdea profili — favori vitrini ve puanları.`,
  };
}

export default async function KamuProfilSayfasi({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profil } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profil) notFound();

  // Giriş yapmışın ise kendi ortak favoriler karşılaştırması için
  const { data: { user: benim } } = await supabase.auth.getUser();
  const benimProfilMi = benim?.id === profil.id;

  const { data: favoriler } = await supabase
    .from("favorites")
    .select("movie_id, created_at")
    .eq("user_id", profil.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: puanlar } = await supabase
    .from("ratings")
    .select("movie_id, score, updated_at")
    .eq("user_id", profil.id)
    .order("updated_at", { ascending: false })
    .limit(12);

  const { count: favoriSayisi } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profil.id);

  const { count: puanSayisi } = await supabase
    .from("ratings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profil.id);

  // Ortak favoriler (giriş yapmış ve kendi profili değilse)
  let ortakFilmIdleri: number[] = [];
  if (benim && !benimProfilMi) {
    const { data: benimFavs } = await supabase
      .from("favorites")
      .select("movie_id")
      .eq("user_id", benim.id);
    const benimSet = new Set((benimFavs ?? []).map((f) => f.movie_id));
    const digerSet = new Set((favoriler ?? []).map((f) => f.movie_id));
    ortakFilmIdleri = [...benimSet].filter((id) => digerSet.has(id));
  }

  const posterIdleri = new Set<number>();
  (favoriler ?? []).forEach((f) => posterIdleri.add(f.movie_id));
  (puanlar ?? []).forEach((p) => posterIdleri.add(p.movie_id));
  const tmdbHaritasi = tmdbHazirMi()
    ? await yapimlariIdyeGoreCek([...posterIdleri])
    : new Map();

  const goruntuAdi = profil.display_name || profil.username;
  const bastHarf = goruntuAdi.charAt(0).toUpperCase();
  const uyelikTarihi = profil.created_at
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
      <div className="relative">
        <div className="perde-zemin h-48 md:h-56" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="-mt-16 md:-mt-20 flex items-end gap-5">
            <div className="shrink-0">
              {profil.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profil.avatar_url}
                  alt={goruntuAdi}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white object-cover bg-stone-200"
                />
              ) : (
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-stone-50 bg-emerald-100 text-emerald-800 flex items-center justify-center text-6xl font-display font-bold shadow-kart">
                  {bastHarf}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-stone-900 truncate leading-tight">
                {goruntuAdi}
              </h1>
              <p className="text-stone-500 text-sm">@{profil.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          <div className="flex-1">
            {profil.bio ? (
              <p className="text-stone-700 leading-relaxed max-w-2xl">{profil.bio}</p>
            ) : (
              <p className="text-stone-400 italic max-w-2xl">
                Henüz bir bio yok.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {uyelikTarihi && (
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-stone-200 px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  {uyelikTarihi}'den beri üye
                </span>
              )}
              {ortakFilmIdleri.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  {ortakFilmIdleri.length} ortak favori
                </span>
              )}
            </div>
          </div>
          {benimProfilMi ? (
            <Link
              href="/profil"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shrink-0"
            >
              Kendi profilim
            </Link>
          ) : benim ? (
<form action={sohbetBaslatAction} className="shrink-0">
              <input type="hidden" name="kisiId" value={profil.id} />
              <button type="submit" className="dugme" title="Karşılıklı eşleştiysen sohbet açılır">
                <MessageCircle className="w-4 h-4" />
                Mesaj yaz
              </button>
            </form>
          ) : (
            <Link
              href="/giris"
              className="dugme shrink-0"
            >
              Tanışmak için giriş yap
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-stone-200 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-emerald-600" />
              Favori Vitrini
            </h2>
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
              <p className="text-sm text-stone-400">Favori vitrini boş.</p>
            )}
          </section>

          <section className="bg-white border border-stone-200 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-emerald-600" />
              Puanladıkları
            </h2>
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
              <p className="text-sm text-stone-400">Henüz puan verilmemiş.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border border-stone-200 rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">
              Profil Özeti
            </h3>
            <div className="space-y-3">
              <OzetSatiri icon={<Heart className="w-4 h-4" />} etiket="Favori" deger={favoriSayisi ?? 0} />
              <OzetSatiri icon={<Star className="w-4 h-4" />} etiket="Puan" deger={puanSayisi ?? 0} />
              <OzetSatiri icon={<Flame className="w-4 h-4" />} etiket="Ortalama puan" deger={ortalamaPuan} />
            </div>
          </section>

          {ortakFilmIdleri.length > 0 && (
            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider mb-3">
                Sizin ortak noktanız
              </h3>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Bu kullanıcıyla <strong>{ortakFilmIdleri.length}</strong> favori filmi
                paylaşıyorsunuz. Sohbet başlat ya da Keşfet'te benzer önerilere bak.
              </p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

function OzetSatiri({ icon, etiket, deger }: { icon: React.ReactNode; etiket: string; deger: string | number }) {
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

type YapimOzet = { baslik: string; posterYolu: string | null; yil: number | null };

function PosterKart({ movieId, yapim }: { movieId: number; yapim?: YapimOzet }) {
  const url = yapim ? posterUrl(yapim.posterYolu, "w342") : null;
  return (
    <div className="afis aspect-[2/3]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={yapim?.baslik ?? `#${movieId}`} className="w-full h-full object-cover" />
      ) : (
        <AfisYok baslik={yapim?.baslik ?? "Yapım"} />
      )}
      {yapim?.baslik && url && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs font-medium line-clamp-1">{yapim.baslik}</p>
        </div>
      )}
    </div>
  );
}

function PuanKart({ movieId, score, yapim }: { movieId: number; score: number; yapim?: YapimOzet }) {
  const url = yapim ? posterUrl(yapim.posterYolu, "w185") : null;
  return (
    <div className="afis aspect-[2/3]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={yapim?.baslik ?? `#${movieId}`} className="w-full h-full object-cover" />
      ) : (
        <AfisYok baslik={yapim?.baslik ?? "Yapım"} />
      )}
      <span className="absolute top-1.5 right-1.5 bg-altin text-perde-950 text-xs font-bold min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center shadow">
        {score}
      </span>
    </div>
  );
}
