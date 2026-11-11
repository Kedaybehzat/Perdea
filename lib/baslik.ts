// Başlıklar ve entry'ler.
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";

export type BaslikOzeti = {
  id: string;
  baslik: string;
  slug: string;
  created_at: string;
  son_entry_at: string;
  entry_sayisi: number;
  bugun: number;
};

export type Entry = {
  id: string;
  baslik_id: string;
  user_id: string;
  icerik: string;
  created_at: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  baslik: string;
  slug: string;
  begeni_sayisi: number;
};

export async function basliklariListele(secenek: {
  q?: string;
  sirala?: "gundem" | "yeni" | "kalabalik";
  limit?: number;
}): Promise<{ basliklar: BaslikOzeti[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  let sorgu = supabase.from("baslik_ozet").select("*");
  const q = (secenek.q ?? "").trim().toLocaleLowerCase("tr-TR").replace(/[%_,()]/g, " ");
  if (q) sorgu = sorgu.ilike("baslik", `%${q}%`);
  if (secenek.sirala === "yeni") sorgu = sorgu.order("created_at", { ascending: false });
  else if (secenek.sirala === "kalabalik") sorgu = sorgu.order("entry_sayisi", { ascending: false });
  else sorgu = sorgu.order("bugun", { ascending: false }).order("son_entry_at", { ascending: false });
  const { data, error } = await sorgu.limit(secenek.limit ?? 50);
  if (error) return { basliklar: [], kurulumEksik: kurulumEksikMi(error) };
  return { basliklar: (data ?? []) as BaslikOzeti[], kurulumEksik: false };
}

export async function baslikGetir(slug: string): Promise<BaslikOzeti | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("baslik_ozet").select("*").eq("slug", slug).maybeSingle();
  return (data as BaslikOzeti | null) ?? null;
}

export async function entryleriGetir(
  baslikId: string,
  sirala: "eski" | "yeni" | "begeni" = "eski"
): Promise<Entry[]> {
  const supabase = await createClient();
  let sorgu = supabase.from("entry_ozet").select("*").eq("baslik_id", baslikId);
  if (sirala === "begeni") sorgu = sorgu.order("begeni_sayisi", { ascending: false });
  sorgu = sorgu.order("created_at", { ascending: sirala === "eski" });
  const { data } = await sorgu.limit(200);
  return (data ?? []) as Entry[];
}

export async function sonEntryler(limit = 6): Promise<Entry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entry_ozet")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Entry[];
}

// Verilen entry'lerden hangilerini ben beğendim?
export async function begendigimEntryler(entryIdleri: string[]): Promise<Set<string>> {
  if (!entryIdleri.length) return new Set();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("entry_begeni")
    .select("entry_id")
    .eq("user_id", user.id)
    .in("entry_id", entryIdleri);
  return new Set((data ?? []).map((r) => r.entry_id as string));
}

export async function baslikAc(baslik: string, entry: string): Promise<{ hata?: string; slug?: string }> {
  const ad = baslik.trim().replace(/\s+/g, " ");
  const metin = entry.trim();
  if (ad.length < 3 || ad.length > 80) return { hata: "Başlık 3–80 karakter olmalı." };
  if (metin.length < 2) return { hata: "İlk entry'yi de yaz; başlık tek başına açılmıyor." };
  if (metin.length > 2000) return { hata: "Entry en çok 2000 karakter olabilir." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("baslik_ac", { p_baslik: ad, p_entry: metin });
  if (error || !data) return { hata: hataMesaji(error) };
  return { slug: data as string };
}

export async function entryYaz(baslikId: string, icerik: string): Promise<{ hata?: string }> {
  const metin = icerik.trim();
  if (metin.length < 2) return { hata: "Entry çok kısa." };
  if (metin.length > 2000) return { hata: "Entry en çok 2000 karakter olabilir." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("entryler")
    .insert({ baslik_id: baslikId, user_id: user.id, icerik: metin });
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function entrySil(entryId: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("entryler").delete().eq("id", entryId);
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function entryBegeniDegistir(entryId: string, begen: boolean): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = begen
    ? await supabase
        .from("entry_begeni")
        .upsert({ entry_id: entryId, user_id: user.id }, { onConflict: "entry_id,user_id", ignoreDuplicates: true })
    : await supabase.from("entry_begeni").delete().eq("entry_id", entryId).eq("user_id", user.id);
  if (error) return { hata: hataMesaji(error) };
  return {};
}
