'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  bulusmaOlustur,
  bulusmayaKatil,
  bulusmadanAyril,
  bulusmayiIptalEt,
  sikayetEt,
} from "@/lib/bulusma";

export type FormDurumu = { hata?: string; tamam?: string };

export async function bulusmaOlusturAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await bulusmaOlustur({
    baslik: String(formData.get("baslik") ?? ""),
    aciklama: String(formData.get("aciklama") ?? ""),
    tema: String(formData.get("tema") ?? ""),
    sehir: String(formData.get("sehir") ?? ""),
    mekan: String(formData.get("mekan") ?? ""),
    zamanYerel: String(formData.get("zaman") ?? ""),
    kontenjan: String(formData.get("kontenjan") ?? ""),
  });
  if (sonuc.hata || !sonuc.id) return { hata: sonuc.hata ?? "Buluşma oluşturulamadı." };
  revalidatePath("/cosplay");
  redirect(`/cosplay/${sonuc.id}`);
}

export async function katilAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const id = String(formData.get("bulusmaId") ?? "");
  const sonuc = await bulusmayaKatil(id, String(formData.get("karakter") ?? ""));
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath(`/cosplay/${id}`);
  revalidatePath("/cosplay");
  return { tamam: "Listedesin. Görüşmek üzere!" };
}

export async function ayrilAction(bulusmaId: string): Promise<FormDurumu> {
  const sonuc = await bulusmadanAyril(bulusmaId);
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath(`/cosplay/${bulusmaId}`);
  revalidatePath("/cosplay");
  return { tamam: "Katılımın kaldırıldı." };
}

export async function iptalAction(bulusmaId: string): Promise<FormDurumu> {
  const sonuc = await bulusmayiIptalEt(bulusmaId);
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath(`/cosplay/${bulusmaId}`);
  revalidatePath("/cosplay");
  return { tamam: "Buluşma iptal edildi." };
}

export async function bulusmaSikayetAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await sikayetEt(
    "bulusma",
    String(formData.get("hedefId") ?? ""),
    String(formData.get("sebep") ?? "")
  );
  if (sonuc.hata) return { hata: sonuc.hata };
  return { tamam: "Bildirimin alındı, teşekkürler." };
}
