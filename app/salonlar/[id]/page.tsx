import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OLCUTLER, benimSalonPuanim, salonGetir, salonYorumlari } from "@/lib/sinema";
import { goreceli } from "@/lib/zaman";
import Avatar from "@/components/ui/Avatar";
import Bilet from "@/components/ui/Bilet";
import Yildizlar from "@/components/ui/Yildizlar";
import PuanFormu from "./PuanFormu";
import BildirFormu from "@/components/ui/BildirFormu";
import { salonSikayetAction } from "../actions";

type Props = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const salon = UUID.test(id) ? await salonGetir(id) : null;
  return {
    title: salon ? `${salon.ad} — Salon Puanı — Perdea` : "Salon — Perdea",
    description: salon
      ? `${salon.ad} (${salon.sehir}) için perde, ses, koltuk, temizlik ve fiyat puanları.`
      : undefined,
  };
}

export default async function SalonDetaySayfasi({ params }: Props) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const salon = await salonGetir(id);
  if (!salon) notFound();

  const supabase = await createClient();
  const [{ data: { user } }, yorumlar, benimPuanim] = await Promise.all([
    supabase.auth.getUser(),
    salonYorumlari(id),
    benimSalonPuanim(id),
  ]);

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href={`/salonlar?sehir=${encodeURIComponent(salon.sehir)}`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {salon.sehir} salonları
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Sol: salon bileti + yorumlar */}
          <div className="lg:col-span-3 space-y-8">
            <Bilet
              ton="koyu"
              centik="58%"
              className="max-w-2xl"
              kocan={
                <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {OLCUTLER.map((o) => {
                    const v = salon[o.anahtar];
                    return (
                      <div key={o.anahtar}>
                        <div className="flex items-baseline justify-between text-sm mb-1">
                          <span className="text-emerald-100/80">{o.etiket}</span>
                          <span className="font-semibold tabular-nums">
                            {v !== null ? v.toFixed(1) : "—"}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-altin"
                            style={{ width: `${((v ?? 0) / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            >
              <div className="perde-zemin rounded-t-2xl px-6 sm:px-8 pt-7 pb-9">
                {salon.zincir && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-altin mb-2">
                    {salon.zincir}
                  </p>
                )}
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-stone-50">
                      {salon.ad}
                    </h1>
                    <p className="mt-2 text-emerald-100/80 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {salon.ilce ? `${salon.ilce}, ${salon.sehir}` : salon.sehir}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="font-display font-bold text-6xl leading-none tabular-nums text-stone-50"
                      style={{ fontVariationSettings: '"opsz" 144' }}
                    >
                      {salon.genel !== null ? salon.genel.toFixed(1) : "—"}
                    </p>
                    <Yildizlar puan={salon.genel} className="mt-2" />
                    <p className="text-xs text-emerald-100/70 mt-1">
                      {salon.puan_sayisi > 0 ? `${salon.puan_sayisi} puan` : "Henüz puan yok"}
                    </p>
                  </div>
                </div>
              </div>
            </Bilet>

            <section>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                Gidenler ne diyor?
              </h2>
              {yorumlar.length === 0 ? (
                <p className="text-stone-600 bg-white border border-dashed border-stone-300 rounded-2xl px-5 py-8 text-center">
                  Bu salonu henüz kimse puanlamadı. İlk sen ol.
                </p>
              ) : (
                <ul className="space-y-3">
                  {yorumlar.map((y) => {
                    const ort =
                      OLCUTLER.reduce((t, o) => t + y[o.anahtar], 0) / OLCUTLER.length;
                    const ad = y.yazar?.display_name || y.yazar?.username || "Silinmiş kullanıcı";
                    return (
                      <li key={y.user_id} className="bg-white border border-stone-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                          <Avatar ad={ad} url={y.yazar?.avatar_url} />
                          <div className="min-w-0 flex-1">
                            {y.yazar ? (
                              <Link
                                href={`/u/${y.yazar.username}`}
                                className="font-semibold text-stone-900 hover:text-emerald-700"
                              >
                                {ad}
                              </Link>
                            ) : (
                              <span className="font-semibold text-stone-500">{ad}</span>
                            )}
                            <p className="text-xs text-stone-500">{goreceli(y.updated_at)}</p>
                          </div>
                          <div className="text-right">
                            <Yildizlar puan={ort} boyut="sm" />
                            <p className="text-xs text-stone-500 mt-0.5 tabular-nums">{ort.toFixed(1)}</p>
                          </div>
                        </div>
                        {y.yorum && (
                          <p className="mt-3 text-stone-700 leading-relaxed whitespace-pre-line">
                            {y.yorum}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-stone-500 flex flex-wrap gap-x-3 gap-y-1">
                          {OLCUTLER.map((o) => (
                            <span key={o.anahtar}>
                              {o.kisa} <strong className="text-stone-800">{y[o.anahtar]}</strong>
                            </span>
                          ))}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Sağ: puan ver */}
          <aside className="lg:col-span-2 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-kart">
              <h2 className="text-2xl font-bold text-stone-900 mb-1">
                {benimPuanim ? "Senin puanın" : "Sen de puanla"}
              </h2>
              <p className="text-sm text-stone-600 mb-4">
                Beş ölçüt, her biri 5 üzerinden. İstediğin zaman güncelleyebilirsin.
              </p>
              {user ? (
                <PuanFormu sinemaId={salon.id} mevcut={benimPuanim} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-stone-600 mb-4">Puan vermek için giriş yapmalısın.</p>
                  <Link href="/giris" className="dugme w-full">
                    Giriş yap
                  </Link>
                </div>
              )}
            </div>
            {user && (
              <BildirFormu
                hedefId={salon.id}
                action={salonSikayetAction}
                ozet="Salon bilgisi yanlış mı? Bildir"
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
