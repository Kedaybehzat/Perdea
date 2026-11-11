'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as oyun from "@/lib/oyun";
import type { Cevap } from "@/lib/oyun-tipleri";

export type FormDurumu = { hata?: string };
type Sonuc = { hata?: string };

function tazele(kod: string) {
  revalidatePath(`/oyun/${kod}`);
}

// ---- lobi ------------------------------------------------------------------

export async function odaKurAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await oyun.odaKur({
    ad: String(formData.get("ad") ?? ""),
    tema: String(formData.get("tema") ?? ""),
    acik: formData.get("gizli") !== "on",
    kapasite: Number(formData.get("kapasite") ?? 6),
  });
  if (sonuc.hata || !sonuc.kod) return { hata: sonuc.hata ?? "Oda kurulamadı." };
  revalidatePath("/oyun");
  redirect(`/oyun/${sonuc.kod}`);
}

export async function kodlaKatilAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await oyun.odayaKatil(String(formData.get("kod") ?? ""));
  if (sonuc.hata || !sonuc.kod) return { hata: sonuc.hata ?? "Odaya girilemedi." };
  redirect(`/oyun/${sonuc.kod}`);
}

// Liste ve davet ekranındaki "Katıl" düğmesi (form action, kod bind edilir).
export async function odayaKatilAction(kod: string): Promise<void> {
  const sonuc = await oyun.odayaKatil(kod);
  if (sonuc.hata) redirect(`/oyun?hata=${encodeURIComponent(sonuc.hata)}`);
  tazele(kod);
  redirect(`/oyun/${sonuc.kod}`);
}

export async function odadanAyrilAction(kod: string): Promise<Sonuc> {
  const sonuc = await oyun.odadanAyril(kod);
  if (sonuc.hata) return sonuc;
  revalidatePath("/oyun");
  redirect("/oyun");
}

// ---- oda içi -----------------------------------------------------------------

export async function oyuncuCikarAction(kod: string, userId: string): Promise<Sonuc> {
  const sonuc = await oyun.oyuncuCikar(kod, userId);
  tazele(kod);
  return sonuc;
}

export async function oyunuBaslatAction(kod: string): Promise<Sonuc> {
  const sonuc = await oyun.oyunuBaslat(kod);
  tazele(kod);
  return sonuc;
}

export async function lobiyeDonAction(kod: string): Promise<Sonuc> {
  const sonuc = await oyun.lobiyeDon(kod);
  tazele(kod);
  return sonuc;
}

export async function karakterYazAction(kod: string, karakter: string, eser: string): Promise<Sonuc> {
  const sonuc = await oyun.karakterYaz(kod, karakter, eser);
  tazele(kod);
  return sonuc;
}

export async function soruSorAction(kod: string, metin: string): Promise<Sonuc> {
  const sonuc = await oyun.soruSor(kod, metin);
  tazele(kod);
  return sonuc;
}

export async function cevapVerAction(kod: string, hamleId: string, cevap: Cevap): Promise<Sonuc> {
  const sonuc = await oyun.cevapVer(hamleId, cevap);
  tazele(kod);
  return sonuc;
}

export async function sirayiDevretAction(kod: string): Promise<Sonuc> {
  const sonuc = await oyun.sirayiDevret(kod);
  tazele(kod);
  return sonuc;
}

export async function tahminEtAction(kod: string, metin: string): Promise<{ hata?: string; tuttu?: boolean }> {
  const sonuc = await oyun.tahminEt(kod, metin);
  tazele(kod);
  return sonuc;
}

export async function tahminiOnaylaAction(kod: string, hamleId: string): Promise<Sonuc> {
  const sonuc = await oyun.tahminiOnayla(hamleId);
  tazele(kod);
  return sonuc;
}

export async function pesEtAction(kod: string): Promise<Sonuc> {
  const sonuc = await oyun.pesEt(kod);
  tazele(kod);
  return sonuc;
}
