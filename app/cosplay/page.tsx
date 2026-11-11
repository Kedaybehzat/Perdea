import Link from "next/link";
import { Plus, VenetianMask } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { bulusmalariListele } from "@/lib/bulusma";
import { sehirler } from "@/lib/sehirler";
import SayfaBasligi from "@/components/ui/SayfaBasligi";
import BosDurum from "@/components/ui/BosDurum";
import KurulumNotu from "@/components/ui/KurulumNotu";
import BulusmaKarti from "./BulusmaKarti";
import GuvenlikKarti from "./GuvenlikKarti";

export const metadata = {
  title: "Cosplay Buluşmaları — Perdea",
  description:
    "Şehrindeki cosplay buluşmalarını bul ya da kendin aç. Hangi karakter olarak geleceğini yaz, ekibini topla.",
};

type Props = { searchParams: Promise<{ sehir?: string; gecmis?: string }> };

export default async function CosplaySayfasi({ searchParams }: Props) {
  const { sehir, gecmis } = await searchParams;
  const gecmisMi = gecmis === "1";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <GirissizTanitim />;

  const { bulusmalar, kurulumEksik } = await bulusmalariListele({ sehir, gecmis: gecmisMi });

  const link = (p: { sehir?: string; gecmis?: boolean }) => {
    const q = new URLSearchParams();
    if (p.sehir) q.set("sehir", p.sehir);
    if (p.gecmis) q.set("gecmis", "1");
    const s = q.toString();
    return s ? `/cosplay?${s}` : "/cosplay";
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <SayfaBasligi
          ustEtiket="Cosplay buluşmaları"
          baslik="Kostümünü giy, ekibini bul."
          aciklama="Şehrindeki buluşmalara katıl ya da kendin aç. Kim olarak geleceğini yaz; aynı evrenden kimler var, gör."
        >
          <Link href="/cosplay/yeni" className="dugme">
            <Plus className="w-4 h-4" />
            Buluşma aç
          </Link>
        </SayfaBasligi>

        {kurulumEksik && <KurulumNotu />}

        <div className="flex items-center justify-between gap-3 flex-wrap mb-8">
          <div className="flex items-center gap-2">
            {[
              { etiket: "Yaklaşan", gecmis: false },
              { etiket: "Geçmiş", gecmis: true },
            ].map((s) => (
              <Link
                key={s.etiket}
                href={link({ sehir, gecmis: s.gecmis })}
                aria-current={gecmisMi === s.gecmis ? "true" : undefined}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  gecmisMi === s.gecmis
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                }`}
              >
                {s.etiket}
              </Link>
            ))}
          </div>

          <form action="/cosplay" method="get" className="flex items-center gap-2">
            {gecmisMi && <input type="hidden" name="gecmis" value="1" />}
            <select name="sehir" defaultValue={sehir ?? ""} aria-label="Şehir" className="alan py-2! w-48!">
              <option value="">Tüm şehirler</option>
              {sehirler.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" className="dugme-cizgi py-2!">
              Filtrele
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-3">
            {bulusmalar.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {bulusmalar.map((b) => (
                  <BulusmaKarti key={b.id} bulusma={b} />
                ))}
              </div>
            ) : (
              <BosDurum
                icon={VenetianMask}
                baslik={
                  gecmisMi
                    ? "Geçmiş buluşma yok"
                    : sehir
                    ? `${sehir} için yaklaşan buluşma yok`
                    : "Yaklaşan buluşma yok"
                }
                aciklama={gecmisMi ? undefined : "İlkini sen aç; bir tarih ve halka açık bir yer seçmen yeterli."}
              >
                {!gecmisMi && (
                  <Link href="/cosplay/yeni" className="dugme">
                    Buluşma aç
                  </Link>
                )}
              </BosDurum>
            )}
          </div>
          <div className="lg:sticky lg:top-24">
            <GuvenlikKarti />
          </div>
        </div>
      </div>
    </main>
  );
}

function GirissizTanitim() {
  return (
    <main className="min-h-screen">
      <section className="perde-zemin text-stone-50">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-altin mb-4">
            Cosplay buluşmaları
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.03] mb-5">
            Kostümünü giy, <em className="text-emerald-300">ekibini</em> bul.
          </h1>
          <p className="text-lg text-emerald-100/85 max-w-xl mx-auto mb-8">
            Şehrindeki cosplay buluşmalarını gör, hangi karakter olarak geleceğini yaz,
            aynı evrenin insanlarıyla tanış. İlanlar yalnızca üyelere açık.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/kayit" className="dugme bg-stone-50! text-emerald-800! hover:bg-white!">
              Ücretsiz kayıt ol
            </Link>
            <Link href="/giris" className="dugme-cizgi bg-transparent! text-stone-50! border-white/30! hover:border-white!">
              Giriş yap
            </Link>
          </div>
        </div>
        <div className="film-seridi text-stone-50" />
      </section>
    </main>
  );
}
