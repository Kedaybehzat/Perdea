import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { bosluk, kose, renk, yazi } from "@/tema";

export function Kart({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.kart, style]}>{children}</View>;
}

// Bölümlü seçici ("Akış | Başlıklar").
export function Secici<T extends string>({
  secenekler,
  deger,
  degistir,
  style,
}: {
  secenekler: readonly (readonly [T, string])[];
  deger: T;
  degistir: (d: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.secici, style]} accessibilityRole="tablist">
      {secenekler.map(([d, etiket]) => (
        <Pressable
          key={d}
          onPress={() => degistir(d)}
          accessibilityRole="tab"
          accessibilityState={{ selected: deger === d }}
          style={[s.secenek, deger === d && { backgroundColor: "#fff" }]}
        >
          <Text style={[s.secenekYazi, deger === d && { color: renk.zumrutKoyu }]}>{etiket}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// 1–5 yıldız seçici.
export function YildizSecici({ deger, degistir, etiket }: { deger: number; degistir: (n: number) => void; etiket: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: bosluk.m }}>
      <Text style={{ flex: 1, fontFamily: yazi.orta, fontSize: 15, color: renk.yazi }}>{etiket}</Text>
      <View style={{ flexDirection: "row" }} accessibilityRole="radiogroup" accessibilityLabel={etiket}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => degistir(n)}
            hitSlop={4}
            accessibilityRole="radio"
            accessibilityLabel={`${n} yıldız`}
            accessibilityState={{ checked: deger === n }}
            style={{ padding: 4 }}
          >
            <Text style={{ fontSize: 26, color: n <= deger ? renk.altin : renk.cizgiKoyu }}>★</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  kart: { backgroundColor: renk.kagit, borderRadius: kose.l, borderWidth: 1, borderColor: renk.cizgi, padding: bosluk.l },
  secici: { flexDirection: "row", alignSelf: "flex-start", padding: 4, borderRadius: kose.m, backgroundColor: "rgba(214,204,184,0.45)" },
  secenek: { paddingHorizontal: bosluk.l, paddingVertical: bosluk.s, borderRadius: kose.s },
  secenekYazi: { fontFamily: yazi.yariKalin, fontSize: 14, color: renk.yaziOrta },
});
