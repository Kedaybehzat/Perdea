// Eşleşme algoritması — MVP.
// Mantık: giriş yapanın favorileri ile diğer kullanıcıların favorilerinin
// kesişimine bak. Ortak favori sayısı çok olan + ortak filmlere benzer puan
// veren kullanıcı daha uygun.
//
// Skor formülü:
//   uyumYuzdesi = (ortak favori / senin favori sayın) * 100
//   puanYakinligi = ortak filmlerde puan farklarının ortalamasının tersi
//                   (puan verilmemişse bu bileşen yok)
//   nihaiSkor = uyumYuzdesi + puanYakinligiBonus
//
// Ölçeklenince cosine similarity / Postgres fonksiyonuna geçilir.

import { createClient } from "@/lib/supabase/server";

export type EslesmeAdayi = {
  userId: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  ortakFilmler: number[];
  ortakSayisi: number;
  uyumYuzdesi: number;
  puanYakinligi: number | null; // 0-100 arası, null = ortak puan yok
  nihaiSkor: number;
  favoriIlk4: number[]; // adayın öne çıkan favorileri (poster gösterimi için)
};

export async function enUygunEslesmeler(limit = 5): Promise<{
  benimFavoriSayim: number;
  benimPuanSayim: number;
  adaylar: EslesmeAdayi[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { benimFavoriSayim: 0, benimPuanSayim: 0, adaylar: [] };

  // 1) Benim favorilerim + puanlarım
  const { data: benimFavoriler } = await supabase
    .from("favorites")
    .select("movie_id")
    .eq("user_id", user.id);
  const benimFavoriIdleri = (benimFavoriler ?? []).map((f) => f.movie_id);

  const { data: benimPuanlar } = await supabase
    .from("ratings")
    .select("movie_id, score")
    .eq("user_id", user.id);
  const benimPuanHaritasi = new Map<number, number>(
    (benimPuanlar ?? []).map((r) => [r.movie_id, r.score])
  );

  if (!benimFavoriIdleri.length) {
    return {
      benimFavoriSayim: 0,
      benimPuanSayim: benimPuanHaritasi.size,
      adaylar: [],
    };
  }

  // 2) Benimle ortak film favorilemiş diğer kullanıcılar
  const { data: digerFavoriler } = await supabase
    .from("favorites")
    .select("user_id, movie_id")
    .in("movie_id", benimFavoriIdleri)
    .neq("user_id", user.id);

  const ortakHaritasi = new Map<string, Set<number>>();
  (digerFavoriler ?? []).forEach((f) => {
    if (!ortakHaritasi.has(f.user_id)) ortakHaritasi.set(f.user_id, new Set());
    ortakHaritasi.get(f.user_id)!.add(f.movie_id);
  });

  if (!ortakHaritasi.size) {
    return {
      benimFavoriSayim: benimFavoriIdleri.length,
      benimPuanSayim: benimPuanHaritasi.size,
      adaylar: [],
    };
  }

  const adayIdleri = [...ortakHaritasi.keys()];

  // 3) Adayların profilleri
  const { data: profiller } = await supabase
    .from("users")
    .select("id, username, display_name, bio, avatar_url")
    .in("id", adayIdleri);
  const profilHaritasi = new Map(
    (profiller ?? []).map((p) => [p.id as string, p])
  );

  // 4) Adayların puanları (sadece ortak filmler için — puan yakınlığı hesaplanacak)
  const { data: adayPuanlar } = await supabase
    .from("ratings")
    .select("user_id, movie_id, score")
    .in("user_id", adayIdleri)
    .in("movie_id", benimFavoriIdleri);
  const adayPuanHaritasi = new Map<string, Map<number, number>>();
  (adayPuanlar ?? []).forEach((r) => {
    if (!adayPuanHaritasi.has(r.user_id)) adayPuanHaritasi.set(r.user_id, new Map());
    adayPuanHaritasi.get(r.user_id)!.set(r.movie_id, r.score);
  });

  // 5) Adayların öne çıkan 4 favorisi (poster vitrini için)
  const { data: adayFavoriler } = await supabase
    .from("favorites")
    .select("user_id, movie_id, created_at")
    .in("user_id", adayIdleri)
    .order("created_at", { ascending: false });
  const adayFavoriHaritasi = new Map<string, number[]>();
  (adayFavoriler ?? []).forEach((f) => {
    if (!adayFavoriHaritasi.has(f.user_id)) adayFavoriHaritasi.set(f.user_id, []);
    const liste = adayFavoriHaritasi.get(f.user_id)!;
    if (liste.length < 4) liste.push(f.movie_id);
  });

  // 6) Skorları hesapla
  const adaylar: EslesmeAdayi[] = [];
  for (const [adayId, ortakSet] of ortakHaritasi.entries()) {
    const ortakFilmler = [...ortakSet];
    const uyumYuzdesi = Math.round(
      (ortakFilmler.length / benimFavoriIdleri.length) * 100
    );

    // Puan yakınlığı: ortak filmlerde ikisi de puan vermişse, fark ortalaması.
    // Fark 0 → yakınlık 100. Fark 9 → yakınlık ~0.
    const adayPuanlari = adayPuanHaritasi.get(adayId);
    let puanYakinligi: number | null = null;
    if (adayPuanlari && benimPuanHaritasi.size) {
      const ortakPuanli: number[] = [];
      for (const movieId of ortakFilmler) {
        const benim = benimPuanHaritasi.get(movieId);
        const onun = adayPuanlari.get(movieId);
        if (benim != null && onun != null) {
          ortakPuanli.push(Math.abs(benim - onun));
        }
      }
      if (ortakPuanli.length) {
        const ortFark = ortakPuanli.reduce((t, v) => t + v, 0) / ortakPuanli.length;
        puanYakinligi = Math.max(0, Math.round(100 - (ortFark / 9) * 100));
      }
    }

    const puanBonus = puanYakinligi != null ? Math.round(puanYakinligi * 0.3) : 0;
    const nihaiSkor = uyumYuzdesi + puanBonus;

    const profil = profilHaritasi.get(adayId);
    adaylar.push({
      userId: adayId,
      username: profil?.username ?? null,
      displayName: profil?.display_name ?? null,
      bio: profil?.bio ?? null,
      avatarUrl: profil?.avatar_url ?? null,
      ortakFilmler,
      ortakSayisi: ortakFilmler.length,
      uyumYuzdesi,
      puanYakinligi,
      nihaiSkor,
      favoriIlk4: adayFavoriHaritasi.get(adayId) ?? [],
    });
  }

  adaylar.sort((a, b) => b.nihaiSkor - a.nihaiSkor);

  return {
    benimFavoriSayim: benimFavoriIdleri.length,
    benimPuanSayim: benimPuanHaritasi.size,
    adaylar: adaylar.slice(0, limit),
  };
}
