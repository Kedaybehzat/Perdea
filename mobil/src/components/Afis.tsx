// Afiş kutusu: poster varsa onu, yoksa başlığı taşıyan sade bir yedek gösterir.
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { kose, renk, yazi } from "@/tema";

const TONLAR: [string, string][] = [
  [renk.perde700, renk.perde950],
  ["#44403c", "#1c1917"],
  ["#92400e", "#1c1917"],
  ["#115e59", renk.perde950],
  ["#881337", "#1c1917"],
];

export default function Afis({
  url,
  baslik,
  style,
}: {
  url: string | null;
  baslik: string;
  style?: StyleProp<ViewStyle>;
}) {
  let h = 0;
  for (const c of baslik) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (
    <View style={[s.kutu, style]}>
      {url ? (
        <Image
          source={{ uri: url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityLabel={baslik}
        />
      ) : (
        <LinearGradient colors={TONLAR[h % TONLAR.length]} style={[StyleSheet.absoluteFill, s.yedek]}>
          <View style={s.cizgi} />
          <Text style={s.yedekYazi} numberOfLines={4}>
            {baslik}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  kutu: {
    aspectRatio: 2 / 3,
    borderRadius: kose.m,
    overflow: "hidden",
    backgroundColor: renk.perde900,
  },
  yedek: { justifyContent: "center", padding: 10 },
  cizgi: { width: 26, height: 2, backgroundColor: renk.altin, marginBottom: 6 },
  yedekYazi: { fontFamily: yazi.baslik, color: "#fff", fontSize: 13, lineHeight: 16 },
});
