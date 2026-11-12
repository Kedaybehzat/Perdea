// İç ekranların üst şeridi: geri oku + başlık (+ sağda isteğe bağlı düğme).
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PerdeZemin } from "@/components/Perde";
import { bosluk, buyuk, renk, yazi } from "@/tema";

export default function UstCubuk({
  baslik,
  ustEtiket,
  sag,
}: {
  baslik: string;
  ustEtiket?: string;
  sag?: ReactNode;
}) {
  const kenar = useSafeAreaInsets();
  return (
    <PerdeZemin style={{ paddingTop: kenar.top + 8, paddingBottom: 14, paddingHorizontal: bosluk.m }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.s }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={{ padding: 8 }}
        >
          <ArrowLeft size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          {ustEtiket ? (
            <Text style={{ fontFamily: yazi.kalin, fontSize: 10, letterSpacing: 2, color: renk.altin }}>{buyuk(ustEtiket)}</Text>
          ) : null}
          <Text numberOfLines={1} accessibilityRole="header" style={{ fontFamily: yazi.baslik, fontSize: 22, color: "#fff" }}>
            {baslik}
          </Text>
        </View>
        {sag}
      </View>
    </PerdeZemin>
  );
}
