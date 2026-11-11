'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart, X, Sparkles, MessageCircle } from "lucide-react";
import Konfeti from "@/components/ui/Konfeti";
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
          className="dugme-cizgi px-7! py-3! text-base hover:border-stone-500! hover:text-stone-900!"
        >
          <X className="w-4 h-4" />
          Geç
        </button>
        <button
          type="button"
          onClick={() => tikla("begen")}
          disabled={bekle}
          className="dugme px-9! py-3! text-base"
        >
          <Heart className="w-4 h-4 fill-current" />
          Beğen
        </button>
        {hata && <span role="alert" className="text-sm text-rose-700">{hata}</span>}
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-perde-950/70 backdrop-blur-sm animate-sayfa">
      <div role="dialog" aria-modal="true" aria-label="Eşleştiniz" className="animate-zipla relative overflow-hidden bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
        <Konfeti />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-stone-900 mb-2">Eşleştiniz!</h2>
        <p className="text-stone-600 mb-4">
          <strong>{adayAd}</strong> de seni beğendi. Aranızda %{uyumYuzdesi} uyum var; ilk mesajı ortak bir favoriden aç.
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <Link
            href="/sohbet"
            className="dugme py-3!"
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
