import { Tabs } from "expo-router/js-tabs";
import { Compass, Heart, MessageCircle, User, Users } from "lucide-react-native";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSayilar } from "@/lib/sayac";
import { renk, yazi } from "@/tema";

export default function SekmeDuzeni() {
  const kenar = useSafeAreaInsets();
  const { mesaj, bildirim } = useSayilar();
  const rozet = (n: number) => (n > 0 ? (n > 99 ? "99+" : n) : undefined);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: renk.zumrutKoyu,
        tabBarInactiveTintColor: renk.yaziSoluk,
        tabBarStyle: {
          backgroundColor: renk.kagit,
          borderTopColor: renk.cizgi,
          height: 66 + kenar.bottom,
          paddingTop: 6,
          paddingBottom: kenar.bottom + 10,
        },
        // Etiketi kendimiz çiziyoruz: varsayılan etiket "ş", "ç" gibi harflerin kuyruğunu kırpıyor.
        tabBarLabel: ({ color, children }) => (
          <Text style={{ fontFamily: yazi.yariKalin, fontSize: 11, lineHeight: 17, color }}>{children}</Text>
        ),
        sceneStyle: { backgroundColor: renk.krem },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Keşfet", tabBarIcon: ({ color }) => <Compass color={color} size={22} /> }} />
      <Tabs.Screen name="eslesme" options={{ title: "Eşleş", tabBarIcon: ({ color }) => <Heart color={color} size={22} /> }} />
      <Tabs.Screen name="sohbet" options={{ title: "Sohbet", tabBarBadge: rozet(mesaj), tabBarBadgeStyle: { backgroundColor: renk.gul, fontFamily: yazi.kalin, fontSize: 11 }, tabBarIcon: ({ color }) => <MessageCircle color={color} size={22} /> }} />
      <Tabs.Screen name="topluluk" options={{ title: "Topluluk", tabBarIcon: ({ color }) => <Users color={color} size={22} /> }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", tabBarBadge: rozet(bildirim), tabBarBadgeStyle: { backgroundColor: renk.gul, fontFamily: yazi.kalin, fontSize: 11 }, tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs>
  );
}
