// Birebir sohbet. Yazma işlemleri veritabanı fonksiyonlarıyla (RPC) yapılır;
// kimin kiminle yazışabileceğine veritabanı karar verir (karşılıklı eşleşme + engel).
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";
import type { Kisi, Mesaj, SohbetOzeti } from "@/lib/sohbet-tipleri";

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
  const { data } = await supabase
    .from("mesajlar")
    .select("id, gonderen_id, icerik, created_at")
    .eq("sohbet_id", sohbetId)
    .order("id", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Mesaj[]).reverse();
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
