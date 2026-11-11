// Salon puanlama tipleri ve ölçütleri — istemci bileşenleri de kullanır
// (lib/sinema.ts sunucuya özeldir).

export const OLCUTLER = [
  { anahtar: "goruntu", etiket: "Perde & görüntü", kisa: "Görüntü" },
  { anahtar: "ses", etiket: "Ses", kisa: "Ses" },
  { anahtar: "koltuk", etiket: "Koltuk konforu", kisa: "Koltuk" },
  { anahtar: "temizlik", etiket: "Temizlik", kisa: "Temizlik" },
  { anahtar: "fiyat", etiket: "Fiyat / performans", kisa: "Fiyat" },
] as const;

export type OlcutAnahtari = (typeof OLCUTLER)[number]["anahtar"];

export type SalonOzet = {
  id: string;
  ad: string;
  sehir: string;
  ilce: string | null;
  zincir: string | null;
  adres: string | null;
  ekleyen_id: string | null;
  created_at: string;
  puan_sayisi: number;
  genel: number | null;
} & Record<OlcutAnahtari, number | null>;

export type SalonPuani = {
  sinema_id: string;
  user_id: string;
  yorum: string | null;
  created_at: string;
  updated_at: string;
} & Record<OlcutAnahtari, number>;

export type SalonYorumu = SalonPuani & {
  yazar: { username: string; display_name: string | null; avatar_url: string | null } | null;
};
