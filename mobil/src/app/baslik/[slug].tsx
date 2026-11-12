import { useLocalSearchParams } from "expo-router";
import { Heart, Flag, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import BildirModal, { type BildirHedefi } from "@/components/BildirModal";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Kart } from "@/components/Kart";
import UstCubuk from "@/components/UstCubuk";
import { Avatar, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { supabase } from "@/lib/supabase";
import { goreceli } from "@/lib/zaman";
import { bosluk, kose, renk, yazi } from "@/tema";

type Entry = {
  id: string;
  baslik_id: string;
  user_id: string;
  icerik: string;
  created_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  baslik: string;
  begeni_sayisi: number;
};

export default function BaslikEkrani() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [bildir, setBildir] = useState<BildirHedefi>(null);
  const kenar = useSafeAreaInsets();
  const [baslik, setBaslik] = useState<{ id: string; baslik: string } | null | undefined>(undefined);
  const [entryler, setEntryler] = useState<Entry[]>([]);
  const [begendiklerim, setBegendiklerim] = useState<Set<string>>(new Set());
  const [metin, setMetin] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data: b } = await supabase.from("baslik_ozet").select("id, baslik").eq("slug", slug).maybeSingle();
    setBaslik((b as { id: string; baslik: string } | null) ?? null);
    if (!b) return;
    const { data } = await supabase
      .from("entry_ozet")
      .select("*")
      .eq("baslik_id", b.id)
      .order("created_at", { ascending: true })
      .limit(200);
    const liste = (data ?? []) as Entry[];
    setEntryler(liste);
    if (benId && liste.length) {
      const { data: g } = await supabase
        .from("entry_begeni")
        .select("entry_id")
        .eq("user_id", benId)
        .in(
          "entry_id",
          liste.map((e) => e.id),
        );
      setBegendiklerim(new Set((g ?? []).map((r) => r.entry_id as string)));
    }
  }, [slug, benId]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  async function yaz() {
    const temiz = metin.trim();
    if (!baslik || !benId) return;
    if (temiz.length < 2) return setHata("Entry çok kısa.");
    setBekliyor(true);
    setHata(undefined);
    const { error } = await supabase.from("entryler").insert({ baslik_id: baslik.id, user_id: benId, icerik: temiz });
    setBekliyor(false);
    if (error) return setHata(hataMesaji(error));
    setMetin("");
    await yukle();
  }

  async function begen(e: Entry) {
    if (!benId) return;
    const vardi = begendiklerim.has(e.id);
    const yeni = new Set(begendiklerim);
    if (vardi) yeni.delete(e.id);
    else yeni.add(e.id);
    setBegendiklerim(yeni);
    setEntryler((l) => l.map((x) => (x.id === e.id ? { ...x, begeni_sayisi: Math.max(0, x.begeni_sayisi + (vardi ? -1 : 1)) } : x)));
    const { error } = vardi
      ? await supabase.from("entry_begeni").delete().eq("entry_id", e.id).eq("user_id", benId)
      : await supabase
          .from("entry_begeni")
          .upsert({ entry_id: e.id, user_id: benId }, { onConflict: "entry_id,user_id", ignoreDuplicates: true });
    if (error) void yukle();
  }

  async function sil(e: Entry) {
    setEntryler((l) => l.filter((x) => x.id !== e.id));
    const { error } = await supabase.from("entryler").delete().eq("id", e.id);
    if (error) void yukle();
  }

  if (baslik === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Başlık" />
        <Yukleniyor />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket="Başlık" baslik={baslik?.baslik ?? "Bulunamadı"} />
      {baslik === null ? (
        <View style={{ padding: bosluk.xl }}>
          <HataKutusu mesaj="Bu başlık bulunamadı." />
        </View>
      ) : (
        <>
          <FlatList
            data={entryler}
            keyExtractor={(e) => e.id}
            contentContainerStyle={{ padding: bosluk.l, gap: bosluk.m }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View style={{ marginBottom: bosluk.s }}>
                <Metin tur="baslik" style={{ fontSize: 28, lineHeight: 32 }}>
                  {baslik.baslik}
                </Metin>
                <Metin tur="kucuk">{entryler.length} entry</Metin>
              </View>
            }
            renderItem={({ item: e }) => {
              const ad = e.username || e.display_name || "üye";
              const begenildi = begendiklerim.has(e.id);
              return (
                <Kart>
                  <Text style={{ fontFamily: yazi.govde, fontSize: 17, lineHeight: 25, color: renk.yazi }}>{e.icerik}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.s, marginTop: bosluk.m }}>
                    <Avatar ad={ad} url={e.avatar_url} boyut={28} />
                    <Text style={{ flex: 1, fontFamily: yazi.govde, fontSize: 13, color: renk.yaziOrta }} numberOfLines={1}>
                      <Text style={{ fontFamily: yazi.yariKalin, color: renk.yazi }}>{ad}</Text> · {goreceli(e.created_at)}
                    </Text>
                    <Pressable
                      onPress={() => begen(e)}
                      hitSlop={6}
                      accessibilityRole="button"
                      accessibilityLabel={begenildi ? "Beğeniyi geri al" : "Beğen"}
                      accessibilityState={{ selected: begenildi }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                        borderRadius: 18,
                        backgroundColor: begenildi ? renk.gulSoluk : "transparent",
                      }}
                    >
                      <Heart size={17} color={begenildi ? renk.gul : renk.yaziOrta} fill={begenildi ? renk.gul : "transparent"} />
                      <Text style={{ fontFamily: yazi.yariKalin, fontSize: 14, color: begenildi ? renk.gul : renk.yaziOrta }}>
                        {e.begeni_sayisi}
                      </Text>
                    </Pressable>
                    {e.user_id === benId ? (
                      <Pressable
                        onPress={() => sil(e)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Entry'yi sil"
                        style={{ padding: 6 }}
                      >
                        <Trash2 size={17} color={renk.yaziSoluk} />
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={() => setBildir({ tur: "entry", id: e.id })}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Bildir"
                        style={{ padding: 6 }}
                      >
                        <Flag size={16} color={renk.yaziSoluk} />
                      </Pressable>
                    )}
                  </View>
                </Kart>
              );
            }}
          />
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: renk.cizgi,
              backgroundColor: renk.kagit,
              padding: bosluk.m,
              paddingBottom: Math.max(kenar.bottom, bosluk.m),
              gap: 6,
            }}
          >
            <HataKutusu mesaj={hata} />
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: bosluk.s }}>
              <TextInput
                value={metin}
                onChangeText={setMetin}
                placeholder="Bu başlığa sen ne dersin?"
                placeholderTextColor={renk.yaziSoluk}
                multiline
                maxLength={2000}
                accessibilityLabel="Entry"
                style={{
                  flex: 1,
                  minHeight: 46,
                  maxHeight: 130,
                  borderWidth: 1,
                  borderColor: renk.cizgiKoyu,
                  borderRadius: kose.m,
                  paddingHorizontal: bosluk.m,
                  paddingVertical: 11,
                  fontFamily: yazi.govde,
                  fontSize: 16,
                  color: renk.yazi,
                  backgroundColor: renk.krem,
                }}
              />
              <Dugme
                onPress={yaz}
                bekliyor={bekliyor}
                devreDisi={metin.trim().length < 2}
                style={{ minHeight: 46, paddingHorizontal: bosluk.l }}
              >
                Ekle
              </Dugme>
            </View>
          </View>
        </>
      )}
      <BildirModal hedef={bildir} kapat={() => setBildir(null)} />
    </KeyboardAvoidingView>
  );
}
