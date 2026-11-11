// Sohbet tipleri (client bileşenleri de kullanır; sunucu kodu içermez).
export type Kisi = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type SohbetOzeti = {
  id: string;
  diger: Kisi;
  son_mesaj: { icerik: string; tur?: MesajTuru; benden: boolean; created_at: string } | null;
  okunmamis: number;
  engelli: boolean;
};

export type MesajTuru = "metin" | "gorsel" | "ses";

export type Mesaj = {
  id: number;
  gonderen_id: string;
  icerik: string;
  created_at: string;
  tur: MesajTuru;
  sure_sn: number | null;
  // Görsel/ses için kısa ömürlü (1 saat) imzalı adres; sunucuda üretilir.
  medya_url: string | null;
};

export const MEDYA_KOVASI = "sohbet-medya";

// Liste satırında son mesajın özeti.
export function mesajOzeti(m: { icerik: string; tur?: MesajTuru }): string {
  if (m.tur === "gorsel") return "Fotoğraf";
  if (m.tur === "ses") return "Sesli mesaj";
  return m.icerik;
}

export function kisiAdi(k: Kisi): string {
  return k.display_name || k.username || "Perdea üyesi";
}
