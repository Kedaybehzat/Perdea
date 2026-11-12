import { router, useFocusEffect } from "expo-router";
import { PartyPopper, Plus, ShieldCheck } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Kart } from "@/components/Kart";
import UstCubuk from "@/components/UstCubuk";
import { BosDurum, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { supabase } from "@/lib/supabase";
import { bosluk, buyuk, renk, yazi } from "@/tema";

export type Bulusma = {
  id: string;
  duzenleyen_id: string;
  baslik: string;
  aciklama: string | null;
  tema: string | null;
  sehir: string;
  mekan: string;
  zaman: string;
  kontenjan: number | null;
  durum: "acik" | "iptal";
  katilimci_sayisi: number;
};

const gunB = new Intl.DateTimeFormat("tr-TR", { day: "numeric" });
const ayB = new Intl.DateTimeFormat("tr-TR", { month: "short" });
export const tamTarih = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function Bulusmalar() {
  const [liste, setListe] = useState<Bulusma[] | null>(null);
  const [hata, setHata] = useState<string>();
  const [yenileniyor, setYenileniyor] = useState(false);

  const yukle = useCallback(async () => {
    const esik = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    const { data, error } = await supabase.from("bulusma_ozet").select("*").gte("zaman", esik).order("zaman", { ascending: true }).limit(60);
    if (error) setHata(hataMesaji(error));
    setListe((data ?? []) as Bulusma[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void yukle();
    }, [yukle])
  );

  return (
    <View style={{ flex: 1, backgroundColor: renk.krem }}>
      <UstCubuk ustEtiket="Cosplay" baslik="Buluşmalar" />
      <FlatList
        data={liste ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: bosluk.l, gap: bosluk.m }}
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            tintColor={renk.zumrut}
            onRefresh={async () => {
              setYenileniyor(true);
              await yukle();
              setYenileniyor(false);
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: bosluk.m, marginBottom: bosluk.s }}>
            <Dugme ikon={Plus} onPress={() => router.push("/cosplay/yeni")}>
              Buluşma düzenle
            </Dugme>
            <View style={{ flexDirection: "row", gap: bosluk.s, alignItems: "flex-start", backgroundColor: renk.zumrutSoluk, borderRadius: 14, padding: bosluk.m }}>
              <ShieldCheck size={18} color={renk.zumrutKoyu} style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, fontFamily: yazi.govde, fontSize: 13, lineHeight: 19, color: renk.perde800 }}>
                Kalabalık, halka açık yerlerde buluş. Gittiğin yeri bir yakınına haber ver.
              </Text>
            </View>
            <HataKutusu mesaj={hata} />
          </View>
        }
        ListEmptyComponent={
          liste === null ? (
            <Yukleniyor />
          ) : (
            <BosDurum ikon={PartyPopper} baslik="Yaklaşan buluşma yok" aciklama="İlkini sen düzenle: hangi karakter olarak geleceksin?" />
          )
        }
        renderItem={({ item: b }) => {
          const t = new Date(b.zaman);
          const dolu = b.kontenjan != null && b.katilimci_sayisi >= b.kontenjan;
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/cosplay/[id]", params: { id: b.id } })}
              accessibilityRole="button"
              accessibilityLabel={`${b.baslik}, ${b.sehir}, ${tamTarih(b.zaman)}`}
            >
              <Kart style={{ flexDirection: "row", gap: bosluk.l, alignItems: "center", opacity: b.durum === "iptal" ? 0.6 : 1 }}>
                <View style={{ alignItems: "center", width: 48 }}>
                  <Text style={{ fontFamily: yazi.baslik, fontSize: 30, lineHeight: 32, color: renk.zumrutKoyu }}>{gunB.format(t)}</Text>
                  <Text style={{ fontFamily: yazi.kalin, fontSize: 11, letterSpacing: 1, color: renk.yaziOrta }}>{buyuk(ayB.format(t))}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: yazi.baslik, fontSize: 18, color: renk.yazi }} numberOfLines={2}>
                    {b.baslik}
                  </Text>
                  <Metin tur="kucuk" numberOfLines={1}>
                    {b.sehir} · {b.mekan}
                  </Metin>
                  <Text style={{ fontFamily: yazi.yariKalin, fontSize: 12, color: b.durum === "iptal" ? renk.gul : dolu ? renk.altinKoyu : renk.zumrutKoyu }}>
                    {b.durum === "iptal"
                      ? "İptal edildi"
                      : `${b.katilimci_sayisi}${b.kontenjan ? ` / ${b.kontenjan}` : ""} kişi${dolu ? " · dolu" : ""}`}
                  </Text>
                </View>
              </Kart>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
