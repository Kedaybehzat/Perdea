'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, X, Sparkles, MessageCircle } from "lucide-react";
import { kararKaydet } from "./actions";

type Props = {
  adayId: string;
  adayAd: string;
  adayUsername: string | null;
  uyumYuzdesi: number;
};

export default function KararButonlari({ adayId, adayAd, adayUsername, uyumYuzdesi }: Props) {
  const router = useRouter();
  const [bekle, startTransition] = useTransition();
  const [eslestiniz, setEslestiniz] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  function tikla(karar: "begen" | "gec") {
    setHata(null);
    startTransition(async () => {
      const r = await kararKaydet(adayId, karar);
      if (r.hata) {
        setHata(r.hata);
        return;
      }
      if (karar === "begen" && r.karsilikliEslesme) {
        setEslestiniz(true);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => tikla("gec")}
          disabled={bekle}
          className="inline-flex items-center gap-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Geç
        </button>
        <button
          type="button"
          onClick={() => tikla("begen")}
          disabled={bekle}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          Beğen
        </button>
        {hata && <span className="text-sm text-rose-600">{hata}</span>}
      </div>

      {eslestiniz && (
        <EslesmeKutlama
          adayAd={adayAd}
          adayUsername={adayUsername}
          uyumYuzdesi={uyumYuzdesi}
          kapat={() => {
            setEslestiniz(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function EslesmeKutlama({
  adayAd,
  adayUsername,
  uyumYuzdesi,
  kapat,
}: {
  adayAd: string;
  adayUsername: string | null;
  uyumYuzdesi: number;
  kapat: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-stone-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 mb-2">Eşleştiniz! 🎉</h2>
        <p className="text-stone-600 mb-4">
          <strong>{adayAd}</strong> de seni beğendi — %{uyumYuzdesi} uyumla
          başlayan bir hikâye.
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <Link
            href="/sohbet"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Sohbete başla
          </Link>
          {adayUsername && (
            <Link
              href={`/u/${adayUsername}`}
              className="text-sm text-stone-600 hover:text-stone-900 py-2"
            >
              Önce profiline bak
            </Link>
          )}
          <button
            type="button"
            onClick={kapat}
            className="text-sm text-stone-500 hover:text-stone-700 py-2"
          >
            Sonraki eşleşmeye geç
          </button>
        </div>
      </div>
    </div>
  );
}
