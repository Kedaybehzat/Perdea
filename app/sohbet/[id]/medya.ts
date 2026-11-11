'use client'

// Tarayıcı tarafı medya yardımcıları: görseli küçült, dosyayı Storage'a yükle.
import { createClient } from "@/lib/supabase/client";
import { MEDYA_KOVASI } from "@/lib/sohbet-tipleri";

const EN_BUYUK_KENAR = 1600;
export const EN_BUYUK_GORSEL = 15 * 1024 * 1024; // seçilen dosya (küçültmeden önce)
export const EN_UZUN_SES_SN = 120;

function rastgeleAd(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// Görseli en çok 1600 px'e indirip JPEG'e çevirir. Yan etkisi: fotoğrafın
// içindeki konum (EXIF) bilgisi de silinir.
export async function gorseliHazirla(dosya: File): Promise<Blob> {
  const resim = await createImageBitmap(dosya);
  const oran = Math.min(1, EN_BUYUK_KENAR / Math.max(resim.width, resim.height));
  const tuval = document.createElement("canvas");
  tuval.width = Math.max(1, Math.round(resim.width * oran));
  tuval.height = Math.max(1, Math.round(resim.height * oran));
  const cizim = tuval.getContext("2d");
  if (!cizim) throw new Error("tuval yok");
  cizim.fillStyle = "#fff";
  cizim.fillRect(0, 0, tuval.width, tuval.height);
  cizim.drawImage(resim, 0, 0, tuval.width, tuval.height);
  resim.close();
  return new Promise((coz, reddet) =>
    tuval.toBlob((b) => (b ? coz(b) : reddet(new Error("dönüştürülemedi"))), "image/jpeg", 0.85)
  );
}

// Dosyayı <sohbet>/<ben>/<rastgele>.<uzanti> yoluna yükler; yolu döndürür.
export async function medyaYukle(
  sohbetId: string,
  benId: string,
  veri: Blob,
  uzanti: string,
  tip: string
): Promise<{ yol?: string; hata?: string }> {
  const yol = `${sohbetId}/${benId}/${rastgeleAd()}.${uzanti}`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(MEDYA_KOVASI)
    .upload(yol, await veri.arrayBuffer(), { contentType: tip, upsert: false });
  if (error) {
    return {
      hata: /bucket|not found/i.test(error.message)
        ? "Dosya gönderimi henüz kurulmamış (son veritabanı dosyası çalıştırılmalı)."
        : "Dosya yüklenemedi. Bağlantını kontrol edip yeniden dene.",
    };
  }
  return { yol };
}

// Tarayıcının kaydedebildiği ses biçimi.
export function sesBicimi(): { mime: string; tip: string; uzanti: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const adaylar = [
    { mime: "audio/webm;codecs=opus", tip: "audio/webm", uzanti: "webm" },
    { mime: "audio/mp4", tip: "audio/mp4", uzanti: "mp4" },
    { mime: "audio/ogg;codecs=opus", tip: "audio/ogg", uzanti: "ogg" },
  ];
  return adaylar.find((a) => MediaRecorder.isTypeSupported(a.mime)) ?? null;
}
