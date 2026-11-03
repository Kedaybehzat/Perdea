// TMDB helpers — sunucu tarafında kullanılır (TMDB_API_KEY NEXT_PUBLIC değildir).
// Dil: tr-TR. Posterler image.tmdb.org'dan servis edilir.
// Key tanımlı değilse fonksiyonlar null/[] döndürür — çağıran yer "yakında" hali gösterebilir.

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbYapim = {
  id: number;
  baslik: string;
  orjinalBaslik?: string;
  posterYolu: string | null;
  arkaplanYolu: string | null;
  ozet: string;
  yil: number | null;
  tmdbPuani: number;
  tur: "film" | "dizi";
};

export function tmdbHazirMi(): boolean {
  return Boolean(process.env.TMDB_API_KEY);
}

export function posterUrl(yol: string | null, boyut: "w185" | "w342" | "w500" | "original" = "w342"): string | null {
  if (!yol) return null;
  return `${IMAGE_BASE}/${boyut}${yol}`;
}

function anahtar(): string | null {
  return process.env.TMDB_API_KEY ?? null;
}

async function tmdbFetch<T>(yol: string, params: Record<string, string> = {}): Promise<T | null> {
  const key = anahtar();
  if (!key) return null;
  const url = new URL(`${TMDB_BASE}${yol}`);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", "tr-TR");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const r = await fetch(url.toString(), { next: { revalidate: 60 * 60 } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

type TmdbTrendingSonuc = {
  results: Array<{
    id: number;
    media_type?: "movie" | "tv";
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
  }>;
};

function yapimdenCevir(r: TmdbTrendingSonuc["results"][number], varsayilanTur: "film" | "dizi"): TmdbYapim {
  const medya = r.media_type ?? (r.name ? "tv" : "movie");
  const tur: "film" | "dizi" = medya === "tv" ? "dizi" : "film";
  const tarih = r.release_date ?? r.first_air_date ?? "";
  return {
    id: r.id,
    baslik: r.title ?? r.name ?? "(başlıksız)",
    orjinalBaslik: r.original_title ?? r.original_name,
    posterYolu: r.poster_path,
    arkaplanYolu: r.backdrop_path,
    ozet: r.overview ?? "",
    yil: tarih ? Number(tarih.slice(0, 4)) : null,
    tmdbPuani: r.vote_average ?? 0,
    tur: tur || varsayilanTur,
  };
}

export async function trendYapimlar(kategori: "film" | "dizi" | "hepsi" = "hepsi"): Promise<TmdbYapim[]> {
  const yolTur = kategori === "film" ? "movie" : kategori === "dizi" ? "tv" : "all";
  const data = await tmdbFetch<TmdbTrendingSonuc>(`/trending/${yolTur}/week`);
  if (!data) return [];
  return data.results.map((r) => yapimdenCevir(r, kategori === "dizi" ? "dizi" : "film"));
}

export async function vizyondakiFilmler(): Promise<TmdbYapim[]> {
  const data = await tmdbFetch<TmdbTrendingSonuc>("/movie/now_playing", {
    region: "TR",
  });
  if (!data) return [];
  return data.results.map((r) => yapimdenCevir({ ...r, media_type: "movie" }, "film"));
}

export async function yakindaFilmler(): Promise<TmdbYapim[]> {
  const data = await tmdbFetch<TmdbTrendingSonuc>("/movie/upcoming", {
    region: "TR",
  });
  if (!data) return [];
  return data.results.map((r) => yapimdenCevir({ ...r, media_type: "movie" }, "film"));
}

export async function yapimAra(sorgu: string): Promise<TmdbYapim[]> {
  if (!sorgu.trim()) return [];
  const data = await tmdbFetch<TmdbTrendingSonuc>("/search/multi", { query: sorgu });
  if (!data) return [];
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => yapimdenCevir(r, "film"));
}

export async function yapimDetay(id: number, tur: "film" | "dizi"): Promise<TmdbYapim | null> {
  const yol = tur === "dizi" ? `/tv/${id}` : `/movie/${id}`;
  const data = await tmdbFetch<TmdbTrendingSonuc["results"][number]>(yol);
  if (!data) return null;
  return yapimdenCevir(data, tur);
}

// Birden fazla movie_id için poster + başlık çek (profil/keşfet grid'leri için).
export async function yapimlariIdyeGoreCek(idler: number[]): Promise<Map<number, TmdbYapim>> {
  const sonuc = new Map<number, TmdbYapim>();
  if (!idler.length || !tmdbHazirMi()) return sonuc;
  // Film olarak dene; TMDB id'leri film/dizi arasında bölüştürülemez tek sorguyla,
  // o yüzden şimdilik hepsini movie varsay (favoriler movie_id olarak tutuluyor).
  const yapimlar = await Promise.all(idler.map((id) => yapimDetay(id, "film")));
  yapimlar.forEach((y, i) => {
    if (y) sonuc.set(idler[i], y);
  });
  return sonuc;
}
