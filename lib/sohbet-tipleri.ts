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
  son_mesaj: { icerik: string; benden: boolean; created_at: string } | null;
  okunmamis: number;
  engelli: boolean;
};

export type Mesaj = {
  id: number;
  gonderen_id: string;
  icerik: string;
  created_at: string;
};

export function kisiAdi(k: Kisi): string {
  return k.display_name || k.username || "Perdea üyesi";
}
