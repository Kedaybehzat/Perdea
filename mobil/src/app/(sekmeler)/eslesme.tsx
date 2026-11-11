import { router, useFocusEffect } from "expo-router";
import { Heart, Sparkles, Star, Users, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import Afis from "@/components/Afis";
import PerdeBaslik, { PerdeZemin } from "@/components/Perde";
import { Avatar, BosDurum, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { adaylariGetir, kararVer, type Aday } from "@/lib/eslesme";
import { useOturum } from "@/lib/oturum";
import { posterUrl, yapimlar, type Yapim } from "@/lib/tmdb";
import { bosluk, golge, kose, renk, yazi } from "@/tema";

export default function Eslesme() {
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [adaylar, setAdaylar] = useState<Aday[] | null>(null);
  const [favoriSayim, setFavoriSayim] = useState(0);
  const [afisler, setAfisler] = useState<Map<number, Yapim>>(new Map());
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string>();
  const [eslesen, setEslesen] = useState<Aday | null>(null);

  const yukle = useCallback(async () => {
    if (!benId) return;
    const sonuc = await adaylariGetir(benId);
    setFavoriSayim(sonuc.favoriSayim);
    setAdaylar(sonuc.adaylar);
    setAfisler(await yapimlar(sonuc.adaylar.flatMap((a) => a.favoriIlk4)));
  }, [benId]);

  useFocusEffect(
    useCallback(() => {
      void yukle();
    }, [yukle])
  );

  async function karar(aday: Aday, k: "begen" | "gec") {
    if (!benId || bekliyor) return;
    setBekliyor(true);
    setHata(undefined);
    const sonuc = await kararVer(benId, aday.userId, k);
    setBekliyor(false);
    if (sonuc.hata) {
      setHata("Kararın kaydedilemedi. Yeniden dener misin?");
      return;
    }
    setAdaylar((a) => (a ?? []).filter((x) => x.userId !== aday.userId));
    if (sonuc.eslesti) setEslesen(aday);
  }

  const aday = adaylar?.[0];
  const ad = aday ? aday.displayName || aday.username || "Perdea üyesi" : "";

  return (
    <View style={{ flex: 1, backgroundColor: renk.krem }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bosluk.xxl }}>
        <PerdeBaslik ustEtiket="Eşleş" baslik="Aynı sahnede" vurgu="duygulananlar" />
        <View style={{ padding: bosluk.l, gap: bosluk.l }}>
          {adaylar === null ? (
            <Yukleniyor />
          ) : !aday ? (
            favoriSayim === 0 ? (
              <BosDurum
                ikon={Heart}
                baslik="Önce birkaç favori seç"
                aciklama="Eşleşmeler favorilerinden çıkıyor. Keşfet’te sevdiğin 3–5 yapımı kalple işaretle."
              >
                <Dugme onPress={() => router.navigate("/")}>Keşfet’e git</Dugme>
              </BosDurum>
            ) : (
              <BosDurum
                ikon={Users}
                baslik="Şimdilik bu kadar"
                aciklama="Favorilerinle örtüşen yeni biri çıkınca burada görürsün. Favori ekledikçe ihtimal artar."
              />
            )
          ) : (
            <View style={[s.kart, golge]}>
              <View style={{ padding: bosluk.xl, gap: bosluk.l }}>
                <View style={{ flexDirection: "row", gap: bosluk.l, alignItems: "center" }}>
                  <Avatar ad={ad} url={aday.avatarUrl} boyut={72} />
                  <View style={{ flex: 1 }}>
                    <Metin tur="baslik" style={{ fontSize: 28, lineHeight: 32 }} numberOfLines={2}>
                      {ad}
                    </Metin>
                    {aday.username ? <Metin tur="kucuk">@{aday.username}</Metin> : null}
                  </View>
                </View>
                {aday.bio ? <Metin renk={renk.yaziOrta}>{aday.bio}</Metin> : null}

                <View>
                  <Metin tur="etiket" renk={renk.yaziOrta} style={{ marginBottom: bosluk.s }}>
                    Favori vitrini
                  </Metin>
                  <View style={{ flexDirection: "row", gap: bosluk.s }}>
                    {aday.favoriIlk4.map((id) => {
                      const y = afisler.get(id);
                      return (
                        <Afis key={id} url={y ? posterUrl(y.posterYolu) : null} baslik={y?.baslik ?? "Yapım"} style={{ flex: 1 }} />
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - aday.favoriIlk4.length) }, (_, i) => (
                      <View key={`b${i}`} style={{ flex: 1 }} />
                    ))}
                  </View>
                </View>
              </View>

              <PerdeZemin style={{ padding: bosluk.xl, gap: bosluk.m }}>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                  <Text style={s.yuzde}>%{aday.uyumYuzdesi}</Text>
                  <Text style={s.uyum}>UYUM</Text>
                </View>
                <Satir ikon={Heart} metin={`${aday.ortakSayisi} ortak favoriniz var.`} />
                {aday.puanYakinligi != null ? (
                  <Satir ikon={Star} metin={`Ortak izlediklerinize verdiğiniz puanlar %${aday.puanYakinligi} yakın.`} />
                ) : null}
              </PerdeZemin>

              <View style={{ padding: bosluk.l, gap: bosluk.m }}>
                <HataKutusu mesaj={hata} />
                <View style={{ flexDirection: "row", gap: bosluk.m }}>
                  <Dugme tur="cizgi" ikon={X} onPress={() => karar(aday, "gec")} devreDisi={bekliyor} style={{ flex: 1 }}>
                    Geç
                  </Dugme>
                  <Dugme ikon={Heart} onPress={() => karar(aday, "begen")} bekliyor={bekliyor} style={{ flex: 1.4 }}>
                    Beğen
                  </Dugme>
                </View>
              </View>
            </View>
          )}

          {adaylar && adaylar.length > 1 ? (
            <Metin tur="kucuk" style={{ textAlign: "center" }}>
              Sırada {adaylar.length - 1} kişi daha var.
            </Metin>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={eslesen !== null} transparent animationType="fade" onRequestClose={() => setEslesen(null)}>
        <View style={s.kutlamaArka}>
          <View style={s.kutlama} accessibilityViewIsModal>
            <View style={s.kutlamaIkon}>
              <Sparkles size={28} color={renk.altinKoyu} />
            </View>
            <Metin tur="baslik" style={{ textAlign: "center" }}>
              Eşleştiniz!
            </Metin>
            <Metin renk={renk.yaziOrta} style={{ textAlign: "center" }}>
              {eslesen ? eslesen.displayName || eslesen.username : ""} de seni beğendi. İlk mesajı ortak bir favoriden aç.
            </Metin>
            <Dugme
              onPress={() => {
                setEslesen(null);
                router.navigate("/sohbet");
              }}
              style={{ alignSelf: "stretch" }}
            >
              Sohbete git
            </Dugme>
            <Dugme tur="cizgi" onPress={() => setEslesen(null)} style={{ alignSelf: "stretch" }}>
              Devam et
            </Dugme>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Satir({ ikon: Ikon, metin }: { ikon: typeof Heart; metin: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <Ikon size={16} color={renk.nane} style={{ marginTop: 3 }} />
      <Text style={{ flex: 1, fontFamily: yazi.govde, fontSize: 15, lineHeight: 21, color: "rgba(236,253,245,0.92)" }}>
        {metin}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  kart: {
    backgroundColor: renk.kagit,
    borderRadius: kose.xl,
    borderWidth: 1,
    borderColor: renk.cizgi,
    overflow: "hidden",
  },
  yuzde: { fontFamily: yazi.baslik, fontSize: 46, lineHeight: 50, color: "#fff" },
  uyum: { fontFamily: yazi.kalin, fontSize: 12, letterSpacing: 2.4, color: renk.altin },
  kutlamaArka: { flex: 1, backgroundColor: "rgba(3,39,32,0.75)", alignItems: "center", justifyContent: "center", padding: bosluk.xl },
  kutlama: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: renk.kagit,
    borderRadius: kose.xl,
    padding: bosluk.xl,
    alignItems: "center",
    gap: bosluk.m,
  },
  kutlamaIkon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
});
