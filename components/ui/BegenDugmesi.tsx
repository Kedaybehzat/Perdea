'use client'

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

// Beğen/geri al. İyimser günceller; hata olursa geri alır.
export default function BegenDugmesi({
  begenildi,
  sayi,
  girisli,
  degistir,
}: {
  begenildi: boolean;
  sayi: number;
  girisli: boolean;
  degistir: (begen: boolean) => Promise<{ hata?: string }>;
}) {
  const router = useRouter();
  const [durum, setDurum] = useState({ begenildi, sayi });
  const [bekliyor, baslat] = useTransition();

  function tikla() {
    if (!girisli) {
      router.push("/giris");
      return;
    }
    const onceki = durum;
    const yeni = !onceki.begenildi;
    setDurum({ begenildi: yeni, sayi: Math.max(0, onceki.sayi + (yeni ? 1 : -1)) });
    baslat(async () => {
      const r = await degistir(yeni);
      if (r.hata) setDurum(onceki);
    });
  }

  return (
    <button
      type="button"
      onClick={tikla}
      disabled={bekliyor}
      aria-pressed={durum.begenildi}
      aria-label={durum.begenildi ? "Beğeniyi geri al" : "Beğen"}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
        durum.begenildi
          ? "text-rose-600 bg-rose-50"
          : "text-stone-500 hover:text-rose-600 hover:bg-rose-50"
      }`}
    >
      <Heart
        key={String(durum.begenildi)}
        className={`w-4 h-4 ${durum.begenildi ? "fill-current animate-zipla" : ""}`}
      />
      <span className="tabular-nums">{durum.sayi}</span>
    </button>
  );
}
