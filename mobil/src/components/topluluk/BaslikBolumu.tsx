import { router, useFocusEffect } from "expo-router";
import { Flame, MessagesSquare, Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Kart } from "@/components/Kart";
import { Alan, BosDurum, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { supabase } from "@/lib/supabase";
import { goreceli } from "@/lib/zaman";
import { bosluk, renk, yazi } from "@/tema";

type Baslik = { id: string; baslik: string; slug: string; son_entry_at: string; entry_sayisi: number; bugun: number };

export default function BaslikBolumu({ ust }: { ust: React.ReactElement }) {
  const [liste, setListe] = useState<Baslik[] | null>(null);
  const [formAcik, setFormAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [entry, setEntry] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data, error } = await supabase
      .from("baslik_ozet")
      .select("*")
      .order("bugun", { ascending: false })
      .order("son_entry_at", { ascending: false })
      .limit(50);
    if (error) setHata(hataMesaji(error));
    setListe((data ?? []) as Baslik[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void yukle();
    }, [yukle])
  );

  async function ac() {
    const ad = baslik.trim().replace(/\s+/g, " ");
    const metin = entry.trim();
    if (ad.length < 3 || ad.length > 80) return setHata("Başlık 3–80 karakter olmalı.");
    if (metin.length < 2) return setHata("İlk entry’yi de yaz; başlık tek başına açılmıyor.");
    setBekliyor(true);
    setHata(undefined);
    const { data, error } = await supabase.rpc("baslik_ac", { p_baslik: ad, p_entry: metin });
    setBekliyor(false);
    if (error || !data) return setHata(hataMesaji(error));
    setBaslik("");
    setEntry("");
    setFormAcik(false);
    router.push({ pathname: "/baslik/[slug]", params: { slug: String(data) } });
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: renk.krem }}
      data={liste ?? []}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ paddingBottom: bosluk.xxl }}
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
        <View style={{ gap: bosluk.l, marginBottom: bosluk.m }}>
          {ust}
          <View style={{ paddingHorizontal: bosluk.l, gap: bosluk.m }}>
            {formAcik ? (
              <Kart style={{ gap: bosluk.m }}>
                <Alan etiket="Başlık" value={baslik} onChangeText={setBaslik} maxLength={80} placeholder="örn. dune 2'nin son sahnesi" />
                <Alan
                  etiket="İlk entry"
                  value={entry}
                  onChangeText={setEntry}
                  multiline
                  maxLength={2000}
                  placeholder="Ne düşünüyorsun? İki satır yeter."
                  style={{ minHeight: 96, textAlignVertical: "top" }}
                />
                <HataKutusu mesaj={hata} />
                <View style={{ flexDirection: "row", gap: bosluk.m }}>
                  <Dugme tur="cizgi" onPress={() => setFormAcik(false)} style={{ flex: 1 }}>
                    Vazgeç
                  </Dugme>
                  <Dugme onPress={ac} bekliyor={bekliyor} style={{ flex: 1.4 }}>
                    Başlığı aç
                  </Dugme>
                </View>
              </Kart>
            ) : (
              <Dugme ikon={Plus} onPress={() => setFormAcik(true)}>
                Başlık aç
              </Dugme>
            )}
            {!formAcik ? <HataKutusu mesaj={hata} /> : null}
          </View>
        </View>
      }
      ListEmptyComponent={
        liste === null ? (
          <Yukleniyor />
        ) : (
          <View style={{ paddingHorizontal: bosluk.l }}>
            <BosDurum ikon={MessagesSquare} baslik="İlk başlığı sen aç" aciklama="Son izlediğin şey hakkında iki satır yaz; başlık böyle başlar." />
          </View>
        )
      }
      renderItem={({ item: b, index }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/baslik/[slug]", params: { slug: b.slug } })}
          accessibilityRole="button"
          accessibilityLabel={`${b.baslik}, ${b.entry_sayisi} entry`}
          style={({ pressed }) => [
            { flexDirection: "row", alignItems: "center", gap: bosluk.m, paddingHorizontal: bosluk.l, paddingVertical: bosluk.m },
            pressed && { backgroundColor: renk.kum },
          ]}
        >
          <Text style={{ width: 26, textAlign: "right", fontFamily: yazi.baslik, fontSize: 20, color: renk.cizgiKoyu }}>{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: yazi.yariKalin, fontSize: 16, color: renk.yazi }}>{b.baslik}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Metin tur="kucuk">son entry {goreceli(b.son_entry_at)}</Metin>
              {b.bugun > 0 ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Flame size={12} color={renk.altinKoyu} />
                  <Text style={{ fontFamily: yazi.kalin, fontSize: 12, color: renk.altinKoyu }}>bugün {b.bugun}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontFamily: yazi.baslik, fontSize: 20, color: renk.yazi }}>{b.entry_sayisi}</Text>
            <Text style={{ fontFamily: yazi.kalin, fontSize: 9, letterSpacing: 1, color: renk.yaziSoluk }}>ENTRY</Text>
          </View>
        </Pressable>
      )}
    />
  );
}
