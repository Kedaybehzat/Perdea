'use client'

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Girişli kullanıcı için arka planda sayıları yoklar:
//  - sekme başlığına "(3)" ekler,
//  - sayı artınca üst menüyü tazeler,
//  - izin verilmişse ve sekme arkadaysa tarayıcı bildirimi gösterir.
export default function CanliBildirim({ mesaj, bildirim }: { mesaj: number; bildirim: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const onceki = useRef({ mesaj, bildirim });
  const toplam = useRef(mesaj + bildirim);

  // Sunucudan gelen güncel sayıları esas al.
  useEffect(() => {
    onceki.current = { mesaj, bildirim };
    toplam.current = mesaj + bildirim;
  }, [mesaj, bildirim]);

  // Sekme başlığı: "(3) Sayfa adı"
  useEffect(() => {
    const yaz = () => {
      const sade = document.title.replace(/^\(\d+\+?\)\s*/, "");
      const n = toplam.current;
      document.title = n > 0 ? `(${n > 99 ? "99+" : n}) ${sade}` : sade;
    };
    yaz();
    const z = setTimeout(yaz, 400); // Next başlığı değiştirdikten sonra bir daha
    return () => clearTimeout(z);
  }, [pathname, mesaj, bildirim]);

  useEffect(() => {
    const supabase = createClient();
    let durdu = false;

    async function yokla() {
      if (durdu || !navigator.onLine) return;
      const { data, error } = await supabase.rpc("bildirim_ozeti");
      if (error || !data || durdu) return;
      const yeni = { mesaj: Number(data.mesaj ?? 0), bildirim: Number(data.bildirim ?? 0) };
      const eski = onceki.current;
      const artti = yeni.mesaj > eski.mesaj || yeni.bildirim > eski.bildirim;
      const degisti = yeni.mesaj !== eski.mesaj || yeni.bildirim !== eski.bildirim;
      onceki.current = yeni;
      toplam.current = yeni.mesaj + yeni.bildirim;

      if (degisti) router.refresh();

      if (
        artti &&
        document.visibilityState !== "visible" &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        const mesajMi = yeni.mesaj > eski.mesaj;
        try {
          const b = new Notification("Perdea", {
            body: mesajMi ? "Yeni bir mesajın var." : "Yeni bir bildirimin var.",
            icon: "/logo.png",
            tag: mesajMi ? "perdea-mesaj" : "perdea-bildirim",
          });
          b.onclick = () => {
            window.focus();
            router.push(mesajMi ? "/sohbet" : "/bildirimler");
            b.close();
          };
        } catch {
          // Bazı mobil tarayıcılar sayfadan bildirim açmaya izin vermez; sessizce geç.
        }
      }
    }

    const aralik = setInterval(yokla, 25000);
    const gorunur = () => {
      if (document.visibilityState === "visible") void yokla();
    };
    document.addEventListener("visibilitychange", gorunur);
    return () => {
      durdu = true;
      clearInterval(aralik);
      document.removeEventListener("visibilitychange", gorunur);
    };
  }, [router]);

  return null;
}
