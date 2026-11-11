import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anahtar = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const ayarlarEksik = !url || !anahtar;

// Yalnızca anon (herkese açık) anahtar kullanılır; yetkiyi veritabanındaki RLS belirler.
export const supabase = createClient(url || "http://localhost", anahtar || "eksik", {
  auth: {
    // Sunucu tarafı ön derlemede (web export) window yok; orada depolama kullanma.
    ...(Platform.OS === "web" ? {} : { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Uygulama öne gelince oturum yenilemeyi başlat, arkaya gidince durdur.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (durum) => {
    if (durum === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
