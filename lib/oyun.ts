// "Ben Kimim?" oyun odaları. Bütün kurallar veritabanı fonksiyonlarında
// (docs/migrations/…_salon_cosplay_oyun.sql); burası ince bir sarmalayıcı.
import { createClient } from "@/lib/supabase/server";
import { hataMesaji, kurulumEksikMi } from "@/lib/hata";
import type { AcikOda, Cevap, OdaDurumu, OdaOnizleme, Odam } from "@/lib/oyun-tipleri";

type Sonuc = { hata?: string };

export async function odaDurumu(kod: string): Promise<{
  durum: OdaDurumu | OdaOnizleme | null;
  hata?: string;
  kurulumEksik?: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("oda_durumu", { p_kod: kod });
  if (error) return { durum: null, hata: hataMesaji(error), kurulumEksik: kurulumEksikMi(error) };
  return { durum: (data as OdaDurumu | OdaOnizleme | null) ?? null };
}

export async function acikOdalar(): Promise<{ odalar: AcikOda[]; kurulumEksik: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("acik_odalar");
  if (error) return { odalar: [], kurulumEksik: kurulumEksikMi(error) };
  return { odalar: (data ?? []) as AcikOda[], kurulumEksik: false };
}

export async function odalarim(): Promise<Odam[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("odalarim");
  if (error) return [];
  return (data ?? []) as Odam[];
}

export async function odaKur(girdi: {
  ad: string;
  tema: string;
  acik: boolean;
  kapasite: number;
}): Promise<{ hata?: string; kod?: string }> {
  const ad = girdi.ad.trim();
  if (ad.length < 2 || ad.length > 50) return { hata: "Oda adı 2–50 karakter olmalı." };
  if (girdi.tema.trim().length > 60) return { hata: "Tema en fazla 60 karakter olabilir." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("oda_kur", {
    p_ad: ad,
    p_tema: girdi.tema.trim() || null,
    p_acik: girdi.acik,
    p_kapasite: girdi.kapasite,
  });
  if (error) return { hata: hataMesaji(error) };
  return { kod: data as string };
}

export async function odayaKatil(kod: string): Promise<{ hata?: string; kod?: string }> {
  const temiz = kod.trim().toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(temiz)) return { hata: "Oda kodu 5 karakter olmalı." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("odaya_katil", { p_kod: temiz });
  if (error) return { hata: hataMesaji(error) };
  return { kod: data as string };
}

async function cagir(fonksiyon: string, parametreler: Record<string, unknown>): Promise<Sonuc> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(fonksiyon, parametreler);
  if (error) return { hata: hataMesaji(error) };
  return {};
}

export const odadanAyril = (kod: string) => cagir("odadan_ayril", { p_kod: kod });
export const oyuncuCikar = (kod: string, userId: string) =>
  cagir("oyuncu_cikar", { p_kod: kod, p_user: userId });
export const oyunuBaslat = (kod: string) => cagir("oyunu_baslat", { p_kod: kod });
export const lobiyeDon = (kod: string) => cagir("lobiye_don", { p_kod: kod });
export const karakterYaz = (kod: string, karakter: string, eser: string) =>
  cagir("karakter_yaz", { p_kod: kod, p_karakter: karakter, p_eser: eser || null });
export const soruSor = (kod: string, metin: string) =>
  cagir("soru_sor", { p_kod: kod, p_metin: metin });
export const cevapVer = (hamleId: string, cevap: Cevap) =>
  cagir("cevap_ver", { p_hamle: hamleId, p_cevap: cevap });
export const sirayiDevret = (kod: string) => cagir("sirayi_devret", { p_kod: kod });
export const tahminiOnayla = (hamleId: string) => cagir("tahmini_onayla", { p_hamle: hamleId });
export const pesEt = (kod: string) => cagir("pes_et", { p_kod: kod });

export async function tahminEt(kod: string, metin: string): Promise<{ hata?: string; tuttu?: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tahmin_et", { p_kod: kod, p_metin: metin });
  if (error) return { hata: hataMesaji(error) };
  return { tuttu: Boolean(data) };
}
