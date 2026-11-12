import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from "expo-audio";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Ban, Flag, ImagePlus, Mic, MoreVertical, Pause, Play, Send, Square, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BildirModal, { type BildirHedefi } from "@/components/BildirModal";
import { PerdeZemin } from "@/components/Perde";
import { Avatar, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { fotografSec, rastgeleAd, yukle as dosyaYukle } from "@/lib/medya";
import { useOturum } from "@/lib/oturum";
import { useSayilar } from "@/lib/sayac";
import { kisiAdi, mesajlariGetir, type Mesaj, type SohbetOzeti } from "@/lib/sohbet";
import { supabase } from "@/lib/supabase";
import { saat } from "@/lib/zaman";
import { bosluk, kose, renk, yazi } from "@/tema";

type Bekleyen = { anahtar: number; icerik: string; hata?: string };

const EN_UZUN_SES_SN = 120;
const sureYaz = (sn: number) => `${Math.floor(sn / 60)}:${String(Math.floor(sn % 60)).padStart(2, "0")}`;

export default function SohbetEkrani() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { oturum } = useOturum();
  const { yenile: sayilariYenile } = useSayilar();
  const benId = oturum?.user.id;
  const kenar = useSafeAreaInsets();
  const [sohbet, setSohbet] = useState<SohbetOzeti | null | undefined>(undefined);
  const [benEngelledim, setBenEngelledim] = useState(false);
  const [mesajlar, setMesajlar] = useState<Mesaj[] | null>(null);
  const [bekleyenler, setBekleyenler] = useState<Bekleyen[]>([]);
  const [metin, setMetin] = useState("");
  const [hata, setHata] = useState<string>();
  const [yukleniyor, setYukleniyor] = useState<string>();
  const [menu, setMenu] = useState(false);
  const [bildir, setBildir] = useState<BildirHedefi>(null);
  const [kayitSn, setKayitSn] = useState<number | null>(null);
  const kayitIptal = useRef(false);
  const kayitBaslangic = useRef(0);
  const sayac = useRef(0);
  const kaydedici = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const yukle = useCallback(async () => {
    if (!id) return;
    const [liste, yeni] = await Promise.all([supabase.rpc("sohbetlerim"), mesajlariGetir(id)]);
    const bu = ((liste.data ?? []) as SohbetOzeti[]).find((x) => x.id === id) ?? null;
    setSohbet(bu);
    setMesajlar(yeni);
    if (bu?.engelli) {
      const { data } = await supabase.from("engeller").select("engellenen_id").eq("engellenen_id", bu.diger.id).maybeSingle();
      setBenEngelledim(Boolean(data));
    } else {
      setBenEngelledim(false);
    }
    await supabase.rpc("sohbet_okundu", { p_sohbet: id });
    void sayilariYenile();
  }, [id, sayilariYenile]);

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

  async function medyaGonder(tur: "gorsel" | "ses", uri: string, uzanti: string, tip: string, sureSn?: number) {
    if (!id || !benId) return;
    setHata(undefined);
    setYukleniyor(tur === "gorsel" ? "Fotoğraf gönderiliyor…" : "Sesli mesaj gönderiliyor…");
    try {
      const yol = `${id}/${benId}/${rastgeleAd()}.${uzanti}`;
      const y = await dosyaYukle("sohbet-medya", yol, uri, tip);
      if (y.hata) return setHata(y.hata);
      const { error } = await supabase.rpc("medya_mesaji_gonder", {
        p_sohbet: id,
        p_tur: tur,
        p_yol: yol,
        p_sure: sureSn ?? null,
      });
      if (error) return setHata(hataMesaji(error));
      await yukle();
    } finally {
      setYukleniyor(undefined);
    }
  }

  async function fotografGonder() {
    const secim = await fotografSec({ kenar: 1600 });
    if (secim === "izin-yok") return setHata("Fotoğraflarına erişim izni verilmedi. Ayarlar'dan izin verebilirsin.");
    if (!secim) return;
    await medyaGonder("gorsel", secim.uri, "jpg", "image/jpeg");
  }

  async function kaydiBaslat() {
    setHata(undefined);
    const izin = await requestRecordingPermissionsAsync();
    if (!izin.granted) return setHata("Mikrofon izni verilmedi. Ayarlar'dan izin verebilirsin.");
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await kaydedici.prepareToRecordAsync();
      kaydedici.record();
      kayitIptal.current = false;
      kayitBaslangic.current = Date.now();
      setKayitSn(0);
    } catch {
      setHata("Kayıt başlatılamadı.");
    }
  }

  const kaydiBitir = useCallback(
    async (iptal: boolean) => {
      kayitIptal.current = iptal;
      const sure = Math.max(1, Math.round((Date.now() - kayitBaslangic.current) / 1000));
      setKayitSn(null);
      try {
        await kaydedici.stop();
      } catch {
        // zaten durmuş
      }
      // Kayıttan sonra ses hoparlörden çalsın (iOS kayıt modunda kulaklığa verir).
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      const uri = kaydedici.uri;
      if (iptal || !uri) return;
      const web = Platform.OS === "web";
      await medyaGonder("ses", uri, web ? "webm" : "m4a", web ? "audio/webm" : "audio/mp4", Math.min(sure, EN_UZUN_SES_SN));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kaydedici, id, benId]
  );

  // Kayıt sayacı; süre dolunca kendiliğinden gönderir.
  useEffect(() => {
    if (kayitSn === null) return;
    if (kayitSn >= EN_UZUN_SES_SN) {
      void kaydiBitir(false);
      return;
    }
    const z = setTimeout(() => setKayitSn((s) => (s === null ? null : s + 1)), 1000);
    return () => clearTimeout(z);
  }, [kayitSn, kaydiBitir]);

  async function engelDegistir() {
    if (!sohbet || !benId) return;
    setMenu(false);
    const { error } = benEngelledim
      ? await supabase.from("engeller").delete().eq("engelleyen_id", benId).eq("engellenen_id", sohbet.diger.id)
      : await supabase
          .from("engeller")
          .upsert({ engelleyen_id: benId, engellenen_id: sohbet.diger.id }, { onConflict: "engelleyen_id,engellenen_id", ignoreDuplicates: true });
    if (error) setHata(hataMesaji(error));
    await yukle();
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
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/sohbet"))}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Sohbetlere dön"
            style={{ padding: 6 }}
          >
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
          {sohbet ? (
            <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Sohbet seçenekleri" style={{ padding: 6 }}>
              <MoreVertical size={22} color="#fff" />
            </Pressable>
          ) : null}
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
                  <View style={{ alignItems: "flex-end" }}>
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
                <View style={{ alignItems: benden ? "flex-end" : "flex-start" }}>
                  {m.tur === "gorsel" && m.medya_url ? (
                    <Image source={{ uri: m.medya_url }} style={s.gorsel} contentFit="cover" transition={150} accessibilityLabel="Gönderilen fotoğraf" />
                  ) : m.tur === "ses" && m.medya_url ? (
                    <SesBalonu url={m.medya_url} sure={m.sure_sn} benden={benden} />
                  ) : (
                    <View style={[s.balon, benden ? s.benden : s.ondan]}>
                      <Text style={[s.yazi, { color: benden ? "#fff" : renk.yazi }]}>
                        {m.tur === "gorsel" ? "Fotoğraf yüklenemedi" : m.tur === "ses" ? "Sesli mesaj yüklenemedi" : m.icerik}
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
            {yukleniyor ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }} accessibilityRole="progressbar">
                <ActivityIndicator color={renk.zumrut} size="small" />
                <Metin tur="kucuk">{yukleniyor}</Metin>
              </View>
            ) : null}
            {sohbet.engelli ? (
              <Metin tur="kucuk" style={{ textAlign: "center", paddingVertical: 8 }}>
                {benEngelledim ? "Bu kişiyi engelledin. Menüden kaldırabilirsin." : "Bu sohbette mesajlaşma kapalı."}
              </Metin>
            ) : kayitSn !== null ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.s }}>
                <Pressable onPress={() => kaydiBitir(true)} accessibilityRole="button" accessibilityLabel="Kaydı iptal et" style={s.ikonDugme}>
                  <Trash2 size={20} color={renk.yaziOrta} />
                </Pressable>
                <View style={s.kayit} accessibilityLiveRegion="polite">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: renk.gul }} />
                  <Text style={{ flex: 1, fontFamily: yazi.yariKalin, color: "#9f1239" }}>Kaydediliyor</Text>
                  <Text style={{ fontFamily: yazi.yariKalin, color: "#9f1239", fontVariant: ["tabular-nums"] }}>
                    {sureYaz(kayitSn)} / {sureYaz(EN_UZUN_SES_SN)}
                  </Text>
                </View>
                <Pressable onPress={() => kaydiBitir(false)} accessibilityRole="button" accessibilityLabel="Kaydı bitir ve gönder" style={s.gonder}>
                  <Square size={16} color="#fff" fill="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: bosluk.s }}>
                <Pressable
                  onPress={fotografGonder}
                  disabled={Boolean(yukleniyor)}
                  accessibilityRole="button"
                  accessibilityLabel="Fotoğraf gönder"
                  style={s.ikonDugme}
                >
                  <ImagePlus size={22} color={renk.zumrutKoyu} />
                </Pressable>
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
                {metin.trim() ? (
                  <Pressable
                    onPress={() => {
                      void gonder(metin);
                      setMetin("");
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Gönder"
                    style={s.gonder}
                  >
                    <Send size={18} color="#fff" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={kaydiBaslat}
                    disabled={Boolean(yukleniyor)}
                    accessibilityRole="button"
                    accessibilityLabel="Sesli mesaj kaydet"
                    style={s.gonder}
                  >
                    <Mic size={18} color="#fff" />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </>
      )}

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={s.menuArka} onPress={() => setMenu(false)} accessibilityLabel="Kapat">
          <View style={[s.menu, { marginTop: kenar.top + 56 }]}>
            <Pressable onPress={engelDegistir} accessibilityRole="button" style={s.menuSatir}>
              <Ban size={18} color={renk.gul} />
              <Text style={[s.menuYazi, { color: renk.gul }]}>{benEngelledim ? "Engeli kaldır" : `${ad} adlı kişiyi engelle`}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenu(false);
                if (id) setBildir({ tur: "sohbet", id });
              }}
              accessibilityRole="button"
              style={s.menuSatir}
            >
              <Flag size={18} color={renk.yazi} />
              <Text style={s.menuYazi}>Bu sohbeti bildir</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <BildirModal hedef={bildir} kapat={() => setBildir(null)} />
    </KeyboardAvoidingView>
  );
}

