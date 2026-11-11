'use server'

import { revalidatePath } from "next/cache";
import { gonderiBegeniDegistir, gonderiSil, gonderiYaz } from "@/lib/akis";
import { sikayetEt } from "@/lib/bulusma";

export type FormDurumu = { hata?: string; tamam?: string };

export async function gonderiYazAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await gonderiYaz(String(formData.get("icerik") ?? ""));
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath("/topluluk");
  return { tamam: "Paylaşıldı." };
}

export async function gonderiSilAction(id: string): Promise<void> {
  await gonderiSil(id);
  revalidatePath("/topluluk");
}

export async function gonderiBegenAction(id: string, begen: boolean): Promise<{ hata?: string }> {
  return gonderiBegeniDegistir(id, begen);
}

export async function gonderiSikayetAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await sikayetEt("gonderi", String(formData.get("hedefId") ?? ""), String(formData.get("sebep") ?? ""));
  if (sonuc.hata) return { hata: sonuc.hata };
  return { tamam: "Bildirimin alındı, teşekkürler." };
}
