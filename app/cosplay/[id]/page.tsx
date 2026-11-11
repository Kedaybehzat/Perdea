import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { bulusmaGetir, bulusmaKatilimcilari } from "@/lib/bulusma";
import { gectiMi, goreceli, saat, tarihParcalari, tarihUzun } from "@/lib/zaman";
import Avatar from "@/components/ui/Avatar";
import Bilet from "@/components/ui/Bilet";
import BildirFormu from "@/components/ui/BildirFormu";
import KatilFormu from "./KatilFormu";
import GuvenlikKarti from "../GuvenlikKarti";
import { bulusmaSikayetAction } from "../actions";

type Props = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = { title: "Cosplay Buluşması — Perdea" };

export default async function BulusmaDetaySayfasi({ params }: Props) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const b = await bulusmaGetir(id);
  if (!b) notFound();

  const katilimcilar = await bulusmaKatilimcilari(id);
  const ben = katilimcilar.find((k) => k.user_id === user.id);
  const duzenleyen = katilimcilar.find((k) => k.user_id === b.duzenleyen_id);
  const t = tarihParcalari(b.zaman);
  const gecmis = gectiMi(b.zaman);
  const iptal = b.durum === "iptal";
  const dolu = b.kontenjan !== null && b.katilimci_sayisi >= b.kontenjan;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/cosplay"
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Buluşmalar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-8">
            <Bilet
              ton="koyu"
              centik="64%"
              kocan={
                <div className="px-6 sm:px-8 py-5 flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="text-center leading-none">
                      <p
                        className="font-display font-bold text-5xl text-altin tabular-nums"
                        style={{ fontVariationSettings: '"opsz" 144' }}
                      >
                        {t.gun}
                      </p>
                      <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-100/80 mt-1">
                        {t.ay}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-emerald-300" />
                        {tarihUzun(b.zaman)}
                      </p>
                      <p className="text-emerald-100/80 flex items-center gap-1.5 mt-1">
                        <Clock className="w-4 h-4 text-emerald-300" />
                        {saat(b.zaman)} · {goreceli(b.zaman)}
                      </p>
                    </div>
                  </div>
                  <p className="ml-auto text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-300" />
                    {b.katilimci_sayisi}
                    {b.kontenjan !== null ? ` / ${b.kontenjan}` : ""} kişi
                  </p>
                </div>
              }
            >
              <div className="perde-zemin rounded-t-2xl px-6 sm:px-8 pt-7 pb-9">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {b.tema && (
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-altin">
                      {b.tema}
                    </span>
                  )}
                  {iptal && (
                    <span className="text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                      İptal edildi
                    </span>
                  )}
                  {!iptal && gecmis && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      Geçmiş buluşma
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-stone-50">
                  {b.baslik}
                </h1>
                <p className="mt-3 text-emerald-100/85 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0 mt-1" />
                  {b.mekan}, {b.sehir}
                </p>
                {duzenleyen && (
                  <p className="mt-4 text-sm text-emerald-100/80 flex items-center gap-2">
                    <Avatar
                      ad={duzenleyen.display_name || duzenleyen.username}
                      url={duzenleyen.avatar_url}
                      boyut="xs"
                    />
                    Düzenleyen:
                    <Link href={`/u/${duzenleyen.username}`} className="font-semibold text-stone-50 hover:underline">
                      {duzenleyen.display_name || duzenleyen.username}
                    </Link>
                  </p>
                )}
              </div>
            </Bilet>

            {b.aciklama && (
              <section>
                <h2 className="text-2xl font-bold text-stone-900 mb-3">Detaylar</h2>
                <p className="text-stone-700 leading-relaxed whitespace-pre-line">{b.aciklama}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                Kimler geliyor?{" "}
                <span className="font-sans text-base font-medium text-stone-500">
                  {katilimcilar.length} kişi
                </span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {katilimcilar.map((k) => {
                  const ad = k.display_name || k.username;
                  return (
                    <li
                      key={k.user_id}
                      className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <Avatar ad={ad} url={k.avatar_url} />
                      <div className="min-w-0">
                        <Link
                          href={`/u/${k.username}`}
                          className="font-semibold text-stone-900 hover:text-emerald-700 block truncate"
                        >
                          {ad}
                        </Link>
                        <p className="text-sm text-stone-500 truncate">
                          {k.karakter ? (
                            <>
                              <span className="text-emerald-700 font-medium">{k.karakter}</span> olarak
                            </>
                          ) : k.user_id === b.duzenleyen_id ? (
                            "Düzenleyen"
                          ) : (
                            "Karakter sürpriz"
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-2 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-kart">
              {iptal ? (
                <>
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Bu buluşma iptal edildi</h2>
                  <p className="text-stone-600 mb-4">Başka buluşmalara göz atabilirsin.</p>
                  <Link href="/cosplay" className="dugme w-full">
                    Buluşmalara dön
                  </Link>
                </>
              ) : gecmis ? (
                <>
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Bu buluşma yapıldı</h2>
                  <p className="text-stone-600 mb-4">Sıradakini kaçırma.</p>
                  <Link href="/cosplay" className="dugme w-full">
                    Yaklaşan buluşmalar
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-stone-900 mb-1">
                    {ben ? "Listedesin" : "Sen de gel"}
                  </h2>
                  <p className="text-sm text-stone-600 mb-4">
                    {ben
                      ? "Karakterini istediğin zaman değiştirebilirsin."
                      : "Hangi karakter olarak geleceğini yazarsan diğerleri de görür."}
                  </p>
                  <KatilFormu
                    bulusmaId={b.id}
                    katildi={Boolean(ben)}
                    karakterim={ben?.karakter ?? null}
                    duzenleyen={user.id === b.duzenleyen_id}
                    dolu={dolu}
                  />
                </>
              )}
            </div>
            <GuvenlikKarti />
            {user.id !== b.duzenleyen_id && (
              <BildirFormu
                hedefId={b.id}
                action={bulusmaSikayetAction}
                ozet="Bu ilanda bir sorun mu var? Bildir"
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
