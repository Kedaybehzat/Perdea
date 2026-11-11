import Link from "next/link";
import { Armchair, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { salonlariListele, salonSehirleri, type SalonSirasi } from "@/lib/sinema";
import SayfaBasligi from "@/components/ui/SayfaBasligi";
import BosDurum from "@/components/ui/BosDurum";
import KurulumNotu from "@/components/ui/KurulumNotu";
import SalonKarti from "./SalonKarti";
import SalonEkleFormu from "./SalonEkleFormu";

export const metadata = {
  title: "Salon Puanları — Perdea",
  description:
    "Sinema salonlarını perde, ses, koltuk, temizlik ve fiyat üzerinden puanla; şehrindeki en iyi salonu bul.",
};

type Props = {
  searchParams: Promise<{ sehir?: string; q?: string; sira?: string; ekle?: string }>;
};

const siralar: { deger: SalonSirasi; etiket: string }[] = [
  { deger: "puan", etiket: "En yüksek puan" },
  { deger: "populer", etiket: "En çok oylanan" },
  { deger: "yeni", etiket: "Yeni eklenen" },
];

export default async function SalonlarSayfasi({ searchParams }: Props) {
  const { sehir, q, sira, ekle } = await searchParams;
  const seciliSira: SalonSirasi =
    sira === "yeni" || sira === "populer" ? sira : "puan";

  const supabase = await createClient();
  const [{ data: { user } }, { salonlar, kurulumEksik }, sehirListesi] = await Promise.all([
    supabase.auth.getUser(),
    salonlariListele({ sehir, q, sira: seciliSira }),
    salonSehirleri(),
  ]);

  const filtreVar = Boolean(sehir || q);
  const siraLinki = (deger: SalonSirasi) => {
    const p = new URLSearchParams();
    if (sehir) p.set("sehir", sehir);
    if (q) p.set("q", q);
    if (deger !== "puan") p.set("sira", deger);
    const s = p.toString();
    return s ? `/salonlar?${s}` : "/salonlar";
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <SayfaBasligi
          ustEtiket="Salon puanları"
          baslik="Film nerede izlenir?"
          aciklama="Aynı film her salonda aynı değil. Perdeyi, sesi, koltuğu, temizliği ve fiyatı puanla; şehrindeki en iyi salonu birlikte bulalım."
        >
          {user ? (
            <a href="#salon-ekle" className="dugme">
              <Plus className="w-4 h-4" />
              Salon ekle
            </a>
          ) : (
            <Link href="/giris" className="dugme-cizgi">
              Puanlamak için giriş yap
            </Link>
          )}
        </SayfaBasligi>

        {kurulumEksik && <KurulumNotu />}

        {/* Arama + şehir */}
        <form
          action="/salonlar"
          method="get"
          className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-3 shadow-kart"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Salon adı ara"
              aria-label="Salon adı ara"
              className="alan pl-10!"
            />
          </div>
          <select name="sehir" defaultValue={sehir ?? ""} aria-label="Şehir" className="alan sm:w-56!">
            <option value="">Tüm şehirler</option>
            {sehirListesi.map((s) => (
              <option key={s.sehir} value={s.sehir}>
                {s.sehir} ({s.adet})
              </option>
            ))}
          </select>
          {seciliSira !== "puan" && <input type="hidden" name="sira" value={seciliSira} />}
          <button type="submit" className="dugme">
            Ara
          </button>
        </form>

        {/* Sıralama */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto kaydirma-gizli">
          {siralar.map((s) => (
            <Link
              key={s.deger}
              href={siraLinki(s.deger)}
              aria-current={seciliSira === s.deger ? "true" : undefined}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                seciliSira === s.deger
                  ? "bg-stone-900 text-stone-50 border-stone-900"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
              }`}
            >
              {s.etiket}
            </Link>
          ))}
          {filtreVar && (
            <Link href="/salonlar" className="shrink-0 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4">
              Filtreyi temizle
            </Link>
          )}
        </div>

        {salonlar.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salonlar.map((s) => (
              <SalonKarti key={s.id} salon={s} />
            ))}
          </div>
        ) : (
          <BosDurum
            icon={Armchair}
            baslik={filtreVar ? "Bu aramada salon çıkmadı" : "Henüz salon eklenmemiş"}
            aciklama={
              filtreVar
                ? "Aradığın salon listede yoksa ekleyebilirsin; ilk puanı da sen verirsin."
                : "İlk salonu sen ekle: en son film izlediğin yer neresiydi?"
            }
          >
            {user ? (
              <a href="#salon-ekle" className="dugme">
                Salon ekle
              </a>
            ) : (
              <Link href="/giris" className="dugme">
                Giriş yap
              </Link>
            )}
          </BosDurum>
        )}

        {/* Salon ekle */}
        {user && (
          <section id="salon-ekle" className="mt-14 scroll-mt-24">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-kart max-w-3xl">
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Listede yok mu? Ekle.</h2>
              <p className="text-stone-600 mb-6">
                Salonu ekledikten sonra puanlama sayfasına geçersin. Aynı salon iki kez eklenemez.
              </p>
              <SalonEkleFormu varsayilanSehir={sehir} key={ekle ?? "form"} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
