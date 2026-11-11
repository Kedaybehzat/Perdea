import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";
import { Fraunces_700Bold, Fraunces_700Bold_Italic } from "@expo-google-fonts/fraunces";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { OturumSaglayici, useOturum } from "@/lib/oturum";
import { ayarlarEksik } from "@/lib/supabase";
import { renk } from "@/tema";

SplashScreen.preventAutoHideAsync();

export default function KokDuzen() {
  const [yazilarHazir] = useFonts({
    Fraunces_700Bold,
    Fraunces_700Bold_Italic,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  if (ayarlarEksik) return <AyarEksik />;

  return (
    <SafeAreaProvider>
      <OturumSaglayici>
        <Gezinme yazilarHazir={yazilarHazir} />
      </OturumSaglayici>
    </SafeAreaProvider>
  );
}

function Gezinme({ yazilarHazir }: { yazilarHazir: boolean }) {
  const { yukleniyor, oturum } = useOturum();
  const hazir = yazilarHazir && !yukleniyor;

  useEffect(() => {
    if (hazir) SplashScreen.hideAsync();
  }, [hazir]);

  if (!hazir) return null;

  const girisli = Boolean(oturum);
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: renk.krem } }}>
        <Stack.Protected guard={!girisli}>
          <Stack.Screen name="(giris)" />
        </Stack.Protected>
        <Stack.Protected guard={girisli}>
          <Stack.Screen name="(sekmeler)" />
          <Stack.Screen name="sohbet/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

// .env.local doldurulmadan açılırsa boş ekran yerine ne yapılacağını söyle.
function AyarEksik() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: renk.perde900, justifyContent: "center", padding: 28, gap: 12 }}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>Kurulum eksik</Text>
      <Text style={{ color: "#d1fae5", fontSize: 16, lineHeight: 23 }}>
        mobil/.env.example dosyasını .env.local olarak kopyala, Supabase adresini ve anon anahtarını yaz, sonra
        uygulamayı yeniden başlat.
      </Text>
    </View>
  );
}
