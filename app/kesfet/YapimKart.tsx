'use client'

import { useState, useTransition } from "react";
import { Heart, Star } from "lucide-react";
import { favoriDegistir, puanKaydet, puanTemizle } from "./actions";
import type { TmdbYapim } from "@/lib/tmdb";

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
  const [favori, setFavori] = useState(favoriBaslangic);
  const [puan, setPuan] = useState<number | null>(puanBaslangic);
  const [puanAcik, setPuanAcik] = useState(false);
  const [bekle, startTransition] = useTransition();

  function kalpTikla() {
    if (!girisli) {
      window.location.href = "/giris";
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
      window.location.href = "/giris";
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
    <article className="group relative bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[2/3] bg-stone-100">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={yapim.baslik}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs text-center px-2">
            Poster yok
          </div>
        )}

        <button
          type="button"
          onClick={kalpTikla}
          disabled={bekle}
          aria-label={favori ? "Favoriden çıkar" : "Favoriye ekle"}
          className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            favori
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-white/80 text-stone-600 hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${favori ? "fill-current" : ""}`} />
        </button>

        {puan !== null && (
          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-sm font-bold px-2 py-0.5 rounded-md shadow">
            {puan}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-stone-900 text-sm line-clamp-1" title={yapim.baslik}>
          {yapim.baslik}
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs text-stone-500">
          <span>
            {yapim.yil ?? "—"} · {yapim.tur}
          </span>
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {yapim.tmdbPuani ? yapim.tmdbPuani.toFixed(1) : "—"}
          </span>
        </div>

        <div className="mt-3 relative">
          <button
            type="button"
            onClick={() => setPuanAcik((o) => !o)}
            className="w-full text-xs font-medium border border-stone-300 hover:border-emerald-600 hover:text-emerald-700 text-stone-700 rounded-lg py-1.5 transition-colors"
          >
            {puan !== null ? `Puanın: ${puan}` : "Puan ver"}
          </button>

          {puanAcik && (
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-stone-200 rounded-lg shadow-lg p-2 z-10">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => puanaBas(n)}
                    className={`text-xs py-1.5 rounded transition-colors ${
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
