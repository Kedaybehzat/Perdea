import { Link } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import FormEkrani from "@/components/FormEkrani";
import { Alan, Dugme, HataKutusu } from "@/components/temel";
import { girisHatasi } from "@/lib/hata";
import { supabase } from "@/lib/supabase";
import { renk, yazi } from "@/tema";

export default function Giris() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap() {
    setHata(undefined);
    if (!eposta.trim() || !sifre) {
      setHata("E-posta ve şifreni yaz.");
      return;
    }
    setBekliyor(true);
    const { error } = await supabase.auth.signInWithPassword({ email: eposta.trim(), password: sifre });
    setBekliyor(false);
    if (error) setHata(girisHatasi(error.message));
    // Başarılıysa kök düzen oturumu görür ve sekmelere geçer.
  }

  return (
    <FormEkrani baslik="Tekrar" vurgu="hoş geldin" aciklama="Kaldığın sahneden devam.">
      <Alan
        etiket="E-posta"
        value={eposta}
        onChangeText={setEposta}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="sen@ornek.com"
      />
      <Alan
        etiket="Şifre"
        value={sifre}
        onChangeText={setSifre}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={girisYap}
        returnKeyType="go"
      />
      <HataKutusu mesaj={hata} />
      <Dugme onPress={girisYap} bekliyor={bekliyor}>
        Giriş yap
      </Dugme>
      <Text style={{ textAlign: "center", fontFamily: yazi.govde, fontSize: 15, color: renk.yaziOrta }}>
        Hesabın yok mu?{" "}
        <Link href="/kayit" replace style={{ fontFamily: yazi.yariKalin, color: renk.zumrutKoyu }}>
          Kayıt ol
        </Link>
      </Text>
    </FormEkrani>
  );
}
