// Akış: kısa gönderiler.
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";

export type Gonderi = {
  id: string;
  user_id: string;
  icerik: string;
  created_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  begeni_sayisi: number;
};

export async function gonderileriGetir(limit = 50): Promise<{ gonderiler: Gonderi[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gonderi_ozet")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { gonderiler: [], kurulumEksik: kurulumEksikMi(error) };
  return { gonderiler: (data ?? []) as Gonderi[], kurulumEksik: false };
}

export async function begendigimGonderiler(idler: string[]): Promise<Set<string>> {
  if (!idler.length) return new Set();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("gonderi_begeni")
    .select("gonderi_id")
    .eq("user_id", user.id)
    .in("gonderi_id", idler);
  return new Set((data ?? []).map((r) => r.gonderi_id as string));
}

export async function gonderiYaz(icerik: string): Promise<{ hata?: string }> {
  const metin = icerik.trim();
  if (!metin) return { hata: "Bir şeyler yaz." };
  if (metin.length > 500) return { hata: "Gönderi en çok 500 karakter olabilir." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase.from("gonderiler").insert({ user_id: user.id, icerik: metin });
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function gonderiSil(id: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gonderiler").delete().eq("id", id);
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function gonderiBegeniDegistir(id: string, begen: boolean): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = begen
    ? await supabase
        .from("gonderi_begeni")
        .upsert({ gonderi_id: id, user_id: user.id }, { onConflict: "gonderi_id,user_id", ignoreDuplicates: true })
    : await supabase.from("gonderi_begeni").delete().eq("gonderi_id", id).eq("user_id", user.id);
  if (error) return { hata: hataMesaji(error) };
  return {};
}
