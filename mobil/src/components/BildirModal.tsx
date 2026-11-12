// İçerik bildirme penceresi (mağaza kuralı: kullanıcı içeriği bildirilebilmeli).
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { Alan, Dugme, HataKutusu, Metin } from "@/components/temel";
import { useOturum } from "@/lib/oturum";
import { supabase } from "@/lib/supabase";
import { bosluk, kose, renk } from "@/tema";

export type BildirHedefi = { tur: "entry" | "gonderi" | "sohbet" | "kullanici" | "bulusma"; id: string } | null;

export default function BildirModal({ hedef, kapat }: { hedef: BildirHedefi; kapat: () => void }) {
  const { oturum } = useOturum();
  const [sebep, setSebep] = useState("");
  const [hata, setHata] = useState<string>();
  const [tamam, setTamam] = useState(false);
  const [bekliyor, setBekliyor] = useState(false);

  function kapatSifirla() {
    setSebep("");
    setHata(undefined);
    setTamam(false);
    kapat();
  }

  async function gonder() {
    if (!hedef || !oturum) return;
    const s = sebep.trim();
    if (s.length < 5) return setHata("Kısaca ne olduğunu yaz (en az 5 karakter).");
    setBekliyor(true);
    const { error } = await supabase
      .from("sikayetler")
      .insert({ bildiren_id: oturum.user.id, hedef_tur: hedef.tur, hedef_id: hedef.id, sebep: s.slice(0, 500) });
    setBekliyor(false);
    if (error) return setHata("Bildirim gönderilemedi. Biraz sonra yeniden dene.");
    setTamam(true);
  }

  return (
    <Modal visible={hedef !== null} transparent animationType="slide" onRequestClose={kapatSifirla}>
      <Pressable style={s.arka} onPress={kapatSifirla} accessibilityLabel="Kapat" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.cekmece}>
          <Metin tur="altBaslik">Bildir</Metin>
          {tamam ? (
            <>
              <Metin renk={renk.yaziOrta}>Bildirimin alındı, teşekkürler. İnceleyeceğiz.</Metin>
              <Dugme onPress={kapatSifirla}>Tamam</Dugme>
            </>
          ) : (
            <>
              <Metin tur="kucuk">Bu içerikte ne sorun var? Taciz, spam, uygunsuz fotoğraf…</Metin>
              <Alan value={sebep} onChangeText={setSebep} multiline maxLength={500} placeholder="Kısaca anlat" style={{ minHeight: 90, textAlignVertical: "top" }} />
              <HataKutusu mesaj={hata} />
              <View style={{ flexDirection: "row", gap: bosluk.m }}>
                <Dugme tur="cizgi" onPress={kapatSifirla} style={{ flex: 1 }}>
                  Vazgeç
                </Dugme>
                <Dugme tur="tehlike" onPress={gonder} bekliyor={bekliyor} style={{ flex: 1 }}>
                  Gönder
                </Dugme>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  arka: { flex: 1, backgroundColor: "rgba(3,39,32,0.55)" },
  cekmece: {
    backgroundColor: renk.krem,
    borderTopLeftRadius: kose.xl,
    borderTopRightRadius: kose.xl,
    padding: bosluk.xl,
    paddingBottom: bosluk.xxl + 8,
    gap: bosluk.m,
  },
});
