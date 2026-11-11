import { router, useFocusEffect } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import PerdeBaslik from "@/components/Perde";
import { Avatar, BosDurum, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { kisiAdi, mesajOzeti, type Kisi, type SohbetOzeti } from "@/lib/sohbet";
import { supabase } from "@/lib/supabase";
import { goreceli } from "@/lib/zaman";
import { bosluk, renk, yazi } from "@/tema";

export default function Sohbetler() {
  const [sohbetler, setSohbetler] = useState<SohbetOzeti[] | null>(null);
  const [yeniler, setYeniler] = useState<Kisi[]>([]);
  const [hata, setHata] = useState<string>();
  const [yenileniyor, setYenileniyor] = useState(false);

  const yukle = useCallback(async () => {
    const [liste, eslesmeler] = await Promise.all([supabase.rpc("sohbetlerim"), supabase.rpc("eslesmelerim")]);
    if (liste.error) setHata(hataMesaji(liste.error));
    else setHata(undefined);
    setSohbetler((liste.data ?? []) as SohbetOzeti[]);
    setYeniler((eslesmeler.data ?? []) as Kisi[]);
  }, []);

  // Sekme açıkken birkaç saniyede bir tazele (yeni mesaj sayısı için).
  useFocusEffect(
    useCallback(() => {
      void yukle();
      const z = setInterval(yukle, 8000);
      return () => clearInterval(z);
    }, [yukle])
  );

  async function baslat(k: Kisi) {
    const { data, error } = await supabase.rpc("sohbet_ac", { p_diger: k.id });
    if (error || !data) return setHata(hataMesaji(error));
    router.push({ pathname: "/sohbet/[id]", params: { id: String(data) } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: renk.krem }}>
      <FlatList
        data={sohbetler ?? []}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: bosluk.xxl }}
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
          <View>
            <PerdeBaslik ustEtiket="Sohbet" baslik="Eşleştiklerinle" vurgu="yazış" />
            {hata ? (
              <View style={{ padding: bosluk.l }}>
                <HataKutusu mesaj={hata} />
              </View>
            ) : null}
            {yeniler.length ? (
              <View style={{ paddingTop: bosluk.l }}>
                <Metin tur="etiket" style={{ paddingHorizontal: bosluk.l, marginBottom: bosluk.s }}>
                  Yeni eşleşmeler
                </Metin>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: bosluk.l, gap: bosluk.l }}>
                  {yeniler.map((k) => (
                    <Pressable
                      key={k.id}
                      onPress={() => baslat(k)}
                      accessibilityRole="button"
                      accessibilityLabel={`${kisiAdi(k)} ile sohbet başlat`}
                      style={{ alignItems: "center", width: 68, gap: 6 }}
                    >
                      <View style={s.halka}>
                        <Avatar ad={kisiAdi(k)} url={k.avatar_url} boyut={56} />
                      </View>
                      <Text numberOfLines={1} style={{ fontFamily: yazi.orta, fontSize: 12, color: renk.yazi }}>
                        {kisiAdi(k)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
            <View style={{ height: bosluk.m }} />
          </View>
        }
        ListEmptyComponent={
          sohbetler === null ? (
            <Yukleniyor />
          ) : (
            <View style={{ paddingHorizontal: bosluk.l }}>
              <BosDurum
                ikon={MessageCircle}
                baslik={yeniler.length ? "İlk mesajı sen yaz" : "Henüz sohbetin yok"}
                aciklama={
                  yeniler.length
                    ? "Yukarıdan birine dokun, sohbet açılsın."
                    : "Biriyle karşılıklı beğenince burada açılır."
                }
              />
            </View>
          )
        }
        renderItem={({ item: x }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/sohbet/[id]", params: { id: x.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${kisiAdi(x.diger)}${x.okunmamis ? `, ${x.okunmamis} okunmamış mesaj` : ""}`}
            style={({ pressed }) => [s.satir, pressed && { backgroundColor: renk.kum }]}
          >
            <Avatar ad={kisiAdi(x.diger)} url={x.diger.avatar_url} boyut={52} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text numberOfLines={1} style={[s.ad, x.okunmamis > 0 && { fontFamily: yazi.kalin }]}>
                  {kisiAdi(x.diger)}
                </Text>
                {x.son_mesaj ? <Text style={s.zaman}>{goreceli(x.son_mesaj.created_at)}</Text> : null}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text numberOfLines={1} style={[s.onizleme, x.okunmamis > 0 && { color: renk.yazi, fontFamily: yazi.orta }]}>
                  {x.son_mesaj ? `${x.son_mesaj.benden ? "Sen: " : ""}${mesajOzeti(x.son_mesaj)}` : "Henüz mesaj yok. İlk sen yaz."}
                </Text>
                {x.okunmamis > 0 ? (
                  <View style={s.rozet}>
                    <Text style={s.rozetYazi}>{x.okunmamis > 99 ? "99+" : x.okunmamis}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  halka: { padding: 3, borderRadius: 34, borderWidth: 2, borderColor: renk.zumrut },
  satir: { flexDirection: "row", alignItems: "center", gap: bosluk.m, paddingHorizontal: bosluk.l, paddingVertical: bosluk.m },
  ad: { flex: 1, fontFamily: yazi.yariKalin, fontSize: 16, color: renk.yazi },
  zaman: { fontFamily: yazi.govde, fontSize: 12, color: renk.yaziSoluk },
  onizleme: { flex: 1, fontFamily: yazi.govde, fontSize: 14, color: renk.yaziOrta },
  rozet: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: renk.zumrut, alignItems: "center", justifyContent: "center" },
  rozetYazi: { fontFamily: yazi.kalin, fontSize: 12, color: "#fff" },
});
