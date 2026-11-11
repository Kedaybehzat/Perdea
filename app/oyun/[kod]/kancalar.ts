'use client'

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Oda canlı güncelleme: Supabase Realtime bildirim gelince sayfayı tazeler;
// ayrıca belirli aralıkla yoklar (Realtime kapalı/erişilemezse de oyun akar).
export function useOdaCanli(odaId: string) {
  const router = useRouter();

  useEffect(() => {
    let canliBagli = false;
    const supabase = createClient();
    const kanal = supabase
      .channel(`oda:${odaId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "oyun_odalari", filter: `id=eq.${odaId}` },
        () => router.refresh()
      )
      .subscribe((durum) => {
        canliBagli = durum === "SUBSCRIBED";
      });

    const yokla = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
    }, 3000);
    // Realtime bağlıysa yoklamayı seyrelt.
    const seyrek = setInterval(() => {
      if (canliBagli) clearInterval(yokla);
    }, 5000);
    const yedek = setInterval(() => {
      if (canliBagli && document.visibilityState === "visible") router.refresh();
    }, 12000);

    const gorunur = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", gorunur);

    return () => {
      clearInterval(yokla);
      clearInterval(seyrek);
      clearInterval(yedek);
      document.removeEventListener("visibilitychange", gorunur);
      supabase.removeChannel(kanal);
    };
  }, [odaId, router]);
}

// Sunucu işlemini çalıştırır; bekleme ve hata durumunu tutar.
export function useIslem() {
  const [bekliyor, startTransition] = useTransition();
  const [hata, setHata] = useState<string | undefined>();

  const calistir = useCallback(
    (islem: () => Promise<{ hata?: string } | void>, sonra?: () => void) => {
      setHata(undefined);
      startTransition(async () => {
        const sonuc = await islem();
        if (sonuc && sonuc.hata) setHata(sonuc.hata);
        else sonra?.();
      });
    },
    []
  );

  return { bekliyor, hata, calistir, hatayiTemizle: () => setHata(undefined) };
}
