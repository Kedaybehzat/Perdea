// Koyu perde bandı: ekranların tepesindeki afiş başlığı (web'deki PerdeBandi karşılığı).
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bosluk, buyuk, renk, yazi } from "@/tema";

export function PerdeZemin({ children, style }: { children?: ReactNode; style?: object }) {
  return (
    <View style={[{ backgroundColor: renk.perde900, overflow: "hidden" }, style]}>
      <LinearGradient
        colors={[renk.perde800, renk.perde950]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Perde kıvrımları */}
      <View style={[StyleSheet.absoluteFill, { flexDirection: "row" }]} pointerEvents="none">
        {Array.from({ length: 9 }, (_, i) => (
          <LinearGradient
            key={i}
            colors={["rgba(255,255,255,0.05)", "rgba(0,0,0,0)", "rgba(0,0,0,0.2)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

export default function PerdeBaslik({
  ustEtiket,
  baslik,
  vurgu,
  aciklama,
  children,
}: {
  ustEtiket?: string;
  baslik: string;
  vurgu?: string;
  aciklama?: string;
  children?: ReactNode;
}) {
  const kenar = useSafeAreaInsets();
  return (
    <PerdeZemin style={{ paddingTop: kenar.top + bosluk.l, paddingBottom: bosluk.xl, paddingHorizontal: bosluk.xl }}>
      {ustEtiket ? <Text style={s.ust}>{buyuk(ustEtiket)}</Text> : null}
      <Text style={s.baslik} accessibilityRole="header">
        {baslik}
        {vurgu ? <Text style={s.vurgu}> {vurgu}</Text> : null}
      </Text>
      {aciklama ? <Text style={s.aciklama}>{aciklama}</Text> : null}
      {children ? <View style={{ marginTop: bosluk.l }}>{children}</View> : null}
    </PerdeZemin>
  );
}

const s = StyleSheet.create({
  ust: {
    fontFamily: yazi.kalin,
    fontSize: 11,
    letterSpacing: 2.4,
    color: renk.altin,
    marginBottom: 6,
  },
  baslik: { fontFamily: yazi.baslik, fontSize: 34, lineHeight: 37, color: "#fff", letterSpacing: -0.5 },
  vurgu: { fontFamily: yazi.baslikEgik, color: renk.nane },
  aciklama: {
    marginTop: 8,
    fontFamily: yazi.govde,
    fontSize: 15,
    lineHeight: 21,
    color: "rgba(236,253,245,0.85)",
  },
});
