// Sohbet ve profil için dosya yükleme yardımcıları.
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export function rastgeleAd(): string {
  const harfler = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = Date.now().toString(36);
  for (let i = 0; i < 16; i++) s += harfler[Math.floor(Math.random() * harfler.length)];
  return s;
}

async function baytlar(uri: string): Promise<ArrayBuffer> {
  return (await fetch(uri)).arrayBuffer();
}

// Galeriden fotoğraf seç; en çok `kenar` px'e küçültüp JPEG'e çevirir.
// Yeniden kodlama, fotoğraftaki konum (EXIF) bilgisini de siler.
export async function fotografSec(secenek: { kenar: number; kare?: boolean }): Promise<{ uri: string } | "izin-yok" | null> {
  const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!izin.granted) return "izin-yok";
  const sonuc = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
    exif: false,
    allowsEditing: Boolean(secenek.kare),
    aspect: secenek.kare ? [1, 1] : undefined,
  });
  if (sonuc.canceled || !sonuc.assets?.[0]) return null;
  const a = sonuc.assets[0];
  const buyukKenar = Math.max(a.width || 0, a.height || 0);
  const islemler: ImageManipulator.Action[] =
    buyukKenar > secenek.kenar
      ? [{ resize: a.width >= a.height ? { width: secenek.kenar } : { height: secenek.kenar } }]
      : [];
  const hazir = await ImageManipulator.manipulateAsync(a.uri, islemler, {
    compress: 0.82,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return { uri: hazir.uri };
}

export async function yukle(
  kova: string,
  yol: string,
  uri: string,
  tip: string
): Promise<{ hata?: string }> {
  try {
    const { error } = await supabase.storage
      .from(kova)
      .upload(yol, await baytlar(uri), { contentType: tip, upsert: false });
    if (error) {
      return {
        hata: /bucket|not found/i.test(error.message)
          ? "Dosya yükleme henüz kurulmamış (veritabanı dosyaları çalıştırılmalı)."
          : "Dosya yüklenemedi. Bağlantını kontrol edip yeniden dene.",
      };
    }
    return {};
  } catch {
    return { hata: "Dosya okunamadı. Başka bir dosya dener misin?" };
  }
}
