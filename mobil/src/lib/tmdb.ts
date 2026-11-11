// Film verisi: TMDB anahtarı uygulamada YOK. Web sitesindeki /api/mobil/tmdb vekili çağrılır.
const API = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const GORSEL = "https://image.tmdb.org/t/p";

export type Yapim = {
  id: number;
  baslik: string;
  posterYolu: string | null;
  arkaplanYolu: string | null;
  ozet: string;
  yil: number | null;
  tmdbPuani: number;
  tur: "film" | "dizi";
};

export function posterUrl(yol: string | null, boyut: "w185" | "w342" | "w500" = "w342"): string | null {
  return yol ? `${GORSEL}/${boyut}${yol}` : null;
}

async function cagir(parametreler: Record<string, string>): Promise<Yapim[]> {
  if (!API) throw new Error("EXPO_PUBLIC_API_URL tanımlı değil.");
  const adres = `${API}/api/mobil/tmdb?${new URLSearchParams(parametreler).toString()}`;
  const yanit = await fetch(adres);
  if (!yanit.ok) throw new Error(`Film verisi alınamadı (${yanit.status}).`);
  const veri = (await yanit.json()) as { yapimlar?: Yapim[] };
  return veri.yapimlar ?? [];
}

export const trend = (tur: "hepsi" | "film" | "dizi") => cagir({ tip: "trend", tur });
export const ara = (q: string) => cagir({ tip: "ara", q });

const onbellek = new Map<number, Yapim>();

// Verilen id'lerin yapım bilgisi (afiş vitrinleri için). Bellekte saklar.
export async function yapimlar(idler: number[]): Promise<Map<number, Yapim>> {
  const eksik = [...new Set(idler)].filter((id) => !onbellek.has(id)).slice(0, 60);
  if (eksik.length) {
    try {
      (await cagir({ tip: "idler", idler: eksik.join(",") })).forEach((y) => onbellek.set(y.id, y));
    } catch {
      // Afiş gelmezse yedek kutu gösterilir.
    }
  }
  const sonuc = new Map<number, Yapim>();
  idler.forEach((id) => {
    const y = onbellek.get(id);
    if (y) sonuc.set(id, y);
  });
  return sonuc;
}

export function yapimiHatirla(y: Yapim) {
  onbellek.set(y.id, y);
}
