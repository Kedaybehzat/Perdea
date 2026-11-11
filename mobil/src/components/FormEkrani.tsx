// Giriş/kayıt ekranlarının ortak kabuğu: üstte perde bandı, altta kaydırılabilir form.
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PerdeBaslik from "@/components/Perde";
import { bosluk, renk } from "@/tema";

export default function FormEkrani({
  baslik,
  vurgu,
  aciklama,
  children,
}: {
  baslik: string;
  vurgu?: string;
  aciklama?: string;
  children: ReactNode;
}) {
  const kenar = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: kenar.bottom + bosluk.xxl }}>
        <View>
          <PerdeBaslik baslik={baslik} vurgu={vurgu} aciklama={aciklama} />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Geri"
            hitSlop={12}
            style={{ position: "absolute", top: kenar.top + 8, right: bosluk.l, padding: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <ArrowLeft size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={{ padding: bosluk.xl, gap: bosluk.l }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