function SesBalonu({ url, sure, benden }: { url: string; sure: number | null; benden: boolean }) {
  const oynatici = useAudioPlayer(url);
  const durum = useAudioPlayerStatus(oynatici);
  const toplam = durum.duration || sure || 0;
  const renkYazi = benden ? "#fff" : renk.yazi;

  useEffect(() => {
    if (durum.didJustFinish) {
      oynatici.pause();
      void oynatici.seekTo(0);
    }
  }, [durum.didJustFinish, oynatici]);

  return (
    <Pressable
      onPress={() => (durum.playing ? oynatici.pause() : oynatici.play())}
      accessibilityRole="button"
      accessibilityLabel={durum.playing ? "Sesli mesajı durdur" : "Sesli mesajı dinle"}
      style={[s.balon, benden ? s.benden : s.ondan, { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 180 }]}
    >
      {durum.playing ? <Pause size={20} color={renkYazi} fill={renkYazi} /> : <Play size={20} color={renkYazi} fill={renkYazi} />}
      <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: benden ? "rgba(255,255,255,0.35)" : renk.cizgi }}>
        <View
          style={{
            width: `${toplam ? Math.min(100, (durum.currentTime / toplam) * 100) : 0}%`,
            height: 4,
            borderRadius: 2,
            backgroundColor: benden ? "#fff" : renk.zumrut,
          }}
        />
      </View>
      <Text style={{ fontFamily: yazi.orta, fontSize: 13, color: renkYazi, fontVariant: ["tabular-nums"] }}>
        {sureYaz(durum.playing || durum.currentTime > 0 ? durum.currentTime : toplam)}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
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
  ikonDugme: { width: 46, height: 46, borderRadius: kose.m, alignItems: "center", justifyContent: "center" },
  kayit: {
    flex: 1,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: bosluk.m,
    borderRadius: kose.m,
    backgroundColor: renk.gulSoluk,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  menuArka: { flex: 1, backgroundColor: "rgba(3,39,32,0.35)", alignItems: "flex-end", paddingRight: bosluk.m },
  menu: { backgroundColor: renk.kagit, borderRadius: kose.l, paddingVertical: 6, minWidth: 250 },
  menuSatir: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: bosluk.l, paddingVertical: 14 },
  menuYazi: { fontFamily: yazi.yariKalin, fontSize: 15, color: renk.yazi },
});
