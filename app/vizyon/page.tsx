import Link from "next/link";
import { Armchair, Clapperboard, Star } from "lucide-react";
import PerdeBandi from "@/components/ui/PerdeBandi";
import BosDurum from "@/components/ui/BosDurum";
import AfisYok from "@/components/ui/AfisYok";
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
      <PerdeBandi
        ampul
        ustEtiket="Vizyon"
        baslik="Bu hafta"
        vurgu="perdede"
        aciklama="Türkiye'de gösterimde olanlar ve sıradaki vizyon dalgası."
      >
        <Link href="/salonlar" className="dugme bg-altin! text-perde-950! hover:brightness-105 shadow-none!">
          <Armchair className="w-4 h-4" />
          Nerede izlesem?
        </Link>
      </PerdeBandi>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <Bolum
          baslik="Şu an vizyonda"
          aciklama="Sinemalarda gösterimde."
          filmler={simdi}
          bosMesaj="Bu hafta için vizyon listesi gelmedi. Biraz sonra yeniden dene."
        />

        <div className="mt-14 goster">
          <Bolum
            baslik="Yakında"
            aciklama="Takvimde sırada bekleyenler."
            filmler={yakinda}
            bosMesaj="Yakında vizyona girecek film görünmüyor."
            tarihli
          />
        </div>

        <p className="text-center text-xs text-stone-400 mt-12">
          Film verileri TMDB tarafından sağlanır.
        </p>
      </div>
    </main>
  );
}

function Bolum({
  baslik,
  aciklama,
  filmler,
  bosMesaj,
  tarihli = false,
}: {
  baslik: string;
  aciklama: string;
  filmler: TmdbYapim[];
  bosMesaj: string;
  tarihli?: boolean;
}) {
  return (
    <section>
      <div className="mb-5 flex items-baseline gap-3 flex-wrap">
        <h2 className="text-3xl font-bold text-stone-900">{baslik}</h2>
        <p className="text-stone-500">{aciklama}</p>
      </div>

      {filmler.length === 0 ? (
        <BosDurum icon={Clapperboard} baslik="Liste boş" aciklama={bosMesaj} />
      ) : (
        <div className="sirali grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
          {filmler.map((f) => (
            <FilmKart key={f.id} film={f} tarihli={tarihli} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilmKart({ film, tarihli }: { film: TmdbYapim; tarihli: boolean }) {
  const url = posterUrl(film.posterYolu, "w342");
  return (
    <article className="group">
      <div className="afis aspect-[2/3]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={film.baslik} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <AfisYok baslik={film.baslik} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <span className="absolute bottom-2 left-2.5 flex items-center gap-1 text-xs font-semibold text-white">
          <Star className="w-3.5 h-3.5 fill-altin text-altin" />
          {film.tmdbPuani ? film.tmdbPuani.toFixed(1) : "—"}
        </span>
        {tarihli && (
          <span className="absolute top-2 left-2 bg-altin text-perde-950 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
            Yakında
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="font-semibold text-stone-900 leading-snug line-clamp-1" title={film.baslik}>
          {film.baslik}
        </h3>
        <p className="mt-0.5 text-sm text-stone-500">{film.yil ?? "—"}</p>
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
