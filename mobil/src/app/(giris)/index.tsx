import { router } from "expo-router";
import { Clapperboard, Heart, MessagesSquare } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PerdeZemin } from "@/components/Perde";
import { Dugme } from "@/components/temel";
import { bosluk, renk, yazi } from "@/tema";

const maddeler = [
  { ikon: Clapperboard, metin: "Sevdiğin film, dizi ve animeleri işaretle" },
  { ikon: Heart, metin: "Zevki sana en yakın kişilerle eşleş" },
  { ikon: MessagesSquare, metin: "Finali kimin nasıl bulduğunu konuş" },
];

export default function Karsilama() {
  const kenar = useSafeAreaInsets();
  return (
    <PerdeZemin style={{ flex: 1, paddingTop: kenar.top + 24, paddingBottom: kenar.bottom + 20, paddingHorizontal: 28 }}>
      <Text style={s.logo}>Perdea</Text>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={s.ust}>SİNEFİLLER İÇİN</Text>
        <Text style={s.baslik} accessibilityRole="header">
          Aynı sahnede{"\n"}
          <Text style={s.vurgu}>duygulananı bul.</Text>
        </Text>

        <View style={{ marginTop: bosluk.xxl, gap: bosluk.l }}>
          {maddeler.map(({ ikon: Ikon, metin }) => (
            <View key={metin} style={s.madde}>
              <View style={s.maddeIkon}>
                <Ikon size={18} color={renk.altin} />
              </View>
              <Text style={s.maddeYazi}>{metin}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: bosluk.m }}>
        <Dugme tur="altin" onPress={() => router.push("/kayit")}>
          Ücretsiz kayıt ol
        </Dugme>
        <Dugme
          tur="cizgi"
          onPress={() => router.push("/giris")}
          style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)" }}
        >
          <Text style={{ color: "#fff" }}>Hesabım var, giriş yap</Text>
        </Dugme>
      </View>
    </PerdeZemin>
  );
}

const s = StyleSheet.create({
  logo: { fontFamily: yazi.baslik, fontSize: 28, color: "#fff", letterSpacing: -0.5 },
  ust: { fontFamily: yazi.kalin, fontSize: 12, letterSpacing: 2.6, color: renk.altin },
  baslik: { marginTop: 10, fontFamily: yazi.baslik, fontSize: 44, lineHeight: 47, color: "#fff", letterSpacing: -1 },
  vurgu: { fontFamily: yazi.baslikEgik, color: renk.nane },
  madde: { flexDirection: "row", alignItems: "center", gap: bosluk.m },
  maddeIkon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  maddeYazi: { flex: 1, fontFamily: yazi.orta, fontSize: 16, lineHeight: 22, color: "rgba(236,253,245,0.92)" },
});
