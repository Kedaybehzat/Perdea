// Salon puanlama — sinema salonları ve 5 ölçütlü puanlar.
// Okuma herkese açık; yazma RLS ile giriş yapan kullanıcıya bağlı.
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";
import { sehirGecerliMi } from "@/lib/sehirler";

import { OLCUTLER, type OlcutAnahtari, type SalonOzet, type SalonPuani, type SalonYorumu } from "@/lib/sinema-tipleri";

export { OLCUTLER };
export type { OlcutAnahtari, SalonOzet, SalonPuani, SalonYorumu };

export type SalonSirasi = "puan" | "yeni" | "populer";

export async function salonlariListele(secenek: {
  sehir?: string;
  q?: string;
  sira?: SalonSirasi;
}): Promise<{ salonlar: SalonOzet[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  let sorgu = supabase.from("sinema_ozet").select("*");
  if (secenek.sehir) sorgu = sorgu.eq("sehir", secenek.sehir);
  if (secenek.q) {
    // PostgREST filtresini bozabilecek karakterleri ayıkla.
    const temiz = secenek.q.replace(/[%,()*\\]/g, " ").trim();
    if (temiz) sorgu = sorgu.ilike("ad", `%${temiz}%`);
  }
  const sira = secenek.sira ?? "puan";
  if (sira === "yeni") sorgu = sorgu.order("created_at", { ascending: false });
  else if (sira === "populer") sorgu = sorgu.order("puan_sayisi", { ascending: false });
  else sorgu = sorgu.order("genel", { ascending: false, nullsFirst: false }).order("puan_sayisi", { ascending: false });

  const { data, error } = await sorgu.limit(60);
  if (error) return { salonlar: [], kurulumEksik: kurulumEksikMi(error) };
  return { salonlar: (data ?? []) as SalonOzet[], kurulumEksik: false };
}

export async function salonGetir(id: string): Promise<SalonOzet | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("sinema_ozet").select("*").eq("id", id).maybeSingle();
  return (data as SalonOzet | null) ?? null;
}

export async function salonYorumlari(sinemaId: string): Promise<SalonYorumu[]> {
  const supabase = await createClient();
  const { data: puanlar } = await supabase
    .from("sinema_puanlari")
    .select("*")
    .eq("sinema_id", sinemaId)
    .order("updated_at", { ascending: false })
    .limit(50);
  const liste = (puanlar ?? []) as SalonPuani[];
  if (!liste.length) return [];
  const { data: yazarlar } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .in("id", liste.map((p) => p.user_id));
  const harita = new Map((yazarlar ?? []).map((y) => [y.id as string, y]));
  return liste.map((p) => {
    const y = harita.get(p.user_id);
    return {
      ...p,
      yazar: y
        ? { username: y.username, display_name: y.display_name, avatar_url: y.avatar_url }
        : null,
    };
  });
}

export async function benimSalonPuanim(sinemaId: string): Promise<SalonPuani | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("sinema_puanlari")
    .select("*")
    .eq("sinema_id", sinemaId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as SalonPuani | null) ?? null;
}

export async function salonEkle(girdi: {
  ad: string;
  sehir: string;
  ilce?: string;
  zincir?: string;
}): Promise<{ hata?: string; id?: string }> {
  const ad = girdi.ad.trim();
  const ilce = girdi.ilce?.trim() || null;
  const zincir = girdi.zincir?.trim() || null;
  if (ad.length < 2 || ad.length > 80) return { hata: "Salon adı 2–80 karakter olmalı." };
  if (!sehirGecerliMi(girdi.sehir)) return { hata: "Listeden bir şehir seç." };
  if (ilce && ilce.length > 40) return { hata: "İlçe adı çok uzun." };
  if (zincir && zincir.length > 40) return { hata: "Zincir adı çok uzun." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Salon eklemek için giriş yapmalısın." };

  const { data, error } = await supabase
    .from("sinemalar")
    .insert({ ad, sehir: girdi.sehir, ilce, zincir, ekleyen_id: user.id })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { hata: "Bu salon bu şehirde zaten kayıtlı. Listeden bulup puanlayabilirsin." };
    return { hata: hataMesaji(error) };
  }
  return { id: data.id as string };
}

export async function salonPuanla(
  sinemaId: string,
  puanlar: Record<OlcutAnahtari, number>,
  yorum: string
): Promise<{ hata?: string }> {
  for (const o of OLCUTLER) {
    const v = puanlar[o.anahtar];
    if (!Number.isInteger(v) || v < 1 || v > 5) return { hata: `"${o.etiket}" için 1–5 arası puan ver.` };
  }
  const y = yorum.trim();
  if (y.length > 600) return { hata: "Yorum en fazla 600 karakter olabilir." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Puan vermek için giriş yapmalısın." };

  const { error } = await supabase.from("sinema_puanlari").upsert(
    {
      sinema_id: sinemaId,
      user_id: user.id,
      ...puanlar,
      yorum: y || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sinema_id,user_id" }
  );
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function salonPuaniniSil(sinemaId: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("sinema_puanlari")
    .delete()
    .eq("sinema_id", sinemaId)
    .eq("user_id", user.id);
  if (error) return { hata: hataMesaji(error) };
  return {};
}

// Puanlanmış salonu olan şehirler (filtre için), salon sayısıyla.
export async function salonSehirleri(): Promise<{ sehir: string; adet: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sinemalar").select("sehir").limit(2000);
  const sayac = new Map<string, number>();
  (data ?? []).forEach((r) => sayac.set(r.sehir as string, (sayac.get(r.sehir as string) ?? 0) + 1));
  return [...sayac.entries()]
    .map(([sehir, adet]) => ({ sehir, adet }))
    .sort((a, b) => b.adet - a.adet || a.sehir.localeCompare(b.sehir, "tr"));
}
