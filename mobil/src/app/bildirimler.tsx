import { useFocusEffect } from "expo-router";
import { Bell, BellRing, CalendarHeart, Heart, MessagesSquare, Sparkles } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Kart } from "@/components/Kart";
import { Avatar, BosDurum, Dugme, Metin, Yukleniyor } from "@/components/temel";
import UstCubuk from "@/components/UstCubuk";
import { pushKaydet, yolaGit, type PushDurumu } from "@/lib/push";
import { useSayilar } from "@/lib/sayac";
import { supabase } from "@/lib/supabase";
import { goreceli } from "@/lib/zaman";
import { bosluk, renk, yazi } from "@/tema";

type Tur = "eslesme" | "entry_begeni" | "gonderi_begeni" | "baslik_entry" | "bulusma_katilim";
type Bildirim = {
  id: number;
  tur: Tur;
  baglanti: string;
  ozet: string | null;
  okundu: boolean;
  created_at: string;
  aktor: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

const simgeler = { eslesme: Sparkles, entry_begeni: Heart, gonderi_begeni: Heart, baslik_entry: MessagesSquare, bulusma_katilim: CalendarHeart };

// Web'deki lib/bildirim.ts → bildirimMetni ile aynı cümleler.
function metin(b: Bildirim): string {
  const ad = b.aktor?.display_name || b.aktor?.username || "Biri";
  switch (b.tur) {
    case "eslesme":
      return `${ad} ile eşleştiniz. İlk mesajı sen yaz.`;
    case "entry_begeni":
      return `${ad} entry’ni beğendi.`;
    case "gonderi_begeni":
      return `${ad} gönderini beğendi.`;
    case "baslik_entry":
      return `${ad} açtığın başlığa yazdı.`;
    case "bulusma_katilim":
      return `${ad} buluşmana katılıyor.`;
    default:
      return "Yeni bir bildirimin var.";
  }
}

const pushNotu: Record<Exclude<PushDurumu, "acik">, string> = {
  "izin-yok": "Bildirim izni kapalı. Telefonun Ayarlar > Perdea bölümünden açabilirsin.",
  desteklenmiyor: "Bu cihazda telefon bildirimi şu an kullanılamıyor (Android'de Expo Go yerine uygulama derlemesi gerekir).",
  "proje-yok": "Telefon bildirimleri uygulama yayına hazırlanınca açılacak.",
};

export default function Bildirimler() {
  const { yenile: sayilariYenile } = useSayilar();
  const [liste, setListe] = useState<Bildirim[] | null>(null);
  const [kurulumEksik, setKurulumEksik] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [push, setPush] = useState<PushDurumu | null>(null);

  const yukle = useCallback(async () => {
    const { data, error } = await supabase.rpc("bildirimlerim", { p_limit: 60 });
    setKurulumEksik(Boolean(error));
    const yeni = (data ?? []) as Bildirim[];
    setListe(yeni);
    // Ekranda yeni olanlar vurgulu kalsın, veritabanında okundu say.
    if (yeni.some((b) => !b.okundu)) {
      await supabase.rpc("bildirimleri_okundu_say");
      void sayilariYenile();
    }
  }, [sayilariYenile]);

  useFocusEffect(
    useCallback(() => {
      void yukle();
      void pushKaydet(false).then(setPush);
    }, [yukle])
  );

  return (
    <View style={{ flex: 1, backgroundColor: renk.krem }}>
      <UstCubuk ustEtiket="Senin için" baslik="Bildirimler" />
      <FlatList
        data={liste ?? []}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={{ padding: bosluk.l, gap: bosluk.s, paddingBottom: bosluk.xxl }}
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
            {kurulumEksik ? (
              <Metin tur="kucuk">Bildirimler henüz kurulmamış (veritabanı dosyaları çalıştırılmalı).</Metin>
            ) : null}
            {push && push !== "acik" ? (
              <Kart style={{ gap: bosluk.m }}>
                <View style={{ flexDirection: "row", gap: bosluk.m, alignItems: "center" }}>
                  <BellRing size={20} color={renk.zumrutKoyu} />
                  <Metin style={{ flex: 1 }}>Telefonuna bildirim gelsin mi?</Metin>
                </View>
                {push === "izin-yok" ? (
                  <Dugme onPress={async () => setPush(await pushKaydet(true))}>Bildirimleri aç</Dugme>
                ) : null}
                <Metin tur="kucuk">{pushNotu[push]}</Metin>
              </Kart>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          liste === null ? (
            <Yukleniyor />
          ) : (
            <BosDurum ikon={Bell} baslik="Şimdilik sessiz" aciklama="Eşleşince, yazdıkların beğenilince ya da buluşmana biri katılınca burada görürsün." />
          )
        }
        renderItem={({ item: b }) => {
          const Simge = simgeler[b.tur] ?? Bell;
          const ad = b.aktor?.display_name || b.aktor?.username || "Perdea";
          return (
            <Pressable
              onPress={() => yolaGit(b.baglanti)}
              accessibilityRole="button"
              style={({ pressed }) => [s.satir, !b.okundu && s.yeni, pressed && { opacity: 0.85 }]}
            >
              <View>
                <Avatar ad={ad} url={b.aktor?.avatar_url} boyut={44} />
                <View style={s.simge}>
                  <Simge size={12} color={renk.zumrutKoyu} />
                </View>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.metin, !b.okundu && { fontFamily: yazi.yariKalin }]}>{metin(b)}</Text>
                {b.ozet ? (
                  <Text numberOfLines={1} style={s.ozet}>
                    {b.ozet}
                  </Text>
                ) : null}
                <Text style={s.zaman}>{goreceli(b.created_at)}</Text>
              </View>
              {!b.okundu ? <View style={s.nokta} accessibilityLabel="Yeni" /> : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  satir: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: bosluk.m,
    padding: bosluk.m,
    borderRadius: 16,
    backgroundColor: renk.kagit,
    borderWidth: 1,
    borderColor: renk.cizgi,
  },
  yeni: { backgroundColor: renk.zumrutSoluk, borderColor: renk.zumrutAcik },
  simge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: renk.cizgi,
    alignItems: "center",
    justifyContent: "center",
  },
  metin: { fontFamily: yazi.govde, fontSize: 15, lineHeight: 21, color: renk.yazi },
  ozet: { fontFamily: yazi.govde, fontSize: 13, color: renk.yaziOrta },
  zaman: { fontFamily: yazi.govde, fontSize: 12, color: renk.yaziSoluk },
  nokta: { width: 9, height: 9, borderRadius: 5, backgroundColor: renk.zumrut, marginTop: 6 },
});
