// Telefona bildirim (push): izin iste, Expo push adresini al, veritabanına kaydet.
// Gönderimi veritabanı yapar (docs/migrations/2026-11-11d_mobil_push_avatar.sql).
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { supabase } from "./supabase";

const ANAHTAR = "perdea.pushToken";

if (Platform.OS !== "web") {
  // Uygulama açıkken gelen bildirim de üstte görünsün.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type PushDurumu = "acik" | "izin-yok" | "desteklenmiyor" | "proje-yok";

export async function pushKaydet(izinIste = true): Promise<PushDurumu> {
  if (Platform.OS === "web" || !Device.isDevice) return "desteklenmiyor";

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("varsayilan", {
      name: "Perdea",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#059669",
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted" && izinIste) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== "granted") return "izin-yok";

  // EAS proje kimliği: `npx eas-cli init` çalıştırınca app.json'a yazılır.
  const projectId =
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return "proje-yok";

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase.rpc("cihaz_kaydet", { p_token: token, p_platform: Platform.OS });
    if (error) return "desteklenmiyor";
    await AsyncStorage.setItem(ANAHTAR, token);
    return "acik";
  } catch {
    // Android'de Expo Go push desteklemiyor; geliştirme derlemesi (EAS) gerekir.
    return "desteklenmiyor";
  }
}

// Çıkışta bu telefonu hesaptan düşür (yoksa başkasının bildirimi bu telefona gelir).
export async function pushSil() {
  try {
    const token = await AsyncStorage.getItem(ANAHTAR);
    if (token) await supabase.rpc("cihaz_sil", { p_token: token });
    await AsyncStorage.removeItem(ANAHTAR);
  } catch {
    // önemli değil
  }
}

// Web'deki bağlantıları uygulamadaki ekranlara çevirir ("/baslik/x#e-1" → "/baslik/x").
export function yolaGit(yol: unknown) {
  if (typeof yol !== "string" || !yol.startsWith("/")) return;
  const temiz = yol.split("#")[0];
  const bilinen = ["/sohbet", "/topluluk", "/bildirimler", "/baslik/", "/cosplay/", "/salon/", "/oyun/"];
  if (temiz === "/" || bilinen.some((b) => temiz === b || temiz.startsWith(b))) {
    router.push(temiz as never);
  } else {
    router.push("/bildirimler");
  }
}
