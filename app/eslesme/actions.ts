'use server'

import { revalidatePath } from "next/cache";
import { kararVer, type Karar } from "@/lib/matches";

export async function kararKaydet(adayId: string, karar: Karar) {
  const sonuc = await kararVer(adayId, karar);
  revalidatePath("/eslesme");
  return sonuc;
}
