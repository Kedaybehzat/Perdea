'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OLCUTLER, salonEkle, salonPuanla, salonPuaniniSil, type OlcutAnahtari } from "@/lib/sinema";
import { sikayetEt } from "@/lib/bulusma";

export type FormDurumu = { hata?: string; tamam?: string };

export async function salonEkleAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await salonEkle({
    ad: String(formData.get("ad") ?? ""),
    sehir: String(formData.get("sehir") ?? ""),
    ilce: String(formData.get("ilce") ?? ""),
    zincir: String(formData.get("zincir") ?? ""),
  });
  if (sonuc.hata || !sonuc.id) return { hata: sonuc.hata ?? "Salon eklenemedi." };
  revalidatePath("/salonlar");
  redirect(`/salonlar/${sonuc.id}`);
}

export async function salonPuanlaAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sinemaId = String(formData.get("sinemaId") ?? "");
  const puanlar = {} as Record<OlcutAnahtari, number>;
  for (const o of OLCUTLER) puanlar[o.anahtar] = Number(formData.get(o.anahtar) ?? 0);
  const sonuc = await salonPuanla(sinemaId, puanlar, String(formData.get("yorum") ?? ""));
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath(`/salonlar/${sinemaId}`);
  revalidatePath("/salonlar");
  return { tamam: "Puanın kaydedildi." };
}

export async function salonPuaniSilAction(sinemaId: string): Promise<FormDurumu> {
  const sonuc = await salonPuaniniSil(sinemaId);
  if (sonuc.hata) return { hata: sonuc.hata };
  revalidatePath(`/salonlar/${sinemaId}`);
  revalidatePath("/salonlar");
  return { tamam: "Puanın kaldırıldı." };
}

export async function salonSikayetAction(_onceki: FormDurumu, formData: FormData): Promise<FormDurumu> {
  const sonuc = await sikayetEt(
    "salon",
    String(formData.get("hedefId") ?? ""),
    String(formData.get("sebep") ?? "")
  );
  if (sonuc.hata) return { hata: sonuc.hata };
  return { tamam: "Bildirimin alındı, teşekkürler." };
}
