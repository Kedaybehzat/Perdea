import { useLocalSearchParams } from "expo-router";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Kart } from "@/components/Kart";
import UstCubuk from "@/components/UstCubuk";
import { Alan, Avatar, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { supabase } from "@/lib/supabase";
import { bosluk, renk, yazi } from "@/tema";
import { tamTarih, type Bulusma } from "./index";

type Katilimci = { user_id: string; karakter: string | null; username?: string | null; avatar_url?: string | null };

export default function BulusmaDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [b, setB] = useState<Bulusma | null | undefined>(undefined);
  const [katilimcilar, setKatilimcilar] = useState<Katilimci[]>([]);
  const [karakter, setKarakter] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data } = await supabase.from("bulusma_ozet").select("*").eq("id", id).maybeSingle();
    setB((data as Bulusma | null) ?? null);
    const { data: k } = await supabase.from("bulusma_katilimcilari").select("user_id, karakter, created_at").eq("bulusma_id", id).order("created_at", { ascending: true });
    const satirlar = (k ?? []) as Katilimci[];
    const idler = satirlar.map((x) => x.user_id);
    const { data: u } = idler.length ? await supabase.from("users").select("id, username, avatar_url").in("id", idler) : { data: [] };
    const harita = new Map((u ?? []).map((x) => [x.id as string, x]));
    setKatilimcilar(satirlar.map((x) => ({ ...x, username: harita.get(x.user_id)?.username, avatar_url: harita.get(x.user_id)?.avatar_url })));
  }, [id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  async function calistir(is: () => PromiseLike<{ error: { message?: string; code?: string } | null }>) {
    setBekliyor(true);
    setHata(undefined);
    const { error } = await is();
    setBekliyor(false);
    if (error) setHata(hataMesaji(error));
    await yukle();
  }

  if (b === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Buluşma" />
        <Yukleniyor />
      </View>
    );
  }
  if (b === null) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Buluşma" />
        <View style={{ padding: bosluk.xl }}>
          <HataKutusu mesaj="Bu buluşma bulunamadı." />
        </View>
      </View>
    );
  }

  const katildim = katilimcilar.some((k) => k.user_id === benId);
  const duzenleyen = b.duzenleyen_id === benId;
  const dolu = b.kontenjan != null && b.katilimci_sayisi >= b.kontenjan;
  const gecti = new Date(b.zaman).getTime() < Date.now();
  const kapali = b.durum === "iptal" || gecti;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket={b.tema ?? "Cosplay buluşması"} baslik={b.baslik} />
      <ScrollView contentContainerStyle={{ padding: bosluk.l, gap: bosluk.l }} keyboardShouldPersistTaps="handled">
        <Kart style={{ gap: bosluk.m }}>
          <Metin tur="baslik" style={{ fontSize: 26, lineHeight: 30 }}>
            {b.baslik}
          </Metin>
          <Satir ikon={CalendarDays} metin={tamTarih(b.zaman)} />
          <Satir ikon={MapPin} metin={`${b.mekan}, ${b.sehir}`} />
          <Satir ikon={Users} metin={`${b.katilimci_sayisi}${b.kontenjan ? ` / ${b.kontenjan}` : ""} kişi geliyor`} />
          {b.aciklama ? <Text style={{ fontFamily: yazi.govde, fontSize: 16, lineHeight: 23, color: renk.yazi }}>{b.aciklama}</Text> : null}
        </Kart>

        <Kart style={{ gap: bosluk.m }}>
          {b.durum === "iptal" ? (
            <HataKutusu mesaj="Bu buluşma iptal edildi." />
          ) : gecti ? (
            <Metin renk={renk.yaziOrta}>Bu buluşma geçti.</Metin>
          ) : katildim ? (
            <>
              <Metin tur="altBaslik">{duzenleyen ? "Bu buluşmayı sen düzenliyorsun" : "Katılıyorsun"}</Metin>
              {duzenleyen ? (
                <Dugme
                  tur="tehlike"
                  bekliyor={bekliyor}
                  onPress={() => calistir(() => supabase.from("bulusmalar").update({ durum: "iptal" }).eq("id", b.id).eq("duzenleyen_id", benId!))}
                >
                  Buluşmayı iptal et
                </Dugme>
              ) : (
                <Dugme
                  tur="cizgi"
                  bekliyor={bekliyor}
                  onPress={() => calistir(() => supabase.from("bulusma_katilimcilari").delete().eq("bulusma_id", b.id).eq("user_id", benId!))}
                >
                  Katılmaktan vazgeç
                </Dugme>
              )}
            </>
          ) : dolu ? (
            <Metin renk={renk.altinKoyu}>Kontenjan doldu.</Metin>
          ) : (
            <>
              <Metin tur="altBaslik">Katıl</Metin>
              <Alan etiket="Kim olarak geliyorsun? (isteğe bağlı)" value={karakter} onChangeText={setKarakter} maxLength={60} placeholder="örn. Totoro" />
              <Dugme
                bekliyor={bekliyor}
                onPress={() => calistir(() => supabase.rpc("bulusmaya_katil", { p_bulusma: b.id, p_karakter: karakter.trim() || null }))}
              >
                Ben de geliyorum
              </Dugme>
            </>
          )}
          {!kapali ? <HataKutusu mesaj={hata} /> : null}
        </Kart>

        <Metin tur="altBaslik">Gelenler</Metin>
        {katilimcilar.map((k) => (
          <View key={k.user_id} style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
            <Avatar ad={k.username ?? "üye"} url={k.avatar_url} boyut={40} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: yazi.yariKalin, fontSize: 15, color: renk.yazi }}>
                {k.username ?? "üye"}
                {k.user_id === b.duzenleyen_id ? " · düzenleyen" : ""}
              </Text>
              {k.karakter ? <Metin tur="kucuk">{k.karakter} olarak geliyor</Metin> : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Satir({ ikon: Ikon, metin }: { ikon: typeof MapPin; metin: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
      <Ikon size={17} color={renk.zumrutKoyu} />
      <Text style={{ flex: 1, fontFamily: yazi.orta, fontSize: 15, color: renk.yazi }}>{metin}</Text>
    </View>
  );
}
