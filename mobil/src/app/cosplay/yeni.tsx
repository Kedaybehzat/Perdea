import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import UstCubuk from "@/components/UstCubuk";
import { Alan, Dugme, HataKutusu } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { sehirBul } from "@/lib/sehirler";
import { supabase } from "@/lib/supabase";
import { bosluk, renk } from "@/tema";

// "24.12.2026" + "19:30" → ISO (cihazın saat dilimiyle). Geçersizse null.
function zamanCoz(tarih: string, saat: string): string | null {
  const t = tarih.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  const s = saat.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!t || !s) return null;
  const d = new Date(+t[3], +t[2] - 1, +t[1], +s[1], +s[2]);
  if (d.getMonth() !== +t[2] - 1 || d.getDate() !== +t[1] || +s[1] > 23 || +s[2] > 59) return null;
  return d.toISOString();
}

export default function YeniBulusma() {
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [baslik, setBaslik] = useState("");
  const [tema, setTema] = useState("");
  const [sehir, setSehir] = useState("");
  const [mekan, setMekan] = useState("");
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [kontenjan, setKontenjan] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  async function olustur() {
    if (!benId) return;
    const b = baslik.trim();
    const m = mekan.trim();
    const il = sehirBul(sehir);
    const zaman = zamanCoz(tarih, saat);
    if (b.length < 4 || b.length > 90) return setHata("Başlık 4–90 karakter olmalı.");
    if (!il) return setHata("Şehri il adıyla yaz (örn. İstanbul).");
    if (m.length < 3 || m.length > 120) return setHata("Buluşma yerini yaz (3–120 karakter).");
    if (!zaman) return setHata("Tarihi 24.12.2026, saati 19:30 biçiminde yaz.");
    if (new Date(zaman).getTime() < Date.now() + 3600 * 1000) return setHata("Buluşma en az bir saat sonrası için olmalı.");
    let kisi: number | null = null;
    if (kontenjan.trim()) {
      kisi = Number(kontenjan);
      if (!Number.isInteger(kisi) || kisi < 2 || kisi > 500) return setHata("Kontenjan 2 ile 500 arasında bir sayı olmalı.");
    }
    setBekliyor(true);
    setHata(undefined);
    const { data, error } = await supabase
      .from("bulusmalar")
      .insert({ duzenleyen_id: benId, baslik: b, aciklama: aciklama.trim() || null, tema: tema.trim() || null, sehir: il, mekan: m, zaman, kontenjan: kisi })
      .select("id")
      .single();
    setBekliyor(false);
    if (error) return setHata(hataMesaji(error));
    router.replace({ pathname: "/cosplay/[id]", params: { id: data.id } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket="Cosplay" baslik="Buluşma düzenle" />
      <ScrollView contentContainerStyle={{ padding: bosluk.l, gap: bosluk.l }} keyboardShouldPersistTaps="handled">
        <Alan etiket="Başlık" value={baslik} onChangeText={setBaslik} maxLength={90} placeholder="örn. Ghibli temalı piknik" />
        <Alan etiket="Tema (isteğe bağlı)" value={tema} onChangeText={setTema} maxLength={80} placeholder="örn. Studio Ghibli" />
        <Alan etiket="Şehir" value={sehir} onChangeText={setSehir} placeholder="örn. İstanbul" />
        <Alan etiket="Buluşma yeri" value={mekan} onChangeText={setMekan} maxLength={120} placeholder="Halka açık bir yer seç" />
        <View style={{ flexDirection: "row", gap: bosluk.m }}>
          <View style={{ flex: 1.4 }}>
            <Alan etiket="Tarih" value={tarih} onChangeText={setTarih} placeholder="24.12.2026" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Alan etiket="Saat" value={saat} onChangeText={setSaat} placeholder="19:30" keyboardType="numbers-and-punctuation" />
          </View>
        </View>
        <Alan etiket="Kontenjan (isteğe bağlı)" value={kontenjan} onChangeText={setKontenjan} keyboardType="number-pad" placeholder="Boş bırakırsan sınırsız" />
        <Alan
          etiket="Açıklama (isteğe bağlı)"
          value={aciklama}
          onChangeText={setAciklama}
          multiline
          maxLength={1500}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />
        <HataKutusu mesaj={hata} />
        <Dugme onPress={olustur} bekliyor={bekliyor}>
          Buluşmayı yayınla
        </Dugme>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
