import Link from "next/link";
import { ArrowRight, Flame, Rss, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { begendigimGonderiler, gonderileriGetir } from "@/lib/akis";
import { basliklariListele } from "@/lib/baslik";
import { bulusmalariListele } from "@/lib/bulusma";
import { goreceli, tarihParcalari } from "@/lib/zaman";
import PerdeBandi from "@/components/ui/PerdeBandi";
import BosDurum from "@/components/ui/BosDurum";
import KurulumNotu from "@/components/ui/KurulumNotu";
import Avatar from "@/components/ui/Avatar";
import BegenDugmesi from "@/components/ui/BegenDugmesi";
import BildirFormu from "@/components/ui/BildirFormu";
import GonderiFormu from "./GonderiFormu";
import { gonderiBegenAction, gonderiSikayetAction, gonderiSilAction } from "./actions";

export const metadata = {
  title: "Akış — Perdea",
  description: "Topluluktan son paylaşımlar, gündemdeki başlıklar, yaklaşan buluşmalar.",
};

export default async function AkisSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ gonderiler, kurulumEksik }, { basliklar }, bulusmaSonuc] = await Promise.all([
    gonderileriGetir(50),
    basliklariListele({ sirala: "gundem", limit: 6 }),
    user ? bulusmalariListele({ limit: 3 }) : Promise.resolve({ bulusmalar: [], kurulumEksik: false }),
  ]);
  const begendiklerim = await begendigimGonderiler(gonderiler.map((g) => g.id));

  return (
    <main className="bg-stone-50 min-h-screen">
      <PerdeBandi
        ustEtiket="Akış"
        baslik="Salondan"
        vurgu="çıkınca konuşulanlar"
        aciklama="Kısa notlar, sıcak tepkiler. Uzun uzun yazacaksan başlık aç."
      />

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_21rem] gap-8 items-start">
        <div className="min-w-0 max-w-2xl w-full">
          {kurulumEksik && <KurulumNotu dosya="docs/migrations/2026-11-11b_sohbet_baslik_akis.sql" />}

          <section className="bg-white border border-stone-200 rounded-3xl p-5 mb-6">
            {user ? (
              <GonderiFormu />
            ) : (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-stone-700">Paylaşmak ve beğenmek için giriş yap.</p>
                <span className="flex gap-2">
                  <Link href="/giris" className="dugme-cizgi py-2!">Giriş yap</Link>
                  <Link href="/kayit" className="dugme py-2!">Kayıt ol</Link>
                </span>
              </div>
            )}
          </section>

          {gonderiler.length === 0 ? (
            <BosDurum
              icon={Rss}
              baslik="Akış henüz sessiz"
              aciklama="İlk notu sen düş: bu hafta ne izledin?"
            />
          ) : (
            <ol className="sirali space-y-4">
              {gonderiler.map((g) => {
                const ad = g.display_name || g.username || "Perdea üyesi";
                return (
                  <li key={g.id} className="bg-white border border-stone-200 rounded-3xl p-5">
                    <div className="flex items-start gap-3">
                      <Avatar ad={ad} url={g.avatar_url} boyut="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-500">
                          {g.username ? (
                            <Link href={`/u/${g.username}`} className="font-semibold text-stone-900 hover:text-emerald-700">
                              {ad}
                            </Link>
                          ) : (
                            <span className="font-semibold text-stone-900">{ad}</span>
                          )}{" "}
                          · {goreceli(g.created_at)}
                        </p>
                        <p className="mt-1.5 text-stone-900 text-lg leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                          {g.icerik}
                        </p>
                        <div className="mt-3 flex items-center gap-1 -ml-2.5">
                          <BegenDugmesi
                            begenildi={begendiklerim.has(g.id)}
                            sayi={g.begeni_sayisi}
                            girisli={Boolean(user)}
                            degistir={gonderiBegenAction.bind(null, g.id)}
                          />
                          {user?.id === g.user_id && (
                            <form action={gonderiSilAction.bind(null, g.id)}>
                              <button
                                type="submit"
                                aria-label="Gönderiyi sil"
                                title="Sil"
                                className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          )}
                        </div>
                        {user && user.id !== g.user_id && (
                          <div className="mt-2">
                            <BildirFormu hedefId={g.id} action={gonderiSikayetAction} ozet="Bildir" />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="bg-white border border-stone-200 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-altin-koyu" />
                Gündem
              </h2>
              <Link href="/baslik" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                Tümü <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {basliklar.length === 0 ? (
              <p className="text-stone-500">
                Henüz başlık yok.{" "}
                <Link href="/baslik#baslik-ac" className="underline text-stone-900">İlkini aç</Link>.
              </p>
            ) : (
              <ol className="space-y-3">
                {basliklar.map((b, i) => (
                  <li key={b.id}>
                    <Link href={`/baslik/${b.slug}`} className="group flex items-baseline gap-3">
                      <span className="font-display font-bold text-stone-300 w-4 text-right group-hover:text-emerald-600">
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 font-medium text-stone-900 group-hover:text-emerald-700 [overflow-wrap:anywhere]">
                        {b.baslik}
                      </span>
                      <span className="text-sm text-stone-500 tabular-nums">{b.entry_sayisi}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {bulusmaSonuc.bulusmalar.length > 0 && (
            <section className="bg-white border border-stone-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-stone-900">Yaklaşan buluşmalar</h2>
                <Link href="/cosplay" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                  Tümü <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <ul className="space-y-3">
                {bulusmaSonuc.bulusmalar.map((b) => {
                  const t = tarihParcalari(b.zaman);
                  return (
                    <li key={b.id}>
                      <Link href={`/cosplay/${b.id}`} className="group flex items-center gap-3">
                        <span className="text-center leading-none w-11 shrink-0">
                          <span className="block font-display text-2xl font-bold text-emerald-700">{t.gun}</span>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mt-0.5">{t.ay}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-stone-900 group-hover:text-emerald-700 line-clamp-1">{b.baslik}</span>
                          <span className="block text-sm text-stone-500 line-clamp-1">{b.sehir}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
