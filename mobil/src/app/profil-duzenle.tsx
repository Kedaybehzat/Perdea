import { Camera } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Kart } from "@/components/Kart";
import { Alan, Avatar, Dugme, HataKutusu, Metin } from "@/components/temel";
import UstCubuk from "@/components/UstCubuk";
import { fotografSec, rastgeleAd, yukle } from "@/lib/medya";
import { useOturum } from "@/lib/oturum";
import { pushSil } from "@/lib/push";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { bosluk, renk, yazi } from "@/tema";

const SITE = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default function ProfilDuzenle() {
  const { oturum, profil, profiliYenile } = useOturum();
  const benId = oturum?.user.id;
  const kenar = useSafeAreaInsets();
  const [ad, setAd] = useState(profil?.display_name ?? "");
  const [bio, setBio] = useState(profil?.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(profil?.avatar_url ?? null);
  const [hata, setHata] = useState<string>();
  const [tamam, setTamam] = useState(false);
  const [bekliyor, setBekliyor] = useState(false);
  const [fotoBekliyor, setFotoBekliyor] = useState(false);
  const [silOnay, setSilOnay] = useState("");
  const [siliniyor, setSiliniyor] = useState(false);
  const [silHata, setSilHata] = useState<string>();

  useEffect(() => {
    setAd(profil?.display_name ?? "");
    setBio(profil?.bio ?? "");
    setAvatar(profil?.avatar_url ?? null);
  }, [profil]);

  async function fotografDegistir() {
    if (!benId) return;
    setHata(undefined);
    const secim = await fotografSec({ kenar: 512, kare: true });
    if (secim === "izin-yok") return setHata("Fotoğraflarına erişim izni verilmedi.");
    if (!secim) return;
    setFotoBekliyor(true);
    const yol = `${benId}/${rastgeleAd()}.jpg`;
    const y = await yukle("avatarlar", yol, secim.uri, "image/jpeg");
    setFotoBekliyor(false);
    if (y.hata) return setHata(y.hata);
    setAvatar(supabase.storage.from("avatarlar").getPublicUrl(yol).data.publicUrl);
    setTamam(false);
  }

  // Web'deki app/profil/actions.ts ile aynı sınırlar.
  async function kaydet() {
    if (!benId) return;
    setHata(undefined);
    setTamam(false);
    setBekliyor(true);
    const { error } = await supabase
      .from("users")
      .update({
        display_name: ad.trim().slice(0, 50) || null,
        bio: bio.trim().slice(0, 240) || null,
        avatar_url: avatar,
      })
      .eq("id", benId);
    setBekliyor(false);
    if (error) return setHata("Kaydedilemedi. Biraz sonra yeniden dene.");
    await profiliYenile();
    setTamam(true);
  }

  async function hesabiSil() {
    setSilHata(undefined);
    if (silOnay.trim().toLocaleUpperCase("tr-TR") !== "SİL") return setSilHata("Onaylamak için kutuya SİL yaz.");
    setSiliniyor(true);
    await pushSil();
    const { error } = await supabase.rpc("hesabimi_sil");
    if (error) {
      setSiliniyor(false);
      return setSilHata("Hesap silinemedi. Biraz sonra yeniden dene ya da bize yaz.");
    }
    await supabase.auth.signOut();
    router.replace("/");
  }

  const gorunenAd = ad.trim() || profil?.username || "Perdea üyesi";

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket="Profil" baslik="Profili düzenle" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: bosluk.l, gap: bosluk.l, paddingBottom: kenar.bottom + bosluk.xxl }}>
        <View style={{ alignItems: "center", gap: bosluk.s }}>
          <Pressable onPress={fotografDegistir} disabled={fotoBekliyor} accessibilityRole="button" accessibilityLabel="Profil fotoğrafını değiştir">
            <Avatar ad={gorunenAd} url={avatar} boyut={104} />
            <View
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: renk.zumrut,
                borderWidth: 3,
                borderColor: renk.krem,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={16} color="#fff" />
            </View>
          </Pressable>
          <Text style={{ fontFamily: yazi.orta, fontSize: 14, color: renk.zumrutKoyu }}>
            {fotoBekliyor ? "Yükleniyor…" : "Fotoğrafı değiştir"}
          </Text>
          {avatar ? (
            <Text onPress={() => setAvatar(null)} accessibilityRole="button" style={{ fontFamily: yazi.govde, fontSize: 13, color: renk.yaziSoluk }}>
              Fotoğrafı kaldır
            </Text>
          ) : null}
        </View>

        <Alan etiket="Görünen ad" value={ad} onChangeText={setAd} maxLength={50} placeholder={profil?.username ?? ""} />
        <Alan
          etiket="Hakkında"
          value={bio}
          onChangeText={setBio}
          maxLength={240}
          multiline
          placeholder="İki satır: neler izlersin, neye bayılırsın?"
          ipucu={`${bio.length}/240 · Eşleşmelerin ilk bunu okuyor.`}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />
        <HataKutusu mesaj={hata} />
        {tamam ? <Metin renk={renk.zumrutKoyu}>Kaydedildi.</Metin> : null}
        <Dugme onPress={kaydet} bekliyor={bekliyor}>
          Kaydet
        </Dugme>

        <View style={{ flexDirection: "row", gap: bosluk.l, justifyContent: "center", marginTop: bosluk.s }}>
          <Text onPress={() => Linking.openURL(`${SITE}/kvkk`)} style={{ fontFamily: yazi.orta, color: renk.yaziOrta }}>
            KVKK metni
          </Text>
          <Text onPress={() => Linking.openURL(`${SITE}/kosullar`)} style={{ fontFamily: yazi.orta, color: renk.yaziOrta }}>
            Kullanım koşulları
          </Text>
        </View>

        <Kart style={{ gap: bosluk.m, borderColor: "#fecdd3", backgroundColor: "#fff7f8", marginTop: bosluk.l }}>
          <Metin tur="altBaslik">Hesabı sil</Metin>
          <Metin tur="kucuk">
            Profilin, favorilerin, puanların, yazdıkların, eşleşmelerin ve mesajların kalıcı olarak silinir. Geri alınamaz.
          </Metin>
          <Alan etiket="Onaylamak için SİL yaz" value={silOnay} onChangeText={setSilOnay} autoCapitalize="characters" autoCorrect={false} />
          <HataKutusu mesaj={silHata} />
          <Dugme tur="tehlike" onPress={hesabiSil} bekliyor={siliniyor}>
            Hesabımı kalıcı olarak sil
          </Dugme>
        </Kart>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
