// Okunmamış mesaj + bildirim sayıları. Sekme rozetleri ve zil buradan okur.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";

type Sayilar = { mesaj: number; bildirim: number; yenile: () => Promise<void> };

const Baglam = createContext<Sayilar>({ mesaj: 0, bildirim: 0, yenile: async () => {} });

export function SayacSaglayici({ children, aktif }: { children: ReactNode; aktif: boolean }) {
  const [sayilar, setSayilar] = useState({ mesaj: 0, bildirim: 0 });

  const yenile = useCallback(async () => {
    if (!aktif) return;
    const { data, error } = await supabase.rpc("bildirim_ozeti");
    if (!error && data) {
      setSayilar({ mesaj: Number(data.mesaj ?? 0), bildirim: Number(data.bildirim ?? 0) });
      return;
    }
    // Bildirim tablosu yoksa en azından mesaj sayısı.
    const { data: mesaj } = await supabase.rpc("okunmamis_sayisi");
    setSayilar({ mesaj: Number(mesaj ?? 0), bildirim: 0 });
  }, [aktif]);

  useEffect(() => {
    if (!aktif) {
      setSayilar({ mesaj: 0, bildirim: 0 });
      return;
    }
    void yenile();
    const z = setInterval(yenile, 20000);
    const abone = AppState.addEventListener("change", (d) => {
      if (d === "active") void yenile();
    });
    return () => {
      clearInterval(z);
      abone.remove();
    };
  }, [aktif, yenile]);

  return <Baglam.Provider value={{ ...sayilar, yenile }}>{children}</Baglam.Provider>;
}

export function useSayilar() {
  return useContext(Baglam);
}
