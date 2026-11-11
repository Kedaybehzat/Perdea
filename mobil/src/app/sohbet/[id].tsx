import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Mic, Send } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PerdeZemin } from "@/components/Perde";
import { Avatar, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { kisiAdi, mesajlariGetir, type Mesaj, type SohbetOzeti } from "@/lib/sohbet";
import { supabase } from "@/lib/supabase";
import { saat } from "@/lib/zaman";
import { bosluk, kose, renk, yazi } from "@/tema";

type Bekleyen = { anahtar: number; icerik: string; hata?: string };

export default function SohbetEkrani() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const kenar = useSafeAreaInsets();
  const [sohbet, setSohbet] = useState<SohbetOzeti | null | undefined>(undefined);
  const [mesajlar, setMesajlar] = useState<Mesaj[] | null>(null);
  const [bekleyenler, setBekleyenler] = useState<Bekleyen[]>([]);
  const [metin, setMetin] = useState("");
  const [hata, setHata] = useState<string>();
  const sayac = useRef(0);

  const yukle = useCallback(async () => {
    if (!id) return;
    const [liste, yeni] = await Promise.all([supabase.rpc("sohbetlerim"), mesajlariGetir(id)]);
    setSohbet(((liste.data ?? []) as SohbetOzeti[]).find((x) => x.id === id) ?? null);
    setMesajlar(yeni);
    void supabase.rpc("sohbet_okundu", { p_sohbet: id });
  }, [id]);

  // Canlı: yeni mesajda tazele; Realtime bağlanamazsa birkaç saniyede bir yokla.
  useEffect(() => {
    if (!id) return;
    void yukle();
    let canli = false;
    const kanal = supabase
      .channel(`sohbet:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mesajlar", filter: `sohbet_id=eq.${id}` }, () => void yukle())
      .subscribe((durum) => {
        canli = durum === "SUBSCRIBED";
      });
    const z = setInterval(() => {
      if (!canli) void yukle();
    }, 4000);
    return () => {
      clearInterval(z);
      void supabase.removeChannel(kanal);
    };
  }, [id, yukle]);

  async function gonder(icerik: string, anahtar?: number) {
    const temiz = icerik.trim();
    if (!temiz || !id) return;
    const k = anahtar ?? ++sayac.current;
    setBekleyenler((b) => [{ anahtar: k, icerik: temiz }, ...b.filter((x) => x.anahtar !== k)]);
    const { error } = await supabase.rpc("mesaj_gonder", { p_sohbet: id, p_icerik: temiz });
    if (error) {
      setBekleyenler((b) => b.map((x) => (x.anahtar === k ? { ...x, hata: hataMesaji(error) } : x)));
      return;
    }
    await yukle();
    setBekleyenler((b) => b.filter((x) => x.anahtar !== k));
  }

  if (sohbet === undefined || mesajlar === null) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <Yukleniyor />
      </View>
    );
  }

  const ad = sohbet ? kisiAdi(sohbet.diger) : "Sohbet";
  type Satir = { tur: "bekleyen"; b: Bekleyen } | { tur: "mesaj"; m: Mesaj };
  const satirlar: Satir[] = [
    ...bekleyenler.map((b) => ({ tur: "bekleyen" as const, b })),
    ...mesajlar.map((m) => ({ tur: "mesaj" as const, m })),
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <PerdeZemin style={{ paddingTop: kenar.top + 6, paddingBottom: 10, paddingHorizontal: bosluk.m }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sohbetlere dön" style={{ padding: 6 }}>
            <ArrowLeft size={22} color="#fff" />
          </Pressable>
          {sohbet ? <Avatar ad={ad} url={sohbet.diger.avatar_url} boyut={38} /> : null}
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: yazi.yariKalin, fontSize: 17, color: "#fff" }}>
              {ad}
            </Text>
            {sohbet?.diger.username ? (
              <Text style={{ fontFamily: yazi.govde, fontSize: 12, color: "rgba(236,253,245,0.75)" }}>@{sohbet.diger.username}</Text>
            ) : null}
          </View>
        </View>
      </PerdeZemin>

      {sohbet === null ? (
        <View style={{ flex: 1, padding: bosluk.xl, justifyContent: "center" }}>
          <HataKutusu mesaj="Bu sohbet bulunamadı." />
        </View>
      ) : (
        <>
          <FlatList
            inverted
            data={satirlar}
            keyExtractor={(x) => (x.tur === "mesaj" ? `m${x.m.id}` : `b${x.b.anahtar}`)}
            contentContainerStyle={{ padding: bosluk.l, gap: 6, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              // inverted listede boş bileşen ters durur; geri çevir.
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, transform: [{ scaleY: -1 }] }}>
                <Avatar ad={ad} url={sohbet.diger.avatar_url} boyut={72} />
                <Metin tur="altBaslik">Eşleştiniz.</Metin>
                <Metin renk={renk.yaziOrta} style={{ textAlign: "center", maxWidth: 260 }}>
                  İlk mesaj hep en zoru. Ortak bir favorinizle başla.
                </Metin>
              </View>
            }
            renderItem={({ item: x }) => {
              if (x.tur === "bekleyen") {
                return (
                  <View style={[s.sira, { alignItems: "flex-end" }]}>
                    <View style={[s.balon, s.benden, { opacity: x.b.hata ? 1 : 0.65 }, x.b.hata ? { backgroundColor: "#ffe4e6" } : null]}>
                      <Text style={[s.yazi, { color: x.b.hata ? "#9f1239" : "#fff" }]}>{x.b.icerik}</Text>
                    </View>
                    {x.b.hata ? (
                      <Text style={s.hata} onPress={() => gonder(x.b.icerik, x.b.anahtar)} accessibilityRole="button">
                        {x.b.hata} Yeniden dene
                      </Text>
                    ) : (
                      <Text style={s.saat}>Gönderiliyor…</Text>
                    )}
                  </View>
                );
              }
              const m = x.m;
              const benden = m.gonderen_id === benId;
              return (
                <View style={[s.sira, { alignItems: benden ? "flex-end" : "flex-start" }]}>
                  {m.tur === "gorsel" && m.medya_url ? (
                    <Image
                      source={{ uri: m.medya_url }}
                      style={s.gorsel}
                      contentFit="cover"
                      transition={150}
                      accessibilityLabel="Gönderilen fotoğraf"
                    />
                  ) : m.tur === "ses" ? (
                    <View style={[s.balon, benden ? s.benden : s.ondan, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
                      <Mic size={16} color={benden ? "#fff" : renk.zumrutKoyu} />
                      <Text style={[s.yazi, { color: benden ? "#fff" : renk.yazi }]}>Sesli mesaj (web’den dinlenebilir)</Text>
                    </View>
                  ) : (
                    <View style={[s.balon, benden ? s.benden : s.ondan]}>
                      <Text style={[s.yazi, { color: benden ? "#fff" : renk.yazi }]}>
                        {m.tur === "gorsel" ? "Fotoğraf yüklenemedi" : m.icerik}
                      </Text>
                    </View>
                  )}
                  <Text style={s.saat}>{saat(m.created_at)}</Text>
                </View>
              );
            }}
          />

          <View style={[s.yazma, { paddingBottom: Math.max(kenar.bottom, bosluk.m) }]}>
            <HataKutusu mesaj={hata} />
            {sohbet.engelli ? (
              <Metin tur="kucuk" style={{ textAlign: "center", paddingVertical: 8 }}>
                Bu sohbette mesajlaşma kapalı.
              </Metin>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: bosluk.s }}>
                <TextInput
                  value={metin}
                  onChangeText={(t) => {
                    setMetin(t);
                    setHata(undefined);
                  }}
                  placeholder="Bir mesaj yaz"
                  placeholderTextColor={renk.yaziSoluk}
                  multiline
                  maxLength={1000}
                  accessibilityLabel="Mesajın"
                  style={s.girdi}
                />
                <Pressable
                  onPress={() => {
                    void gonder(metin);
                    setMetin("");
                  }}
                  disabled={!metin.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Gönder"
                  style={[s.gonder, !metin.trim() && { opacity: 0.5 }]}
                >
                  <Send size={18} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  sira: { maxWidth: "100%" },
  balon: { maxWidth: "82%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  benden: { backgroundColor: renk.zumrut, borderBottomRightRadius: 6 },
  ondan: { backgroundColor: renk.kagit, borderWidth: 1, borderColor: renk.cizgi, borderBottomLeftRadius: 6 },
  yazi: { fontFamily: yazi.govde, fontSize: 16, lineHeight: 22 },
  saat: { fontFamily: yazi.govde, fontSize: 11, color: renk.yaziSoluk, marginTop: 2, marginHorizontal: 4 },
  hata: { fontFamily: yazi.orta, fontSize: 12, color: "#be123c", marginTop: 2 },
  gorsel: { width: 230, height: 230, borderRadius: 18, backgroundColor: renk.kum },
  yazma: { borderTopWidth: 1, borderTopColor: renk.cizgi, backgroundColor: renk.kagit, paddingHorizontal: bosluk.m, paddingTop: bosluk.s, gap: 6 },
  girdi: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: renk.cizgiKoyu,
    borderRadius: kose.m,
    paddingHorizontal: bosluk.m,
    paddingVertical: 11,
    fontFamily: yazi.govde,
    fontSize: 16,
    color: renk.yazi,
    backgroundColor: renk.krem,
  },
  gonder: { width: 46, height: 46, borderRadius: kose.m, backgroundColor: renk.zumrut, alignItems: "center", justifyContent: "center" },
});
