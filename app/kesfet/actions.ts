'use server'

import { revalidatePath } from "next/cache";
import { favoriToggle } from "@/lib/favori";
import { puanVer, puaniSil } from "@/lib/puan";

export async function favoriDegistir(movieId: number) {
  const sonuc = await favoriToggle(movieId);
  revalidatePath("/kesfet");
  revalidatePath("/profil");
  return sonuc;
}

export async function puanKaydet(movieId: number, score: number) {
  const sonuc = await puanVer(movieId, score);
  revalidatePath("/kesfet");
  revalidatePath("/profil");
  return sonuc;
}

export async function puanTemizle(movieId: number) {
  const sonuc = await puaniSil(movieId);
  revalidatePath("/kesfet");
  revalidatePath("/profil");
  return sonuc;
}
