import { useFocusEffect } from "expo-router";
import { Heart, Rss, Flag, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import BildirModal, { type BildirHedefi } from "@/components/BildirModal";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar, BosDurum, Dugme, HataKutusu, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { supabase } from "@/lib/supabase";
import { goreceli } from "@/lib/zaman";
import { bosluk, kose, renk, yazi } from "@/tema";

type Gonderi = {
  id: string;
  user_id: string;
  icerik: string;
  created_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  begeni_sayisi: number;
};

export default function AkisBolumu({ ust }: { ust: React.ReactElement }) {
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [bildir, setBildir] = useState<BildirHedefi>(null);
  const [gonderiler, setGonderiler] = useState<Gonderi[] | null>(null);
  const [begendiklerim, setBegendiklerim] = useState<Set<string>>(new Set());
  const [metin, setMetin] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data, error } = await supabase.from("gonderi_ozet").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) setHata(hataMesaji(error));
    const liste = (data ?? []) as Gonderi[];
    setGonderiler(liste);
    if (benId && liste.length) {
      const { data: b } = await supabase
        .from("gonderi_begeni")
        .select("gonderi_id")
        .eq("user_id", benId)
        .in(
          "gonderi_id",
          liste.map((g) => g.id),
        );
      setBegendiklerim(new Set((b ?? []).map((r) => r.gonderi_id as string)));
    }
  }, [benId]);

  useFocusEffect(
    useCallback(() => {
      void yukle();
    }, [yukle]),
  );

  async function paylas() {
    const temiz = metin.trim();
    if (!temiz || !benId) return;
    setBekliyor(true);
    setHata(undefined);
    const { error } = await supabase.from("gonderiler").insert({ user_id: benId, icerik: temiz });
    setBekliyor(false);
    if (error) return setHata(hataMesaji(error));
    setMetin("");
    await yukle();
  }

  async function begen(g: Gonderi) {
    if (!benId) return;
    const vardi = begendiklerim.has(g.id);
    const yeni = new Set(begendiklerim);
    if (vardi) yeni.delete(g.id);
    else yeni.add(g.id);
    setBegendiklerim(yeni);
    setGonderiler((l) =>
      (l ?? []).map((x) => (x.id === g.id ? { ...x, begeni_sayisi: Math.max(0, x.begeni_sayisi + (vardi ? -1 : 1)) } : x)),
    );
    const { error } = vardi
      ? await supabase.from("gonderi_begeni").delete().eq("gonderi_id", g.id).eq("user_id", benId)
      : await supabase
          .from("gonderi_begeni")
          .upsert({ gonderi_id: g.id, user_id: benId }, { onConflict: "gonderi_id,user_id", ignoreDuplicates: true });
    if (error) void yukle();
  }

  async function sil(g: Gonderi) {
    setGonderiler((l) => (l ?? []).filter((x) => x.id !== g.id));
    const { error } = await supabase.from("gonderiler").delete().eq("id", g.id);
    if (error) void yukle();
  }

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: renk.krem }}
        data={gonderiler ?? []}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ paddingBottom: bosluk.xxl, gap: bosluk.m }}
        keyboardShouldPersistTaps="handled"
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
          <View style={{ gap: bosluk.l }}>
            {ust}
            <View style={[s.kart, { marginHorizontal: bosluk.l, gap: bosluk.m }]}>
              <TextInput
                value={metin}
                onChangeText={setMetin}
                placeholder="Ne izledin, ne düşünüyorsun?"
                placeholderTextColor={renk.yaziSoluk}
                multiline
                maxLength={500}
                accessibilityLabel="Gönderin"
                style={s.girdi}
              />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: yazi.govde, fontSize: 12, color: renk.yaziSoluk }}>{metin.length}/500</Text>
                <Dugme onPress={paylas} bekliyor={bekliyor} devreDisi={!metin.trim()} style={{ minHeight: 42 }}>
                  Paylaş
                </Dugme>
              </View>
              <HataKutusu mesaj={hata} />
            </View>
          </View>
        }
        ListEmptyComponent={
          gonderiler === null ? (
            <Yukleniyor />
          ) : (
            <View style={{ paddingHorizontal: bosluk.l }}>
              <BosDurum ikon={Rss} baslik="Akış henüz sessiz" aciklama="İlk notu sen düş: bu hafta ne izledin?" />
            </View>
          )
        }
        renderItem={({ item: g }) => {
          const ad = g.display_name || g.username || "Perdea üyesi";
          const begenildi = begendiklerim.has(g.id);
          return (
            <View style={[s.kart, { marginHorizontal: bosluk.l }]}>
              <View style={{ flexDirection: "row", gap: bosluk.m }}>
                <Avatar ad={ad} url={g.avatar_url} boyut={42} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: yazi.govde, fontSize: 13, color: renk.yaziOrta }}>
                    <Text style={{ fontFamily: yazi.yariKalin, color: renk.yazi }}>{ad}</Text> · {goreceli(g.created_at)}
                  </Text>
                  <Text style={{ fontFamily: yazi.govde, fontSize: 17, lineHeight: 25, color: renk.yazi, marginTop: 4 }}>{g.icerik}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.s, marginTop: bosluk.s, marginLeft: -8 }}>
                    <Pressable
                      onPress={() => begen(g)}
                      hitSlop={6}
                      accessibilityRole="button"
                      accessibilityLabel={begenildi ? "Beğeniyi geri al" : "Beğen"}
                      accessibilityState={{ selected: begenildi }}
                      style={[s.begen, begenildi && { backgroundColor: renk.gulSoluk }]}
                    >
                      <Heart size={17} color={begenildi ? renk.gul : renk.yaziOrta} fill={begenildi ? renk.gul : "transparent"} />
                      <Text style={{ fontFamily: yazi.yariKalin, fontSize: 14, color: begenildi ? renk.gul : renk.yaziOrta }}>
                        {g.begeni_sayisi}
                      </Text>
                    </Pressable>
                    {g.user_id === benId ? (
                      <Pressable
                        onPress={() => sil(g)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Gönderiyi sil"
                        style={{ padding: 8 }}
                      >
                        <Trash2 size={17} color={renk.yaziSoluk} />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => setBildir({ tur: "gonderi", id: g.id })}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Bildir"
                        style={{ padding: 8 }}
                      >
                        <Flag size={16} color={renk.yaziSoluk} />
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
      <BildirModal hedef={bildir} kapat={() => setBildir(null)} />
    </>
  );
}

const s = StyleSheet.create({
  kart: { backgroundColor: renk.kagit, borderRadius: kose.l, borderWidth: 1, borderColor: renk.cizgi, padding: bosluk.l },
  girdi: { minHeight: 72, fontFamily: yazi.govde, fontSize: 16, lineHeight: 22, color: renk.yazi, textAlignVertical: "top" },
  begen: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18 },
});
