// Eşleşme hesabı — web'deki lib/eslesme.ts ile AYNI mantık (orası değişirse burayı da güncelle).
// Uyum = ortak favori / benim favori sayım. Ortak puanlar yakınsa bonus.
import { supabase } from "./supabase";

export type Aday = {
  userId: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  ortakSayisi: number;
  uyumYuzdesi: number;
  puanYakinligi: number | null;
  nihaiSkor: number;
  favoriIlk4: number[];
};

export async function adaylariGetir(benId: string, limit = 6): Promise<{ favoriSayim: number; adaylar: Aday[] }> {
  const [{ data: favorilerim }, { data: puanlarim }, { data: kararlar }] = await Promise.all([
    supabase.from("favorites").select("movie_id").eq("user_id", benId),
    supabase.from("ratings").select("movie_id, score").eq("user_id", benId),
    supabase.from("matches").select("aday_id").eq("user_id", benId),
  ]);
  const favoriIdleri = (favorilerim ?? []).map((f) => f.movie_id as number);
  if (!favoriIdleri.length) return { favoriSayim: 0, adaylar: [] };
  const puanHaritam = new Map<number, number>((puanlarim ?? []).map((r) => [r.movie_id, r.score]));
  const kararVerdiklerim = new Set((kararlar ?? []).map((r) => r.aday_id as string));

  const { data: digerFavoriler } = await supabase
    .from("favorites")
    .select("user_id, movie_id")
    .in("movie_id", favoriIdleri)
    .neq("user_id", benId);

  const ortak = new Map<string, Set<number>>();
  (digerFavoriler ?? []).forEach((f) => {
    if (kararVerdiklerim.has(f.user_id)) return;
    if (!ortak.has(f.user_id)) ortak.set(f.user_id, new Set());
    ortak.get(f.user_id)!.add(f.movie_id);
  });
  if (!ortak.size) return { favoriSayim: favoriIdleri.length, adaylar: [] };

  const adayIdleri = [...ortak.keys()];
  const [{ data: profiller }, { data: adayPuanlar }, { data: adayFavoriler }] = await Promise.all([
    supabase.from("users").select("id, username, display_name, bio, avatar_url").in("id", adayIdleri),
    supabase.from("ratings").select("user_id, movie_id, score").in("user_id", adayIdleri).in("movie_id", favoriIdleri),
    supabase
      .from("favorites")
      .select("user_id, movie_id, created_at")
      .in("user_id", adayIdleri)
      .order("created_at", { ascending: false }),
  ]);
  const profilHaritasi = new Map((profiller ?? []).map((p) => [p.id as string, p]));
  const adayPuanHaritasi = new Map<string, Map<number, number>>();
  (adayPuanlar ?? []).forEach((r) => {
    if (!adayPuanHaritasi.has(r.user_id)) adayPuanHaritasi.set(r.user_id, new Map());
    adayPuanHaritasi.get(r.user_id)!.set(r.movie_id, r.score);
  });
  const vitrin = new Map<string, number[]>();
  (adayFavoriler ?? []).forEach((f) => {
    if (!vitrin.has(f.user_id)) vitrin.set(f.user_id, []);
    const liste = vitrin.get(f.user_id)!;
    if (liste.length < 4) liste.push(f.movie_id);
  });

  const adaylar: Aday[] = [];
  for (const [adayId, kume] of ortak.entries()) {
    const ortakFilmler = [...kume];
    const uyumYuzdesi = Math.round((ortakFilmler.length / favoriIdleri.length) * 100);
    let puanYakinligi: number | null = null;
    const onun = adayPuanHaritasi.get(adayId);
    if (onun && puanHaritam.size) {
      const farklar: number[] = [];
      for (const id of ortakFilmler) {
        const b = puanHaritam.get(id);
        const o = onun.get(id);
        if (b != null && o != null) farklar.push(Math.abs(b - o));
      }
      if (farklar.length) {
        const ort = farklar.reduce((t, v) => t + v, 0) / farklar.length;
        puanYakinligi = Math.max(0, Math.round(100 - (ort / 9) * 100));
      }
    }
    const p = profilHaritasi.get(adayId);
    adaylar.push({
      userId: adayId,
      username: p?.username ?? null,
      displayName: p?.display_name ?? null,
      bio: p?.bio ?? null,
      avatarUrl: p?.avatar_url ?? null,
      ortakSayisi: ortakFilmler.length,
      uyumYuzdesi,
      puanYakinligi,
      nihaiSkor: uyumYuzdesi + (puanYakinligi != null ? Math.round(puanYakinligi * 0.3) : 0),
      favoriIlk4: vitrin.get(adayId) ?? [],
    });
  }
  adaylar.sort((a, b) => b.nihaiSkor - a.nihaiSkor);
  return { favoriSayim: favoriIdleri.length, adaylar: adaylar.slice(0, limit) };
}

export async function kararVer(benId: string, adayId: string, karar: "begen" | "gec"): Promise<{ hata?: boolean; eslesti: boolean }> {
  const { error } = await supabase
    .from("matches")
    .upsert({ user_id: benId, aday_id: adayId, karar }, { onConflict: "user_id,aday_id" });
  if (error) return { hata: true, eslesti: false };
  if (karar !== "begen") return { eslesti: false };
  const { data } = await supabase.rpc("karsilikli_eslesme", { aday: adayId });
  return { eslesti: Boolean(data) };
}
