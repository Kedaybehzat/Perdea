// Veritabanı hatalarını kullanıcıya gösterilecek cümleye çevirir.
// (Web'deki lib/hata.ts ile aynı kodlar; yeni kod eklenince ikisini de güncelle.)
const mesajlar: Record<string, string> = {
  GIRIS_GEREKLI: "Bunun için giriş yapmalısın.",
  YETKI_YOK: "Bunu yapmaya yetkin yok.",
  ESLESME_YOK: "Yalnızca karşılıklı eşleştiğin kişilerle yazışabilirsin.",
  ENGELLI: "Bu kişiyle mesajlaşma kapalı.",
  SOHBET_YOK: "Sohbet bulunamadı.",
  COK_HIZLI: "Biraz yavaş. Birkaç dakika sonra yeniden dene.",
  METIN_UZUN: "Metin çok uzun ya da boş.",
  MEDYA_GECERSIZ: "Dosya gönderilemedi. Yeniden dener misin?",
  BASLIK_GECERSIZ: "Başlık 3–80 karakter olmalı.",
};

export function hataMesaji(hata: { message?: string; code?: string } | null | undefined): string {
  const metin = hata?.message ?? "";
  const kod = metin.match(/PERDEA:([A-Z_]+)/)?.[1];
  if (kod && mesajlar[kod]) return mesajlar[kod];
  if (/Network request failed|Failed to fetch/i.test(metin)) {
    return "Bağlantı kurulamadı. İnternetini kontrol edip yeniden dene.";
  }
  if (hata?.code === "42P01" || hata?.code === "PGRST202" || hata?.code === "PGRST205") {
    return "Bu özellik henüz kurulmamış (veritabanı dosyaları çalıştırılmalı).";
  }
  return "Bir şeyler ters gitti. Biraz sonra yeniden dene.";
}

// Supabase giriş/kayıt hatalarını Türkçeleştir.
export function girisHatasi(mesaj: string): string {
  if (/Invalid login credentials/i.test(mesaj)) return "E-posta ya da şifre hatalı.";
  if (/already registered|already been registered/i.test(mesaj)) return "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.";
  if (/Password should be/i.test(mesaj)) return "Şifre en az 8 karakter olmalı.";
  if (/rate limit|too many/i.test(mesaj)) return "Çok fazla deneme yaptın. Birkaç dakika bekle.";
  if (/Network request failed|Failed to fetch/i.test(mesaj)) return "Bağlantı kurulamadı. İnternetini kontrol et.";
  return "İşlem tamamlanamadı. Bilgileri kontrol edip yeniden dene.";
}
