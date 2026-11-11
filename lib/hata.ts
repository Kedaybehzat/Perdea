// Veritabanı fonksiyonlarının fırlattığı "PERDEA:KOD" hatalarını kullanıcıya
// gösterilecek Türkçe mesaja çevirir.
const mesajlar: Record<string, string> = {
  GIRIS_GEREKLI: "Bunun için giriş yapmalısın.",
  YETKI_YOK: "Bunu yapmaya yetkin yok.",
  METIN_UZUN: "Metin çok uzun ya da boş.",
  // buluşma
  BULUSMA_YOK: "Buluşma bulunamadı.",
  BULUSMA_IPTAL: "Bu buluşma iptal edilmiş.",
  BULUSMA_GECMIS: "Bu buluşmanın tarihi geçmiş.",
  KONTENJAN_DOLU: "Kontenjan dolmuş.",
  // oyun
  ODA_YOK: "Böyle bir oda yok. Kodu kontrol et.",
  ODA_DOLU: "Oda dolu.",
  OYUN_BASLADI: "Oyun başlamış, şu an katılamazsın.",
  OYUN_SURUYOR: "Oyun sürerken bu yapılamaz.",
  AZ_OYUNCU: "Başlamak için en az 2 oyuncu gerekli.",
  AD_GECERSIZ: "Oda adı 2–50 karakter olmalı.",
  KAPASITE_GECERSIZ: "Kapasite 2 ile 8 arasında olmalı.",
  ASAMA_YANLIS: "Oyun şu an bu aşamada değil.",
  KARAKTER_GECERSIZ: "Karakter adı 1–60 karakter olmalı.",
  SIRA_SENDE_DEGIL: "Sıra sende değil.",
  SORU_BEKLIYOR: "Önce sorduğun sorunun cevaplanmasını bekle.",
  SORU_YOK: "Soru bulunamadı.",
  SORU_KAPANDI: "Bu soru kapandı.",
  KENDI_SORUN: "Kendi soruna cevap veremezsin.",
  CEVAP_GECERSIZ: "Geçersiz cevap.",
  CEVAP_BEKLE: "Sırayı devretmeden önce en az bir cevap bekle.",
  // sohbet
  ESLESME_YOK: "Yalnızca karşılıklı eşleştiğin kişilerle yazışabilirsin.",
  ENGELLI: "Bu kişiyle mesajlaşma kapalı.",
  SOHBET_YOK: "Sohbet bulunamadı.",
  COK_HIZLI: "Biraz yavaş. Birkaç dakika sonra yeniden dene.",
  // başlık
  BASLIK_GECERSIZ: "Başlık 3–80 karakter olmalı.",
};

export function hataMesaji(
  hata: { message?: string; code?: string } | null | undefined,
  varsayilan = "Bir şeyler ters gitti. Tekrar dener misin?"
): string {
  if (!hata) return varsayilan;
  const m = hata.message ?? "";
  const eslesme = m.match(/PERDEA:([A-Z_]+)/);
  if (eslesme && mesajlar[eslesme[1]]) return mesajlar[eslesme[1]];
  // Tablo henüz yoksa (migration çalıştırılmamış) anlaşılır bir not düş.
  if (hata.code === "42P01" || hata.code === "PGRST205" || hata.code === "PGRST202") {
    return "Bu özellik için veritabanı henüz hazır değil (migration çalıştırılmalı).";
  }
  return varsayilan;
}

// Tablo/fonksiyon yok hatası mı? (Sayfalar "kurulum bekleniyor" hali gösterebilsin.)
export function kurulumEksikMi(hata: { code?: string; message?: string } | null | undefined): boolean {
  if (!hata) return false;
  return (
    hata.code === "42P01" ||
    hata.code === "PGRST205" ||
    hata.code === "PGRST202" ||
    hata.code === "42883"
  );
}
