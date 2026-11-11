// Bildirimler: satırları veritabanı tetikleyicileri yazar; burada yalnızca okunur.
import { createClient } from "@/lib/supabase/server";

export type BildirimTuru = "eslesme" | "entry_begeni" | "gonderi_begeni" | "baslik_entry" | "bulusma_katilim";

export type Bildirim = {
  id: number;
  tur: BildirimTuru;
  baglanti: string;
  ozet: string | null;
  okundu: boolean;
  created_at: string;
  aktor: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

export type BildirimOzeti = { mesaj: number; bildirim: number };

export async function bildirimOzeti(): Promise<BildirimOzeti> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("bildirim_ozeti");
  if (error || !data) {
    // Bildirim tablosu henüz yoksa en azından okunmamış mesajı göster.
    const { data: mesaj } = await supabase.rpc("okunmamis_sayisi");
    return { mesaj: Number(mesaj ?? 0), bildirim: 0 };
  }
  const o = data as { mesaj?: number; bildirim?: number };
  return { mesaj: Number(o.mesaj ?? 0), bildirim: Number(o.bildirim ?? 0) };
}

export async function bildirimlerim(): Promise<{ bildirimler: Bildirim[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("bildirimlerim", { p_limit: 60 });
  if (error) return { bildirimler: [], kurulumEksik: true };
  return { bildirimler: (data ?? []) as Bildirim[], kurulumEksik: false };
}

export async function bildirimleriOkunduSay(): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("bildirimleri_okundu_say");
}

// "X seni beğendi" cümlesi.
export function bildirimMetni(b: Bildirim): string {
  const ad = b.aktor?.display_name || b.aktor?.username || "Biri";
  switch (b.tur) {
    case "eslesme":
      return `${ad} ile eşleştiniz. İlk mesajı sen yaz.`;
    case "entry_begeni":
      return `${ad} entry’ni beğendi.`;
    case "gonderi_begeni":
      return `${ad} gönderini beğendi.`;
    case "baslik_entry":
      return `${ad} açtığın başlığa yazdı.`;
    case "bulusma_katilim":
      return `${ad} buluşmana katılıyor.`;
  }
}
