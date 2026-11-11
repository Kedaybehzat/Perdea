// Cosplay buluşmaları. İlanları yalnızca giriş yapanlar görür (RLS).
// Katılma, kontenjanı atomik denetleyen bulusmaya_katil() fonksiyonundan geçer.
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";
import { sehirGecerliMi } from "@/lib/sehirler";
import { yerelGirdidenIso } from "@/lib/zaman";

export type Bulusma = {
  id: string;
  duzenleyen_id: string;
  baslik: string;
  aciklama: string | null;
  tema: string | null;
  sehir: string;
  mekan: string;
  zaman: string;
  kontenjan: number | null;
  durum: "acik" | "iptal";
  created_at: string;
  katilimci_sayisi: number;
};

export type Katilimci = {
  user_id: string;
  karakter: string | null;
  created_at: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export async function bulusmalariListele(secenek: {
  sehir?: string;
  gecmis?: boolean;
  limit?: number;
}): Promise<{ bulusmalar: Bulusma[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  // Başlamasının üstünden 3 saat geçene kadar "yaklaşan" sayılır.
  const esik = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  let sorgu = supabase.from("bulusma_ozet").select("*");
  if (secenek.sehir) sorgu = sorgu.eq("sehir", secenek.sehir);
  sorgu = secenek.gecmis
    ? sorgu.lt("zaman", esik).order("zaman", { ascending: false })
    : sorgu.gte("zaman", esik).order("zaman", { ascending: true });
  const { data, error } = await sorgu.limit(secenek.limit ?? 60);
  if (error) return { bulusmalar: [], kurulumEksik: kurulumEksikMi(error) };
  return { bulusmalar: (data ?? []) as Bulusma[], kurulumEksik: false };
}

export async function bulusmaGetir(id: string): Promise<Bulusma | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("bulusma_ozet").select("*").eq("id", id).maybeSingle();
  return (data as Bulusma | null) ?? null;
}

export async function bulusmaKatilimcilari(bulusmaId: string): Promise<Katilimci[]> {
  const supabase = await createClient();
  const { data: satirlar } = await supabase
    .from("bulusma_katilimcilari")
    .select("user_id, karakter, created_at")
    .eq("bulusma_id", bulusmaId)
    .order("created_at", { ascending: true });
  const liste = satirlar ?? [];
  if (!liste.length) return [];
  const { data: kisiler } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url")
    .in("id", liste.map((s) => s.user_id));
  const harita = new Map((kisiler ?? []).map((k) => [k.id as string, k]));
  return liste.flatMap((s) => {
    const k = harita.get(s.user_id as string);
    if (!k) return [];
    return [{
      user_id: s.user_id as string,
      karakter: s.karakter as string | null,
      created_at: s.created_at as string,
      username: k.username as string,
      display_name: k.display_name as string | null,
      avatar_url: k.avatar_url as string | null,
    }];
  });
}

export type BulusmaGirdisi = {
  baslik: string;
  aciklama: string;
  tema: string;
  sehir: string;
  mekan: string;
  zamanYerel: string; // datetime-local değeri (Türkiye saati)
  kontenjan: string;
};

export async function bulusmaOlustur(g: BulusmaGirdisi): Promise<{ hata?: string; id?: string }> {
  const baslik = g.baslik.trim();
  const mekan = g.mekan.trim();
  const aciklama = g.aciklama.trim() || null;
  const tema = g.tema.trim() || null;
  if (baslik.length < 4 || baslik.length > 90) return { hata: "Başlık 4–90 karakter olmalı." };
  if (!sehirGecerliMi(g.sehir)) return { hata: "Listeden bir şehir seç." };
  if (mekan.length < 3 || mekan.length > 120) return { hata: "Buluşma yerini yaz (3–120 karakter)." };
  if (aciklama && aciklama.length > 1500) return { hata: "Açıklama en fazla 1500 karakter olabilir." };
  if (tema && tema.length > 80) return { hata: "Tema en fazla 80 karakter olabilir." };

  const zaman = yerelGirdidenIso(g.zamanYerel);
  if (!zaman) return { hata: "Tarih ve saat seç." };
  if (new Date(zaman).getTime() < Date.now() + 60 * 60 * 1000) {
    return { hata: "Buluşma en az 1 saat sonrasına olmalı." };
  }

  let kontenjan: number | null = null;
  if (g.kontenjan.trim()) {
    kontenjan = Number(g.kontenjan);
    if (!Number.isInteger(kontenjan) || kontenjan < 2 || kontenjan > 500) {
      return { hata: "Kontenjan 2–500 arasında olmalı (ya da boş bırak)." };
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Buluşma açmak için giriş yapmalısın." };

  const { data, error } = await supabase
    .from("bulusmalar")
    .insert({ duzenleyen_id: user.id, baslik, aciklama, tema, sehir: g.sehir, mekan, zaman, kontenjan })
    .select("id")
    .single();
  if (error) return { hata: hataMesaji(error) };
  return { id: data.id as string };
}

export async function bulusmayaKatil(bulusmaId: string, karakter: string): Promise<{ hata?: string }> {
  if (karakter.trim().length > 60) return { hata: "Karakter adı en fazla 60 karakter olabilir." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("bulusmaya_katil", {
    p_bulusma: bulusmaId,
    p_karakter: karakter.trim() || null,
  });
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function bulusmadanAyril(bulusmaId: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("bulusma_katilimcilari")
    .delete()
    .eq("bulusma_id", bulusmaId)
    .eq("user_id", user.id);
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export async function bulusmayiIptalEt(bulusmaId: string): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  // RLS: yalnızca düzenleyen güncelleyebilir.
  const { data, error } = await supabase
    .from("bulusmalar")
    .update({ durum: "iptal" })
    .eq("id", bulusmaId)
    .eq("duzenleyen_id", user.id)
    .select("id");
  if (error) return { hata: hataMesaji(error) };
  if (!data?.length) return { hata: "Bu buluşmayı yalnızca düzenleyen iptal edebilir." };
  return {};
}

export async function sikayetEt(
  hedefTur: "bulusma" | "salon" | "salon_yorumu" | "oda" | "kullanici",
  hedefId: string,
  sebep: string
): Promise<{ hata?: string }> {
  const s = sebep.trim();
  if (s.length < 5 || s.length > 500) return { hata: "Sebebi 5–500 karakterle anlat." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("sikayetler")
    .insert({ bildiren_id: user.id, hedef_tur: hedefTur, hedef_id: hedefId, sebep: s });
  if (error) return { hata: hataMesaji(error) };
  return {};
}
