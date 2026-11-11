// "Ben Kimim?" oda durumu — veritabanındaki oda_durumu() fonksiyonunun döndürdüğü
// JSON'un tipleri. İstemci bileşenleri de kullandığı için sunucu kodundan ayrı.

export type OdaAsamasi = "lobi" | "karakter" | "oyun" | "bitti";
export type Cevap = "evet" | "hayir" | "belki";

export type OdaOyuncusu = {
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

export type OdaHamlesi = {
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
    durum: OdaAsamasi;
    tur: number;
    kapasite: number;
    acik: boolean;
    kurucu_id: string;
    sira_id: string | null;
    aktif_soru_id: string | null;
    guncellendi: string;
  };
  oyuncular: OdaOyuncusu[];
  hamleler: OdaHamlesi[];
};

export type OdaOnizleme = {
  uye: false;
  oda: {
    kod: string;
    ad: string;
    tema: string | null;
    durum: OdaAsamasi;
    kapasite: number;
    oyuncu_sayisi: number;
    kurucu: string | null;
  };
};

export type AcikOda = {
  kod: string;
  ad: string;
  tema: string | null;
  kurucu: string;
  oyuncu_sayisi: number;
  kapasite: number;
  created_at: string;
};

export type Odam = {
  kod: string;
  ad: string;
  tema: string | null;
  durum: OdaAsamasi;
  oyuncu_sayisi: number;
  kapasite: number;
  guncellendi: string;
};

export function oyuncuAdi(o: { display_name: string | null; username: string }): string {
  return o.display_name || o.username;
}
