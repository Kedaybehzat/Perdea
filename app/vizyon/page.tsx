import Link from "next/link";
import { Calendar, Clapperboard, Sparkles, Star } from "lucide-react";
import {
  vizyondakiFilmler,
  yakindaFilmler,
  posterUrl,
  tmdbHazirMi,
  type TmdbYapim,
} from "@/lib/tmdb";

export const metadata = {
  title: "Vizyon — Perdea",
  description: "Türkiye vizyonundaki filmler ve yakında gelecekler.",
};

export default async function VizyonSayfasi() {
  if (!tmdbHazirMi()) {
    return <TmdbKurulumu />;
  }

  const [simdi, yakinda] = await Promise.all([
    vizyondakiFilmler(),
    yakindaFilmler(),
  ]);

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            Vizyon
            <Clapperboard className="w-7 h-7 text-emerald-600" />
          </h1>
          <p className="text-stone-600">
            Türkiye vizyonundaki filmler ve yakında gelecekler.
          </p>
        </div>

        <Bolum
          baslik="Şu an vizyonda"
          aciklama="Sinemalarda gösterimde — TR bölgesi."
          icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
          filmler={simdi}
          bosMesaj="Bu hafta TMDB'de TR bölgesi için vizyondaki film bulunamadı."
        />

        <div className="mt-12">
          <Bolum
            baslik="Yakında"
            aciklama="Takvimdeki bir sonraki vizyon dalgası."
            icon={<Calendar className="w-5 h-5 text-emerald-600" />}
            filmler={yakinda}
            bosMesaj="Yakında vizyona girecek film yok görünüyor."
          />
        </div>

        <p className="text-center text-xs text-stone-400 mt-10">
          Film verileri TMDB tarafından sağlanır.
        </p>
      </div>
    </main>
  );
}

function Bolum({
  baslik,
  aciklama,
  icon,
  filmler,
  bosMesaj,
}: {
  baslik: string;
  aciklama: string;
  icon: React.ReactNode;
  filmler: TmdbYapim[];
  bosMesaj: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-2">
          {icon}
          {baslik}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{aciklama}</p>
      </div>

      {filmler.length === 0 ? (
        <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl">
          <p className="text-stone-500">{bosMesaj}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filmler.map((f) => (
            <FilmKart key={f.id} film={f} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilmKart({ film }: { film: TmdbYapim }) {
  const url = posterUrl(film.posterYolu, "w342");
  return (
    <article className="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[2/3] bg-stone-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={film.baslik}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs p-2 text-center">
            Poster yok
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-stone-900 text-sm line-clamp-1" title={film.baslik}>
          {film.baslik}
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs text-stone-500">
          <span>{film.yil ?? "—"}</span>
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {film.tmdbPuani ? film.tmdbPuani.toFixed(1) : "—"}
          </span>
        </div>
      </div>
    </article>
  );
}

function TmdbKurulumu() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl text-center bg-white border border-stone-200 rounded-2xl p-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
          <Clapperboard className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Vizyon için TMDB kurulumu gerekiyor
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-5">
          Vizyon takvimi TMDB'den çekiliyor.{" "}
          <Link href="/kesfet" className="text-emerald-700 underline">
            Keşfet sayfasındaki
          </Link>{" "}
          kurulum rehberini uygula.
        </p>
      </div>
    </main>
  );
}
