import { supabase } from "./supabase";

export type Kisi = { id: string; username: string | null; display_name: string | null; avatar_url: string | null };

export type SohbetOzeti = {
  id: string;
  diger: Kisi;
  son_mesaj: { icerik: string; tur?: "metin" | "gorsel" | "ses"; benden: boolean; created_at: string } | null;
  okunmamis: number;
  engelli: boolean;
};

export type Mesaj = {
  id: number;
  gonderen_id: string;
  icerik: string;
  created_at: string;
  tur: "metin" | "gorsel" | "ses";
  sure_sn: number | null;
  medya_url: string | null;
};

export const kisiAdi = (k: Kisi) => k.display_name || k.username || "Perdea üyesi";

export function mesajOzeti(m: { icerik: string; tur?: string }): string {
  if (m.tur === "gorsel") return "Fotoğraf";
  if (m.tur === "ses") return "Sesli mesaj";
  return m.icerik;
}

export async function mesajlariGetir(sohbetId: string): Promise<Mesaj[]> {
  type Satir = { id: number; gonderen_id: string; icerik: string; created_at: string; tur?: Mesaj["tur"]; medya_yolu?: string | null; sure_sn?: number | null };
  let satirlar: Satir[];
  const yeni = await supabase
    .from("mesajlar")
    .select("id, gonderen_id, icerik, created_at, tur, medya_yolu, sure_sn")
    .eq("sohbet_id", sohbetId)
    .order("id", { ascending: false })
    .limit(200);
  if (yeni.error) {
    const eski = await supabase
      .from("mesajlar")
      .select("id, gonderen_id, icerik, created_at")
      .eq("sohbet_id", sohbetId)
      .order("id", { ascending: false })
      .limit(200);
    satirlar = (eski.data ?? []) as Satir[];
  } else {
    satirlar = (yeni.data ?? []) as Satir[];
  }

  // Fotoğraf ve sesler özel kovada; kısa ömürlü imzalı adres al.
  const yollar = satirlar.filter((m) => m.medya_yolu).map((m) => m.medya_yolu!);
  const adresler = new Map<string, string>();
  if (yollar.length) {
    const { data } = await supabase.storage.from("sohbet-medya").createSignedUrls(yollar, 3600);
    for (const d of data ?? []) if (d.path && d.signedUrl) adresler.set(d.path, d.signedUrl);
  }
  // Liste ters (en yeni başta) kalır: ekranda "inverted" liste kullanılıyor.
  return satirlar.map((m) => ({
    id: m.id,
    gonderen_id: m.gonderen_id,
    icerik: m.icerik,
    created_at: m.created_at,
    tur: m.tur ?? "metin",
    sure_sn: m.sure_sn ?? null,
    medya_url: m.medya_yolu ? adresler.get(m.medya_yolu) ?? null : null,
  }));
}
