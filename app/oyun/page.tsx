import Link from "next/link";
import { DoorOpen, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { acikOdalar, odalarim } from "@/lib/oyun";
import type { OdaAsamasi } from "@/lib/oyun-tipleri";
import { goreceli } from "@/lib/zaman";
import BosDurum from "@/components/ui/BosDurum";
import FormMesaji from "@/components/ui/FormMesaji";
import KurulumNotu from "@/components/ui/KurulumNotu";
import { KodlaKatilFormu, OdaKurFormu } from "./LobiFormlari";
import { odayaKatilAction } from "./actions";

export const metadata = {
  title: "Ben Kimim? Oyun Odaları — Perdea",
  description:
    "Oda kur, arkadaşlarını kodla çağır. Herkese gizli bir karakter atanır; evet/hayır sorularıyla kim olduğunu bul.",
};

type Props = { searchParams: Promise<{ hata?: string }> };

const asamaEtiketi: Record<OdaAsamasi, string> = {
  lobi: "Lobide",
  karakter: "Karakterler yazılıyor",
  oyun: "Oyun sürüyor",
  bitti: "Tur bitti",
};

const adimlar = [
  { no: "1", baslik: "Oda kur ya da katıl", metin: "Kodu paylaş; 2–8 kişi aynı odada toplanın." },
  { no: "2", baslik: "Birbirinize karakter yazın", metin: "Herkes bir başkasının alnına bir karakter yazar. Kendi karakterini göremezsin." },
  { no: "3", baslik: "Sor, daralt, tahmin et", metin: "Sıran gelince evet/hayır sorusu sor ya da tahminini söyle. Diğerleri cevaplar." },
  { no: "4", baslik: "İlk bilen kazanır", metin: "Herkes bulana kadar sürer. Sonra roller kayar, yeni tur başlar." },
];

export default async function OyunLobisi({ searchParams }: Props) {
  const { hata } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ odalar, kurulumEksik }, benimOdalarim] = user
    ? await Promise.all([acikOdalar(), odalarim()])
    : [{ odalar: [], kurulumEksik: false }, []];

  return (
    <main className="min-h-screen">
      {/* Tabela */}
      <section className="perde-zemin text-stone-50 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-4 ampuller opacity-80" aria-hidden />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-altin mb-3">
            Oyun odaları
          </p>
          <h1 className="text-6xl md:text-7xl font-bold leading-none mb-5">
            Ben <em className="text-emerald-300">Kimim?</em>
          </h1>
          <p className="text-lg text-emerald-100/85 max-w-2xl mx-auto">
            Alnına bir karakter yazılır, herkes görür — sen hariç. Evet/hayır sorularıyla
            kim olduğunu bul. Film, dizi, anime… ne isterseniz.
          </p>
          {!user && (
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/kayit" className="dugme bg-stone-50! text-emerald-800! hover:bg-white!">
                Oynamak için kayıt ol
              </Link>
              <Link href="/giris" className="dugme-cizgi bg-transparent! text-stone-50! border-white/30! hover:border-white!">
                Giriş yap
              </Link>
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-4 ampuller opacity-80" aria-hidden />
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 pt-10 space-y-12">
        {user && (
          <>
            {/* Kur / Katıl */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 -mt-16 relative">
              <div className="lg:col-span-3 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-kart">
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Yeni oda kur</h2>
                <p className="text-stone-600 mb-5 text-sm">Oda kurulunca sana 5 haneli bir kod verilir.</p>
                <OdaKurFormu />
              </div>
              <div className="lg:col-span-2 bg-kum border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-kart">
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Kodun var mı?</h2>
                <p className="text-stone-600 mb-5 text-sm">Arkadaşının gönderdiği kodu yaz.</p>
                <KodlaKatilFormu />
              </div>
            </section>

            {kurulumEksik && <KurulumNotu />}
            {hata && <FormMesaji hata={hata} />}

            {/* Odalarım */}
            {benimOdalarim.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-stone-900 mb-4">Odaların</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {benimOdalarim.map((o) => (
                    <li key={o.kod}>
                      <Link
                        href={`/oyun/${o.kod}`}
                        className="block bg-white border border-stone-200 hover:border-emerald-600 rounded-2xl p-5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-stone-900 truncate">{o.ad}</h3>
                          <span className="font-mono text-sm font-bold text-emerald-700 tracking-widest">
                            {o.kod}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500 mt-1">
                          {asamaEtiketi[o.durum]} · {o.oyuncu_sayisi}/{o.kapasite} kişi ·{" "}
                          {goreceli(o.guncellendi)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Açık odalar */}
            <section>
              <div className="flex items-end justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-stone-900">Açık odalar</h2>
                <p className="text-sm text-stone-500">Oyuncu bekleyen herkese açık odalar</p>
              </div>
              {odalar.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {odalar.map((o) => {
                    const dolu = o.oyuncu_sayisi >= o.kapasite;
                    return (
                      <li
                        key={o.kod}
                        className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3"
                      >
                        <div>
                          {o.tema && (
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-1 truncate">
                              {o.tema}
                            </p>
                          )}
                          <h3 className="font-display text-xl font-bold text-stone-900 leading-snug">
                            {o.ad}
                          </h3>
                          <p className="text-sm text-stone-500 mt-1">
                            @{o.kurucu} kurdu · {goreceli(o.created_at)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3">
                          <span className="text-sm text-stone-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-stone-400" />
                            {o.oyuncu_sayisi} / {o.kapasite}
                          </span>
                          <form action={odayaKatilAction.bind(null, o.kod)}>
                            <button type="submit" disabled={dolu} className="dugme py-2! px-4! text-sm">
                              {dolu ? "Dolu" : "Katıl"}
                            </button>
                          </form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <BosDurum
                  icon={DoorOpen}
                  baslik="Şu an açık oda yok"
                  aciklama="İlk odayı sen kur; kodu arkadaşlarına gönder ya da herkese açık bırak."
                />
              )}
            </section>
          </>
        )}

        {/* Nasıl oynanır */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6 text-center">Nasıl oynanır?</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {adimlar.map((a) => (
              <li key={a.no} className="bg-white border border-stone-200 rounded-2xl p-5">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-kum font-display text-xl font-bold text-stone-800 mb-3"
                  aria-hidden
                >
                  {a.no}
                </span>
                <h3 className="font-semibold text-stone-900 mb-1">{a.baslik}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{a.metin}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
