'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { baslikAc, entryBegeniDegistir, entrySil, entryYaz } from "@/lib/baslik";
import { sikayetEt } from "@/lib/bulusma";

export type FormDurumu = { hata?: string; tamam?: string };

export async function baslikAcAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await baslikAc(String(formData.get("baslik") ?? ""), String(formData.get("entry") ?? ""));
  if (sonuc.hata || !sonuc.slug) return { hata: sonuc.hata ?? "Başlık açılamadı." };
  revalidatePath("/baslik");
  redirect(`/baslik/${sonuc.slug}`);
}

export async function entryYazAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const slug = String(formData.get("slug") ?? "");
  const sonuc = await entryYaz(String(formData.get("baslikId") ?? ""), String(formData.get("icerik") ?? ""));
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath(`/baslik/${slug}`);
  revalidatePath("/baslik");
  return { tamam: "Entry eklendi." };
}

export async function entrySilAction(entryId: string, slug: string): Promise<void> {
  await entrySil(entryId);
  revalidatePath(`/baslik/${slug}`);
  revalidatePath("/baslik");
}

export async function entryBegenAction(entryId: string, begen: boolean): Promise<{ hata?: string }> {
  return entryBegeniDegistir(entryId, begen);
}

export async function entrySikayetAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await sikayetEt("entry", String(formData.get("hedefId") ?? ""), String(formData.get("sebep") ?? ""));
  if (sonuc.hata) return { hata: sonuc.hata };
  return { tamam: "Bildirimin alındı, teşekkürler." };
}
