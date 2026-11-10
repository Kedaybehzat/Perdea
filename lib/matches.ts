// matches tablosu + Beğen/Geç kararları.
// RLS: insert/select sadece auth.uid() = user_id ile sınırlı.
// Karşılıklı eşleşme için security-definer SQL fonksiyonu kullanılıyor.

import { createClient } from "@/lib/supabase/server";

export type Karar = "begen" | "gec";

export async function kararVer(
  adayId: string,
  karar: Karar
): Promise<{ hata?: string; karsilikliEslesme?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  if (user.id === adayId) return { hata: "Kendine karar veremezsin." };

  const { error } = await supabase
    .from("matches")
    .upsert(
      { user_id: user.id, aday_id: adayId, karar },
      { onConflict: "user_id,aday_id" }
    );
  if (error) return { hata: error.message };

  if (karar === "begen") {
    const { data } = await supabase.rpc("karsilikli_eslesme", { aday: adayId });
    return { karsilikliEslesme: Boolean(data) };
  }
  return { karsilikliEslesme: false };
}

export async function kullanicininKararVerdikleri(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select("aday_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.aday_id as string));
}
