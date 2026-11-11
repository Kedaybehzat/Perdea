// Birebir sohbet. Yazma işlemleri veritabanı fonksiyonlarıyla (RPC) yapılır;
// kimin kiminle yazışabileceğine veritabanı karar verir (karşılıklı eşleşme + engel).
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";
import { MEDYA_KOVASI, type Kisi, type Mesaj, type MesajTuru, type SohbetOzeti } from "@/lib/sohbet-tipleri";

export async function sohbetlerim(): Promise<{ sohbetler: SohbetOzeti[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("sohbetlerim");
  if (error) return { sohbetler: [], kurulumEksik: kurulumEksikMi(error) };
  return { sohbetler: (data ?? []) as SohbetOzeti[], kurulumEksik: false };
}

export async function eslesmelerim(): Promise<Kisi[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("eslesmelerim");
  if (error) return [];
  return (data ?? []) as Kisi[];
}

export async function okunmamisSayisi(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("okunmamis_sayisi");
  if (error) return 0;
  return Number(data ?? 0);
}

export async function mesajlariGetir(sohbetId: string, limit = 200): Promise<Mesaj[]> {
  const supabase = await createClient();
  type Satir = {
    id: number;
    gonderen_id: string;
    icerik: string;
    created_at: string;
    tur?: MesajTuru;
    medya_yolu?: string | null;
    sure_sn?: number | null;
  };
  let satirlar: Satir[] = [];
  const yeni = await supabase
    .from("mesajlar")
    .select("id, gonderen_id, icerik, created_at, tur, medya_yolu, sure_sn")
    .eq("sohbet_id", sohbetId)
    .order("id", { ascending: false })
    .limit(limit);
  if (yeni.error) {
    // Medya sütunları henüz yoksa (son migration çalışmadıysa) yalnızca metinle devam et.
    const eski = await supabase
      .from("mesajlar")
      .select("id, gonderen_id, icerik, created_at")
      .eq("sohbet_id", sohbetId)
      .order("id", { ascending: false })
      .limit(limit);
    satirlar = (eski.data ?? []) as Satir[];
  } else {
    satirlar = (yeni.data ?? []) as Satir[];
  }
  satirlar.reverse();

  // Medya dosyaları özel kovada; görüntülemek için kısa ömürlü imzalı adres üret.
  const yollar = satirlar.map((m) => m.medya_yolu).filter((y): y is string => Boolean(y));
  const adresler = new Map<string, string>();
  if (yollar.length) {
    const { data } = await supabase.storage.from(MEDYA_KOVASI).createSignedUrls(yollar, 3600);
    for (const d of data ?? []) {
      if (d.path && d.signedUrl) adresler.set(d.path, d.signedUrl);
    }
  }

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

export async function medyaMesajiGonder(
  sohbetId: string,
  tur: "gorsel" | "ses",
  yol: string,
  sureSn?: number
): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("medya_mesaji_gonder", {
    p_sohbet: sohbetId,
    p_tur: tur,
    p_yol: yol,
    p_sure: sureSn ?? null,
  });
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function sohbetAc(digerId: string): Promise<{ hata?: string; id?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("sohbet_ac", { p_diger: digerId });
  if (error || !data) return { hata: hataMesaji(error) };
  return { id: data as string };
}

export async function mesajGonder(sohbetId: string, icerik: string): Promise<{ hata?: string }> {
  const metin = icerik.trim();
  if (!metin) return { hata: "Boş mesaj gönderilemez." };
  if (metin.length > 1000) return { hata: "Mesaj en çok 1000 karakter olabilir." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("mesaj_gonder", { p_sohbet: sohbetId, p_icerik: metin });
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function sohbetOkundu(sohbetId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("sohbet_okundu", { p_sohbet: sohbetId });
}

export async function engelle(kisiId: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("engeller")
    .upsert({ engelleyen_id: user.id, engellenen_id: kisiId }, { onConflict: "engelleyen_id,engellenen_id", ignoreDuplicates: true });
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function engeliKaldir(kisiId: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("engeller")
    .delete()
    .eq("engelleyen_id", user.id)
    .eq("engellenen_id", kisiId);
  if (error) return { hata: hataMesaji(error) };
  return {};
}

// Bu kişiyi ben mi engelledim? (Karşı tarafın engeli bize görünmez; bilerek.)
export async function benEngelledimMi(kisiId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("engeller")
    .select("engellenen_id")
    .eq("engellenen_id", kisiId)
    .maybeSingle();
  return Boolean(data);
}
