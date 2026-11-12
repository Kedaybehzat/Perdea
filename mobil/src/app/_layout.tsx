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
import * as Notifications from "expo-notifications";
import { Platform, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { OturumSaglayici, useOturum } from "@/lib/oturum";
import { pushKaydet, yolaGit } from "@/lib/push";
import { SayacSaglayici } from "@/lib/sayac";
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
    <SayacSaglayici aktif={girisli}>
      <PushBaglantisi girisli={girisli} />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: renk.krem } }}>
        <Stack.Protected guard={!girisli}>
          <Stack.Screen name="(giris)" />
        </Stack.Protected>
        <Stack.Protected guard={girisli}>
          <Stack.Screen name="(sekmeler)" />
          <Stack.Screen name="sohbet/[id]" />
          <Stack.Screen name="baslik/[slug]" />
          <Stack.Screen name="salon/index" />
          <Stack.Screen name="salon/[id]" />
          <Stack.Screen name="cosplay/index" />
          <Stack.Screen name="cosplay/yeni" />
          <Stack.Screen name="cosplay/[id]" />
          <Stack.Screen name="oyun/index" />
          <Stack.Screen name="oyun/[kod]" />
          <Stack.Screen name="bildirimler" />
          <Stack.Screen name="profil-duzenle" />
        </Stack.Protected>
      </Stack>
    </SayacSaglayici>
  );
}

// Giriş yapılınca telefonu push için kaydet; bildirime dokunulunca ilgili ekrana git.
function PushBaglantisi({ girisli }: { girisli: boolean }) {
  useEffect(() => {
    if (!girisli || Platform.OS === "web") return;
    void pushKaydet(true);
    const abone = Notifications.addNotificationResponseReceivedListener((yanit) => {
      yolaGit(yanit.notification.request.content.data?.yol);
    });
    // Uygulama kapalıyken bildirime dokunarak açıldıysa.
    void Notifications.getLastNotificationResponseAsync().then((yanit) => {
      if (yanit) yolaGit(yanit.notification.request.content.data?.yol);
    });
    return () => abone.remove();
  }, [girisli]);
  return null;
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
