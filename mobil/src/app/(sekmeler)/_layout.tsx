import { Tabs } from "expo-router/js-tabs";
import { Compass, Heart, MessageCircle, Rss, User } from "lucide-react-native";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { renk, yazi } from "@/tema";

export default function SekmeDuzeni() {
  const kenar = useSafeAreaInsets();
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
      <Tabs.Screen name="sohbet" options={{ title: "Sohbet", tabBarIcon: ({ color }) => <MessageCircle color={color} size={22} /> }} />
      <Tabs.Screen name="akis" options={{ title: "Akış", tabBarIcon: ({ color }) => <Rss color={color} size={22} /> }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs>
  );
}
