// Puan (rating) DB işlemleri. 1-10 arası, aynı film için upsert.

import { createClient } from "@/lib/supabase/server";

export async function kullaniciPuani(movieId: number): Promise<number | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("ratings")
    .select("score")
    .eq("user_id", user.id)
    .eq("movie_id", movieId)
    .maybeSingle();
  return data?.score ?? null;
}

export async function puanVer(movieId: number, score: number): Promise<{ hata?: string }> {
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    return { hata: "Puan 1 ile 10 arası tam sayı olmalı." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("ratings")
    .upsert(
      {
        user_id: user.id,
        movie_id: movieId,
        score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,movie_id" }
    );
  if (error) return { hata: error.message };
  return {};
}

export async function puaniSil(movieId: number): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movieId);
  if (error) return { hata: error.message };
  return {};
}

export type KullaniciPuani = { movie_id: number; score: number };

export async function kullanicininPuanlari(userId: string): Promise<KullaniciPuani[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("movie_id, score")
    .eq("user_id", userId);
  return data ?? [];
}
