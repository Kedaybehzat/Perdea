'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { engeliKaldir, engelle, medyaMesajiGonder, mesajGonder, sohbetAc } from "@/lib/sohbet";
import { sikayetEt } from "@/lib/bulusma";

export type FormDurumu = { hata?: string; tamam?: string };

export async function mesajGonderAction(sohbetId: string, icerik: string): Promise<{ hata?: string }> {
  const sonuc = await mesajGonder(sohbetId, icerik);
  if (sonuc.hata) return sonuc;
  revalidatePath(`/sohbet/${sohbetId}`);
  return {};
}

export async function medyaGonderAction(
  sohbetId: string,
  tur: "gorsel" | "ses",
  yol: string,
  sureSn?: number
): Promise<{ hata?: string }> {
  const sonuc = await medyaMesajiGonder(sohbetId, tur, yol, sureSn);
  if (sonuc.hata) return sonuc;
  revalidatePath(`/sohbet/${sohbetId}`);
  return {};
}

export async function sohbetBaslatAction(formData: FormData): Promise<void> {
  const sonuc = await sohbetAc(String(formData.get("kisiId") ?? ""));
  if (sonuc.hata || !sonuc.id) redirect("/sohbet?hata=1");
  revalidatePath("/sohbet");
  redirect(`/sohbet/${sonuc.id}`);
}

export async function engelleAction(kisiId: string, sohbetId: string): Promise<{ hata?: string }> {
  const sonuc = await engelle(kisiId);
  if (sonuc.hata) return sonuc;
  revalidatePath(`/sohbet/${sohbetId}`);
  revalidatePath("/sohbet");
  return {};
}

export async function engelKaldirAction(kisiId: string, sohbetId: string): Promise<{ hata?: string }> {
  const sonuc = await engeliKaldir(kisiId);
  if (sonuc.hata) return sonuc;
  revalidatePath(`/sohbet/${sohbetId}`);
  revalidatePath("/sohbet");
  return {};
}

export async function sohbetSikayetAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await sikayetEt(
    "sohbet",
    String(formData.get("hedefId") ?? ""),
    String(formData.get("sebep") ?? "")
  );
  if (sonuc.hata) return { hata: sonuc.hata };
  return { tamam: "Bildirimin alındı. İstersen bu kişiyi engelleyebilirsin." };
}
