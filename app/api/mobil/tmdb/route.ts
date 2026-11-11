// Mobil uygulama için film verisi vekili.
// TMDB anahtarı sunucuda kalır; uygulama yalnızca bu adresi çağırır.
//   /api/mobil/tmdb?tip=trend&tur=hepsi|film|dizi
//   /api/mobil/tmdb?tip=ara&q=dune
//   /api/mobil/tmdb?tip=vizyon | yakinda
//   /api/mobil/tmdb?tip=idler&idler=1,2,3
import { NextResponse, type NextRequest } from "next/server";
import {
  tmdbHazirMi,
  trendYapimlar,
  vizyondakiFilmler,
  yakindaFilmler,
  yapimAra,
  yapimlariIdyeGoreCek,
} from "@/lib/tmdb";

const basliklar = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300, s-maxage=1800",
};

export async function GET(istek: NextRequest) {
  if (!tmdbHazirMi()) {
    return NextResponse.json({ hata: "TMDB anahtarı tanımlı değil." }, { status: 503, headers: basliklar });
  }
  const p = istek.nextUrl.searchParams;
  const tip = p.get("tip") ?? "trend";

  if (tip === "trend") {
    const tur = p.get("tur");
    const yapimlar = await trendYapimlar(tur === "film" || tur === "dizi" ? tur : "hepsi");
    return NextResponse.json({ yapimlar }, { headers: basliklar });
  }
  if (tip === "ara") {
    const q = (p.get("q") ?? "").trim().slice(0, 80);
    const yapimlar = q ? await yapimAra(q) : [];
    return NextResponse.json({ yapimlar }, { headers: basliklar });
  }
  if (tip === "vizyon") {
    return NextResponse.json({ yapimlar: await vizyondakiFilmler() }, { headers: basliklar });
  }
  if (tip === "yakinda") {
    return NextResponse.json({ yapimlar: await yakindaFilmler() }, { headers: basliklar });
  }
  if (tip === "idler") {
    const idler = (p.get("idler") ?? "")
      .split(",")
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 60);
    const harita = await yapimlariIdyeGoreCek(idler);
    return NextResponse.json({ yapimlar: [...harita.values()] }, { headers: basliklar });
  }
  return NextResponse.json({ hata: "Bilinmeyen istek." }, { status: 400, headers: basliklar });
}
