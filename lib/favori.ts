// Favori DB işlemleri — hepsi lib/ üzerinden. UI/component'ler direkt supabase çağırmaz.
// RLS: select herkese açık; insert/delete sadece auth.uid() = user_id ile.

import { createClient } from "@/lib/supabase/server";

export type FavoriDurum = { ekli: boolean; girisli: boolean };

export async function favoriDurumu(movieId: number): Promise<FavoriDurum> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ekli: false, girisli: false };
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("movie_id", movieId)
    .maybeSingle();
  return { ekli: Boolean(data), girisli: true };
}

export async function favoriEkle(movieId: number): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, movie_id: movieId });
  if (error && error.code !== "23505") return { hata: error.message };
  return {};
}

export async function favoriSil(movieId: number): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hata: "Giriş gerekli." };
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movieId);
  if (error) return { hata: error.message };
  return {};
}

export async function favoriToggle(movieId: number): Promise<{ hata?: string; ekli?: boolean }> {
  const durum = await favoriDurumu(movieId);
  if (!durum.girisli) return { hata: "Giriş gerekli." };
  if (durum.ekli) {
    const s = await favoriSil(movieId);
    return { ...s, ekli: false };
  }
  const s = await favoriEkle(movieId);
  return { ...s, ekli: true };
}

export async function kullanicininFavoriIdleri(userId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("movie_id")
    .eq("user_id", userId);
  return data?.map((f) => f.movie_id) ?? [];
}
