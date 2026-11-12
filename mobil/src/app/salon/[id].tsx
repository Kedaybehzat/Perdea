import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Kart, YildizSecici } from "@/components/Kart";
import { PerdeZemin } from "@/components/Perde";
import UstCubuk from "@/components/UstCubuk";
import { Alan, Avatar, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { supabase } from "@/lib/supabase";
import { goreceli } from "@/lib/zaman";
import { bosluk, kose, renk, yazi } from "@/tema";

const OLCUTLER = [
  ["goruntu", "Perde & görüntü"],
  ["ses", "Ses"],
  ["koltuk", "Koltuk konforu"],
  ["temizlik", "Temizlik"],
  ["fiyat", "Fiyat / performans"],
] as const;
type Olcut = (typeof OLCUTLER)[number][0];
type Puanlar = Record<Olcut, number>;
type Salon = { id: string; ad: string; sehir: string; ilce: string | null; puan_sayisi: number; genel: number | null } & Record<Olcut, number | null>;
type Yorum = Puanlar & { user_id: string; yorum: string | null; updated_at: string; yazar?: { username: string | null; avatar_url: string | null } };

const bos: Puanlar = { goruntu: 0, ses: 0, koltuk: 0, temizlik: 0, fiyat: 0 };

export default function SalonDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [salon, setSalon] = useState<Salon | null | undefined>(undefined);
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [puanlar, setPuanlar] = useState<Puanlar>(bos);
  const [yorum, setYorum] = useState("");
  const [puanim, setPuanim] = useState(false);
  const [hata, setHata] = useState<string>();
  const [tamam, setTamam] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data: s } = await supabase.from("sinema_ozet").select("*").eq("id", id).maybeSingle();
    setSalon((s as Salon | null) ?? null);
    const { data: p } = await supabase.from("sinema_puanlari").select("*").eq("sinema_id", id).order("updated_at", { ascending: false }).limit(50);
    const satirlar = (p ?? []) as Yorum[];
    const idler = [...new Set(satirlar.map((x) => x.user_id))];
    const { data: u } = idler.length ? await supabase.from("users").select("id, username, avatar_url").in("id", idler) : { data: [] };
    const harita = new Map((u ?? []).map((x) => [x.id as string, x]));
    setYorumlar(satirlar.map((x) => ({ ...x, yazar: harita.get(x.user_id) as Yorum["yazar"] })));
    const benimki = satirlar.find((x) => x.user_id === benId);
    if (benimki) {
      setPuanim(true);
      setPuanlar({ goruntu: benimki.goruntu, ses: benimki.ses, koltuk: benimki.koltuk, temizlik: benimki.temizlik, fiyat: benimki.fiyat });
      setYorum(benimki.yorum ?? "");
    }
  }, [id, benId]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  async function kaydet() {
    if (!benId) return;
    const eksik = OLCUTLER.find(([k]) => puanlar[k] < 1);
    if (eksik) return setHata(`“${eksik[1]}” için puan ver.`);
    setBekliyor(true);
    setHata(undefined);
    setTamam(undefined);
    const { error } = await supabase
      .from("sinema_puanlari")
      .upsert({ sinema_id: id, user_id: benId, ...puanlar, yorum: yorum.trim() || null, updated_at: new Date().toISOString() }, { onConflict: "sinema_id,user_id" });
    setBekliyor(false);
    if (error) return setHata(hataMesaji(error));
    setTamam("Puanın kaydedildi.");
    await yukle();
  }

  if (salon === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Salon" />
        <Yukleniyor />
      </View>
    );
  }
  if (salon === null) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Salon" />
        <View style={{ padding: bosluk.xl }}>
          <HataKutusu mesaj="Bu salon bulunamadı." />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket={`${salon.ilce ? `${salon.ilce}, ` : ""}${salon.sehir}`} baslik={salon.ad} />
      <ScrollView contentContainerStyle={{ padding: bosluk.l, gap: bosluk.l }} keyboardShouldPersistTaps="handled">
        <PerdeZemin style={{ borderRadius: kose.xl, padding: bosluk.xl, gap: bosluk.m }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ fontFamily: yazi.baslik, fontSize: 52, lineHeight: 56, color: "#fff" }}>{salon.genel ? salon.genel.toFixed(1) : "—"}</Text>
            <Text style={{ fontFamily: yazi.orta, fontSize: 14, color: "rgba(236,253,245,0.8)" }}>/ 5 · {salon.puan_sayisi} oy</Text>
          </View>
          {OLCUTLER.map(([k, etiket]) => {
            const v = salon[k];
            return (
              <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }} accessible accessibilityLabel={`${etiket}: ${v ? v.toFixed(1) : "puan yok"}`}>
                <Text style={{ width: 130, fontFamily: yazi.orta, fontSize: 13, color: "rgba(236,253,245,0.9)" }}>{etiket}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.15)" }}>
                  <View style={{ width: `${((v ?? 0) / 5) * 100}%`, height: 6, borderRadius: 3, backgroundColor: renk.altin }} />
                </View>
                <Text style={{ width: 28, textAlign: "right", fontFamily: yazi.kalin, fontSize: 13, color: "#fff" }}>{v ? v.toFixed(1) : "—"}</Text>
              </View>
            );
          })}
        </PerdeZemin>

        <Kart style={{ gap: bosluk.m }}>
          <Metin tur="altBaslik">{puanim ? "Puanını güncelle" : "Sen de puanla"}</Metin>
          {OLCUTLER.map(([k, etiket]) => (
            <YildizSecici key={k} etiket={etiket} deger={puanlar[k]} degistir={(n) => setPuanlar((p) => ({ ...p, [k]: n }))} />
          ))}
          <Alan
            etiket="Yorum (isteğe bağlı)"
            value={yorum}
            onChangeText={setYorum}
            multiline
            maxLength={600}
            placeholder="Hangi salon, hangi sıra? Bilmekte fayda olan ne var?"
            style={{ minHeight: 84, textAlignVertical: "top" }}
          />
          <HataKutusu mesaj={hata} />
          {tamam ? (
            <Text accessibilityRole="alert" style={{ fontFamily: yazi.orta, fontSize: 14, color: renk.zumrutKoyu }}>
              {tamam}
            </Text>
          ) : null}
          <Dugme onPress={kaydet} bekliyor={bekliyor}>
            {puanim ? "Puanımı güncelle" : "Puanımı kaydet"}
          </Dugme>
        </Kart>

        {yorumlar.filter((y) => y.yorum).length ? <Metin tur="altBaslik">Yorumlar</Metin> : null}
        {yorumlar
          .filter((y) => y.yorum)
          .map((y) => {
            const ad = y.yazar?.username ?? "üye";
            const ort = (y.goruntu + y.ses + y.koltuk + y.temizlik + y.fiyat) / 5;
            return (
              <Kart key={y.user_id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.s, marginBottom: 6 }}>
                  <Avatar ad={ad} url={y.yazar?.avatar_url} boyut={30} />
                  <Text style={{ flex: 1, fontFamily: yazi.yariKalin, fontSize: 14, color: renk.yazi }}>{ad}</Text>
                  <Text style={{ fontFamily: yazi.kalin, fontSize: 14, color: renk.altinKoyu }}>★ {ort.toFixed(1)}</Text>
                </View>
                <Text style={{ fontFamily: yazi.govde, fontSize: 15, lineHeight: 22, color: renk.yazi }}>{y.yorum}</Text>
                <Metin tur="kucuk" style={{ marginTop: 4 }}>
                  {goreceli(y.updated_at)}
                </Metin>
              </Kart>
            );
          })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
