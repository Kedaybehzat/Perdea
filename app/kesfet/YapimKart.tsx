'use client'

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { favoriDegistir, puanKaydet, puanTemizle } from "./actions";
import type { TmdbYapim } from "@/lib/tmdb";
import AfisYok from "@/components/ui/AfisYok";

type Props = {
  yapim: TmdbYapim;
  posterUrl: string | null;
  favoriBaslangic: boolean;
  puanBaslangic: number | null;
  girisli: boolean;
};

export default function YapimKart({
  yapim,
  posterUrl,
  favoriBaslangic,
  puanBaslangic,
  girisli,
}: Props) {
  const router = useRouter();
  const [favori, setFavori] = useState(favoriBaslangic);
  const [puan, setPuan] = useState<number | null>(puanBaslangic);
  const [puanAcik, setPuanAcik] = useState(false);
  const [bekle, startTransition] = useTransition();

  function kalpTikla() {
    if (!girisli) {
      router.push("/giris");
      return;
    }
    const yeni = !favori;
    setFavori(yeni);
    startTransition(async () => {
      const r = await favoriDegistir(yapim.id);
      if (r.hata) setFavori(!yeni);
    });
  }

  function puanaBas(deger: number) {
    if (!girisli) {
      router.push("/giris");
      return;
    }
    const oncekiPuan = puan;
    setPuan(deger);
    setPuanAcik(false);
    startTransition(async () => {
      const r = await puanKaydet(yapim.id, deger);
      if (r.hata) setPuan(oncekiPuan);
    });
  }

  function puaniKaldir() {
    const oncekiPuan = puan;
    setPuan(null);
    setPuanAcik(false);
    startTransition(async () => {
      const r = await puanTemizle(yapim.id);
      if (r.hata) setPuan(oncekiPuan);
    });
  }

  return (
    <article className="group relative">
      <div className="afis aspect-[2/3]">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={yapim.baslik}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <AfisYok baslik={yapim.baslik} />
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        <span className="absolute bottom-2 left-2.5 flex items-center gap-1 text-xs font-semibold text-white">
          <Star className="w-3.5 h-3.5 fill-altin text-altin" />
          {yapim.tmdbPuani ? yapim.tmdbPuani.toFixed(1) : "—"}
        </span>

        <button
          type="button"
          onClick={kalpTikla}
          disabled={bekle}
          aria-label={favori ? "Favoriden çıkar" : "Favoriye ekle"}
          aria-pressed={favori}
          className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            favori
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-black/35 text-white hover:bg-black/55"
          }`}
        >
          <Heart key={String(favori)} className={`w-5 h-5 ${favori ? "fill-current animate-zipla" : ""}`} />
        </button>

        {puan !== null && (
          <span
            key={puan}
            className="animate-zipla absolute top-2 left-2 bg-altin text-perde-950 text-sm font-bold min-w-8 h-8 px-2 rounded-full flex items-center justify-center shadow"
            title="Senin puanın"
          >
            {puan}
          </span>
        )}
      </div>

      <div className="pt-3">
        <h3 className="font-semibold text-stone-900 leading-snug line-clamp-1" title={yapim.baslik}>
          {yapim.baslik}
        </h3>
        <p className="mt-0.5 text-sm text-stone-500">
          {yapim.yil ?? "—"} · {yapim.tur === "film" ? "Film" : "Dizi"}
        </p>

        <div className="mt-2 relative">
          <button
            type="button"
            onClick={() => setPuanAcik((o) => !o)}
            aria-expanded={puanAcik}
            className={`w-full text-sm font-semibold rounded-lg py-1.5 border transition-colors ${
              puan !== null
                ? "border-altin/60 bg-amber-50 text-altin-koyu"
                : "border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
            }`}
          >
            {puan !== null ? `Puanın: ${puan}/10` : "Puan ver"}
          </button>

          {puanAcik && (
            <div className="animate-belir absolute left-0 right-0 bottom-full mb-2 bg-white border border-stone-200 rounded-xl shadow-kart p-2 z-10">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => puanaBas(n)}
                    className={`text-sm font-semibold py-1.5 rounded-md transition-colors ${
                      puan === n
                        ? "bg-emerald-600 text-white"
                        : "hover:bg-emerald-50 text-stone-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {puan !== null && (
                <button
                  type="button"
                  onClick={puaniKaldir}
                  className="mt-2 w-full text-xs text-stone-500 hover:text-rose-600"
                >
                  Puanı kaldır
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
