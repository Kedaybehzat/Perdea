import { router, useFocusEffect } from "expo-router";
import { VenetianMask } from "lucide-react-native";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { Kart } from "@/components/Kart";
import UstCubuk from "@/components/UstCubuk";
import { Alan, Dugme, HataKutusu, Metin } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import type { OdaSatiri } from "@/lib/oyun";
import { supabase } from "@/lib/supabase";
import { bosluk, renk, yazi } from "@/tema";

const ASAMA: Record<string, string> = { lobi: "Lobide", karakter: "Karakterler yazılıyor", oyun: "Oyun sürüyor", bitti: "Tur bitti" };

export default function OyunLobisi() {
  const [kod, setKod] = useState("");
  const [ad, setAd] = useState("");
  const [tema, setTema] = useState("");
  const [acik, setAcik] = useState(true);
  const [odalarim, setOdalarim] = useState<OdaSatiri[]>([]);
  const [acikOdalar, setAcikOdalar] = useState<OdaSatiri[]>([]);
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState<"kur" | "katil" | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [benim, aciklar] = await Promise.all([supabase.rpc("odalarim"), supabase.rpc("acik_odalar")]);
        if (benim.error) setHata(hataMesaji(benim.error));
        setOdalarim((benim.data ?? []) as OdaSatiri[]);
        setAcikOdalar((aciklar.data ?? []) as OdaSatiri[]);
      })();
    }, [])
  );

  const git = (k: string) => router.push({ pathname: "/oyun/[kod]", params: { kod: k } });

  async function katil(k: string) {
    const temiz = k.trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(temiz)) return setHata("Oda kodu 5 karakter olmalı.");
    setBekliyor("katil");
    setHata(undefined);
    const { data, error } = await supabase.rpc("odaya_katil", { p_kod: temiz });
    setBekliyor(null);
    if (error) return setHata(hataMesaji(error));
    git(String(data ?? temiz));
  }

  async function kur() {
    const temizAd = ad.trim();
    if (temizAd.length < 2 || temizAd.length > 50) return setHata("Oda adı 2–50 karakter olmalı.");
    setBekliyor("kur");
    setHata(undefined);
    const { data, error } = await supabase.rpc("oda_kur", { p_ad: temizAd, p_tema: tema.trim() || null, p_acik: acik, p_kapasite: 8 });
    setBekliyor(null);
    if (error || !data) return setHata(hataMesaji(error));
    git(String(data));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket="Oyun odaları" baslik="Ben Kimim?" />
      <ScrollView contentContainerStyle={{ padding: bosluk.l, gap: bosluk.l }} keyboardShouldPersistTaps="handled">
        <Metin renk={renk.yaziOrta}>
          Alnına bir karakter yazılır, herkes görür — sen hariç. Evet/hayır sorularıyla kim olduğunu bul.
        </Metin>
        <HataKutusu mesaj={hata} />

        <Kart style={{ gap: bosluk.m }}>
          <Metin tur="altBaslik">Kodla katıl</Metin>
          <View style={{ flexDirection: "row", gap: bosluk.m, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <Alan
                value={kod}
                onChangeText={(t) => setKod(t.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={5}
                placeholder="ABC12"
                accessibilityLabel="Oda kodu"
                style={{ fontFamily: yazi.kalin, letterSpacing: 4, fontSize: 20 }}
              />
            </View>
            <Dugme onPress={() => katil(kod)} bekliyor={bekliyor === "katil"}>
              Katıl
            </Dugme>
          </View>
        </Kart>

        <Kart style={{ gap: bosluk.m }}>
          <Metin tur="altBaslik">Oda kur</Metin>
          <Alan etiket="Oda adı" value={ad} onChangeText={setAd} maxLength={50} placeholder="örn. Cuma gecesi ekibi" />
          <Alan etiket="Tema (isteğe bağlı)" value={tema} onChangeText={setTema} maxLength={60} placeholder="örn. Anime karakterleri" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: yazi.orta, fontSize: 15, color: renk.yazi }}>Açık oda</Text>
              <Metin tur="kucuk">Herkes listeden görüp katılabilir. Kapalıysa yalnızca kodu bilen girer.</Metin>
            </View>
            <Switch value={acik} onValueChange={setAcik} trackColor={{ true: renk.zumrut, false: renk.cizgiKoyu }} accessibilityLabel="Açık oda" />
          </View>
          <Dugme ikon={VenetianMask} onPress={kur} bekliyor={bekliyor === "kur"}>
            Odayı kur
          </Dugme>
        </Kart>

        {odalarim.length ? <Metin tur="altBaslik">Odalarım</Metin> : null}
        {odalarim.map((o) => (
          <OdaSatir key={`b${o.kod}`} oda={o} alt={ASAMA[o.durum ?? "lobi"] ?? ""} onPress={() => git(o.kod)} />
        ))}

        {acikOdalar.length ? <Metin tur="altBaslik">Açık odalar</Metin> : null}
        {acikOdalar.map((o) => (
          <OdaSatir key={`a${o.kod}`} oda={o} alt={o.kurucu ? `${o.kurucu} kurdu` : ""} onPress={() => katil(o.kod)} />
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function OdaSatir({ oda, alt, onPress }: { oda: OdaSatiri; alt: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${oda.ad}, ${oda.oyuncu_sayisi} / ${oda.kapasite} oyuncu`}>
      <Kart style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: yazi.baslik, fontSize: 18, color: renk.yazi }}>{oda.ad}</Text>
          <Metin tur="kucuk">{[oda.tema, alt].filter(Boolean).join(" · ")}</Metin>
        </View>
        <Text style={{ fontFamily: yazi.kalin, fontSize: 14, color: renk.zumrutKoyu }}>
          {oda.oyuncu_sayisi}/{oda.kapasite}
        </Text>
      </Kart>
    </Pressable>
  );
}
