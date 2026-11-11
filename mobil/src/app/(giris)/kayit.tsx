import { Link } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import FormEkrani from "@/components/FormEkrani";
import { Alan, Dugme, HataKutusu } from "@/components/temel";
import { girisHatasi } from "@/lib/hata";
import { supabase } from "@/lib/supabase";
import { renk, yazi } from "@/tema";

const SITE = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// Web'deki lib/validation.ts ile aynı kurallar.
function dogrula(eposta: string, sifre: string, tekrar: string, kullaniciAdi: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) return "Geçerli bir e-posta yaz.";
  if (sifre.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (sifre !== tekrar) return "Şifreler aynı değil.";
  if (!/^[a-z0-9_]{3,20}$/.test(kullaniciAdi)) {
    return "Kullanıcı adı 3–20 karakter; küçük harf, rakam ve alt çizgi olabilir.";
  }
  return null;
}

export default function Kayit() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [onay, setOnay] = useState(false);
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  async function kayitOl() {
    setHata(undefined);
    const ad = kullaniciAdi.trim().toLowerCase();
    const sorun = dogrula(eposta.trim(), sifre, tekrar, ad);
    if (sorun) return setHata(sorun);
    if (!onay) return setHata("Devam etmek için 18 yaş beyanını ve koşulları onaylamalısın.");

    setBekliyor(true);
    const { data, error } = await supabase.auth.signUp({ email: eposta.trim(), password: sifre });
    if (error || !data.user) {
      setBekliyor(false);
      return setHata(girisHatasi(error?.message ?? ""));
    }

    // Profil satırı (web'deki kayıt akışıyla aynı iki adım).
    let { error: profilHatasi } = await supabase
      .from("users")
      .insert({ id: data.user.id, username: ad, kvkk_onay_at: new Date().toISOString() });
    if (profilHatasi && (profilHatasi.code === "PGRST204" || profilHatasi.code === "42703")) {
      ({ error: profilHatasi } = await supabase.from("users").insert({ id: data.user.id, username: ad }));
    }
    setBekliyor(false);
    if (profilHatasi) {
      await supabase.auth.signOut();
      setHata(
        profilHatasi.code === "23505"
          ? "Bu kullanıcı adı alınmış. Başka bir ad dene, sonra aynı e-postayla giriş yap."
          : "Profil oluşturulamadı. Biraz sonra yeniden dene."
      );
    }
  }

  return (
    <FormEkrani baslik="Perdeye" vurgu="katıl" aciklama="Bir dakika sürer, ücretsiz.">
      <Alan
        etiket="E-posta"
        value={eposta}
        onChangeText={setEposta}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="sen@ornek.com"
      />
      <Alan
        etiket="Kullanıcı adı"
        value={kullaniciAdi}
        onChangeText={setKullaniciAdi}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="ornek_kullanici"
        ipucu="Sonradan değiştirilemez."
      />
      <Alan etiket="Şifre" value={sifre} onChangeText={setSifre} secureTextEntry autoComplete="new-password" ipucu="En az 8 karakter." />
      <Alan etiket="Şifre (tekrar)" value={tekrar} onChangeText={setTekrar} secureTextEntry autoComplete="new-password" />

      <Pressable
        onPress={() => setOnay((o) => !o)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: onay }}
        style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            borderWidth: 1.5,
            borderColor: onay ? renk.zumrut : renk.cizgiKoyu,
            backgroundColor: onay ? renk.zumrut : renk.kagit,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          {onay ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
        </View>
        <Text style={{ flex: 1, fontFamily: yazi.govde, fontSize: 14, lineHeight: 20, color: renk.yaziOrta }}>
          18 yaşından büyüğüm.{" "}
          <Text style={{ color: renk.zumrutKoyu, fontFamily: yazi.yariKalin }} onPress={() => Linking.openURL(`${SITE}/kosullar`)}>
            Kullanım Koşulları
          </Text>
          ’nı kabul ediyorum;{" "}
          <Text style={{ color: renk.zumrutKoyu, fontFamily: yazi.yariKalin }} onPress={() => Linking.openURL(`${SITE}/kvkk`)}>
            KVKK Aydınlatma Metni
          </Text>
          ’ni okudum ve verilerimin yurt dışındaki sunucularda saklanmasına açık rıza veriyorum.
        </Text>
      </Pressable>

      <HataKutusu mesaj={hata} />
      <Dugme onPress={kayitOl} bekliyor={bekliyor}>
        Kayıt ol
      </Dugme>
      <Text style={{ textAlign: "center", fontFamily: yazi.govde, fontSize: 15, color: renk.yaziOrta }}>
        Zaten hesabın var mı?{" "}
        <Link href="/giris" replace style={{ fontFamily: yazi.yariKalin, color: renk.zumrutKoyu }}>
          Giriş yap
        </Link>
      </Text>
    </FormEkrani>
  );
}
