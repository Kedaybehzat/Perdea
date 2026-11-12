// "Ben Kimim?" — veritabanındaki oda_durumu() çıktısının tipleri (web'deki lib/oyun-tipleri.ts ile aynı).
export type Cevap = "evet" | "hayir" | "belki";

export type Oyuncu = {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  sira_no: number;
  durum: "oynuyor" | "bildi" | "pes";
  derece: number | null;
  soru_sayisi: number;
  tahmin_sayisi: number;
  karakter_hazir: boolean;
  yazan_id: string | null;
  karakter: string | null; // kendi karakterin gizliyken null gelir
  eser: string | null;
};

export type Hamle = {
  id: string;
  user_id: string;
  tip: "soru" | "tahmin";
  metin: string;
  dogru: boolean | null;
  created_at: string;
  cevaplar: { user_id: string; cevap: Cevap }[];
};

export type OdaDurumu = {
  uye: true;
  ben: string;
  oda: {
    id: string;
    kod: string;
    ad: string;
    tema: string | null;
    durum: "lobi" | "karakter" | "oyun" | "bitti";
    tur: number;
    kapasite: number;
    acik: boolean;
    kurucu_id: string;
    sira_id: string | null;
    aktif_soru_id: string | null;
  };
  oyuncular: Oyuncu[];
  hamleler: Hamle[];
};

export type OdaOnizleme = {
  uye: false;
  oda: { kod: string; ad: string; tema: string | null; durum: string; kapasite: number; oyuncu_sayisi: number; kurucu: string | null };
};

export type OdaSatiri = { kod: string; ad: string; tema: string | null; oyuncu_sayisi: number; kapasite: number; kurucu?: string; durum?: string };

export const oyuncuAdi = (o: { display_name: string | null; username: string }) => o.display_name || o.username;
