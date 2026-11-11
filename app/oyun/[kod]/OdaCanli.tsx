'use client'

import { useState } from "react";
import {
  Check, Copy, Crown, Flag, HelpCircle, LogOut, RotateCcw, SkipForward, Trophy, UserMinus, X,
} from "lucide-react";
import type { Cevap, OdaDurumu, OdaHamlesi, OdaOyuncusu } from "@/lib/oyun-tipleri";
import { oyuncuAdi } from "@/lib/oyun-tipleri";
import Avatar from "@/components/ui/Avatar";
import FormMesaji from "@/components/ui/FormMesaji";
import {
  cevapVerAction, karakterYazAction, lobiyeDonAction, odadanAyrilAction, oyuncuCikarAction,
  oyunuBaslatAction, pesEtAction, sirayiDevretAction, soruSorAction, tahminEtAction,
  tahminiOnaylaAction,
} from "../actions";
import { useIslem, useOdaCanli } from "./kancalar";

const asamalar = [
  { anahtar: "lobi", etiket: "Lobi" },
  { anahtar: "karakter", etiket: "Karakterler" },
  { anahtar: "oyun", etiket: "Oyun" },
  { anahtar: "bitti", etiket: "Sonuç" },
] as const;

const cevapStili: Record<Cevap, { etiket: string; sinif: string; secili: string }> = {
  evet: {
    etiket: "Evet",
    sinif: "bg-emerald-50 border-emerald-200 text-emerald-800",
    secili: "bg-emerald-600 border-emerald-600 text-white",
  },
  hayir: {
    etiket: "Hayır",
    sinif: "bg-rose-50 border-rose-200 text-rose-700",
    secili: "bg-rose-600 border-rose-600 text-white",
  },
  belki: {
    etiket: "Belki",
    sinif: "bg-amber-50 border-amber-200 text-amber-800",
    secili: "bg-amber-500 border-amber-500 text-white",
  },
};

export default function OdaCanli({ durum }: { durum: OdaDurumu }) {
  const { oda, hamleler, ben } = durum;
  useOdaCanli(oda.id);

  const kurucuyum = oda.kurucu_id === ben;
  const asamaNo = asamalar.findIndex((a) => a.anahtar === oda.durum);

  return (
    <main className="min-h-screen">
      {/* Oda başlığı */}
      <section className="perde-zemin text-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex items-end justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-altin mb-2">
              Ben Kimim? · {oda.tur}. tur{oda.tema ? ` · ${oda.tema}` : ""}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight truncate">{oda.ad}</h1>
            <ol className="mt-4 flex items-center gap-2 text-xs font-semibold">
              {asamalar.map((a, i) => (
                <li
                  key={a.anahtar}
                  aria-current={i === asamaNo ? "step" : undefined}
                  className={`px-3 py-1 rounded-full border ${
                    i === asamaNo
                      ? "bg-stone-50 text-perde-900 border-stone-50"
                      : i < asamaNo
                      ? "border-white/30 text-emerald-100"
                      : "border-white/15 text-emerald-100/50"
                  }`}
                >
                  {a.etiket}
                </li>
              ))}
            </ol>
          </div>
          <KodKarti kod={oda.kod} />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 min-w-0">
          {oda.durum === "lobi" && <Lobi durum={durum} kurucuyum={kurucuyum} />}
          {oda.durum === "karakter" && <KarakterAsamasi durum={durum} />}
          {oda.durum === "oyun" && <OyunAsamasi durum={durum} kurucuyum={kurucuyum} />}
          {oda.durum === "bitti" && <Bitis durum={durum} kurucuyum={kurucuyum} />}
        </div>

        <aside className="lg:sticky lg:top-24 space-y-4">
          <OyuncuListesi durum={durum} kurucuyum={kurucuyum} />
          <OdaIslemleri durum={durum} kurucuyum={kurucuyum} hamleSayisi={hamleler.length} />
        </aside>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------

function KodKarti({ kod }: { kod: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/oyun/${kod}`);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      // Pano izni yoksa kod zaten ekranda yazıyor.
    }
  }

  return (
    <div className="bg-kum text-stone-900 rounded-2xl px-5 py-3 flex items-center gap-4 shrink-0">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Oda kodu</p>
        <p className="font-mono text-2xl font-bold tracking-[0.3em]">{kod}</p>
      </div>
      <button
        type="button"
        onClick={kopyala}
        className="dugme-cizgi py-2! px-3! text-sm"
        aria-live="polite"
      >
        {kopyalandi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        {kopyalandi ? "Kopyalandı" : "Daveti kopyala"}
      </button>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-kart ${className}`}>
      {children}
    </section>
  );
}

// ---- Lobi -------------------------------------------------------------------

function Lobi({ durum, kurucuyum }: { durum: OdaDurumu; kurucuyum: boolean }) {
  const { oda, oyuncular } = durum;
  const { bekliyor, hata, calistir } = useIslem();
  const yeterli = oyuncular.length >= 2;

  return (
    <Panel>
      <h2 className="text-3xl font-bold text-stone-900 mb-2">Oyuncular toplanıyor</h2>
      <p className="text-stone-600 mb-6">
        {oyuncular.length} / {oda.kapasite} kişi odada. Kodu ya da davet bağlantısını
        arkadaşlarına gönder.
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        {oyuncular.map((o) => (
          <div key={o.user_id} className="flex items-center gap-2 bg-stone-100 rounded-full pl-1 pr-4 py-1">
            <Avatar ad={oyuncuAdi(o)} url={o.avatar_url} boyut="sm" />
            <span className="text-sm font-semibold text-stone-800">{oyuncuAdi(o)}</span>
          </div>
        ))}
        {Array.from({ length: Math.max(0, oda.kapasite - oyuncular.length) }, (_, i) => (
          <div
            key={`bos-${i}`}
            className="w-10 h-10 rounded-full border-2 border-dashed border-stone-300"
            aria-hidden
          />
        ))}
      </div>

      <FormMesaji hata={hata} />

      {kurucuyum ? (
        <div className="mt-4">
          <button
            type="button"
            disabled={!yeterli || bekliyor}
            onClick={() => calistir(() => oyunuBaslatAction(oda.kod))}
            className="dugme w-full sm:w-auto"
          >
            {bekliyor ? "Başlatılıyor…" : "Oyunu başlat"}
          </button>
          {!yeterli && (
            <p className="text-sm text-stone-500 mt-2">Başlatmak için en az 2 kişi olmalı.</p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-stone-600 bg-stone-100 rounded-xl px-4 py-3 text-sm">
          Kurucunun oyunu başlatması bekleniyor…
        </p>
      )}
    </Panel>
  );
}

// ---- Karakter yazma -----------------------------------------------------------

function KarakterAsamasi({ durum }: { durum: OdaDurumu }) {
  const { oda, oyuncular, ben } = durum;
  const hedef = oyuncular.find((o) => o.yazan_id === ben);
  const hazir = oyuncular.filter((o) => o.karakter_hazir).length;
  const { bekliyor, hata, calistir } = useIslem();
  const [duzenle, setDuzenle] = useState(false);

  return (
    <div className="space-y-6">
      <Panel>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
          Senin görevin
        </p>
        {hedef ? (
          <>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              {oyuncuAdi(hedef)} kim olsun?
            </h2>
            <p className="text-stone-600 mb-6">
              Onun alnına yazılacak karakteri sen seçiyorsun. O göremeyecek; diğer herkes görecek.
              {oda.tema ? ` Tema: ${oda.tema}.` : ""}
            </p>

            {hedef.karakter_hazir && !duzenle ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-emerald-800">Yazdığın karakter</p>
                  <p className="font-display text-2xl font-bold text-stone-900">{hedef.karakter}</p>
                  {hedef.eser && <p className="text-sm text-stone-600">{hedef.eser}</p>}
                </div>
                <button type="button" onClick={() => setDuzenle(true)} className="dugme-cizgi">
                  Değiştir
                </button>
              </div>
            ) : (
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  calistir(
                    () =>
                      karakterYazAction(
                        oda.kod,
                        String(fd.get("karakter") ?? ""),
                        String(fd.get("eser") ?? "")
                      ),
                    () => setDuzenle(false)
                  );
                }}
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-stone-800">Karakter</span>
                  <input
                    name="karakter"
                    required
                    maxLength={60}
                    defaultValue={hedef.karakter ?? ""}
                    placeholder="Örn. Jack Sparrow"
                    autoComplete="off"
                    className="alan"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-stone-800">
                    Hangi yapımdan? <span className="font-normal text-stone-500">(isteğe bağlı)</span>
                  </span>
                  <input
                    name="eser"
                    maxLength={60}
                    defaultValue={hedef.eser ?? ""}
                    placeholder="Örn. Karayip Korsanları"
                    autoComplete="off"
                    className="alan"
                  />
                </label>
                <div className="sm:col-span-2 space-y-3">
                  <FormMesaji hata={hata} />
                  <button type="submit" disabled={bekliyor} className="dugme">
                    {bekliyor ? "Kaydediliyor…" : "Karakteri kaydet"}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <p className="text-stone-600">Bu turda yazacağın karakter yok.</p>
        )}
      </Panel>

      <Panel>
        <h2 className="text-2xl font-bold text-stone-900 mb-1">
          {hazir} / {oyuncular.length} karakter hazır
        </h2>
        <p className="text-stone-600 text-sm mb-4">Herkes yazınca oyun kendiliğinden başlar.</p>
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(hazir / oyuncular.length) * 100}%` }}
          />
        </div>
      </Panel>
    </div>
  );
}

// ---- Oyun -------------------------------------------------------------------

function OyunAsamasi({ durum, kurucuyum }: { durum: OdaDurumu; kurucuyum: boolean }) {
  const { oda, oyuncular, hamleler, ben } = durum;
  const benOyuncu = oyuncular.find((o) => o.user_id === ben);
  const siradaki = oyuncular.find((o) => o.user_id === oda.sira_id);
  const aktifSoru = hamleler.find((h) => h.id === oda.aktif_soru_id);
  const siraBende = oda.sira_id === ben;
  const gecmis = hamleler.filter((h) => h.id !== oda.aktif_soru_id).slice().reverse();
  const kisi = (id: string) => oyuncular.find((o) => o.user_id === id);

  return (
    <div className="space-y-6">
      {benOyuncu && benOyuncu.durum !== "oynuyor" && (
        <div
          className={`rounded-2xl px-5 py-4 border ${
            benOyuncu.durum === "bildi"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-stone-100 border-stone-200 text-stone-700"
          }`}
        >
          <p className="font-semibold">
            {benOyuncu.durum === "bildi"
              ? `Buldun! ${benOyuncu.derece}. sırada bildin.`
              : "Pes ettin."}{" "}
            Karakterin: <span className="font-display text-lg font-bold">{benOyuncu.karakter}</span>
            {benOyuncu.eser ? ` (${benOyuncu.eser})` : ""}
          </p>
          <p className="text-sm mt-1 opacity-80">Diğerlerinin sorularını cevaplamaya devam edebilirsin.</p>
        </div>
      )}

      <Panel>
        {siraBende ? (
          aktifSoru ? (
            <CevapBekleniyor durum={durum} soru={aktifSoru} />
          ) : (
            <SoruTahminFormu kod={oda.kod} />
          )
        ) : aktifSoru && siradaki ? (
          <SoruyaCevap durum={durum} soru={aktifSoru} soran={siradaki} />
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
              Sıra
            </p>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              {siradaki ? `${oyuncuAdi(siradaki)} düşünüyor…` : "Sıra belirleniyor…"}
            </h2>
            <p className="text-stone-600">
              Bir soru sorduğunda burada cevaplayacaksın.
              {siradaki?.karakter ? (
                <>
                  {" "}
                  Karakteri: <strong className="text-stone-900">{siradaki.karakter}</strong>
                  {siradaki.eser ? ` (${siradaki.eser})` : ""}.
                </>
              ) : null}
            </p>
            {kurucuyum && <SirayiAtla kod={oda.kod} />}
          </div>
        )}
      </Panel>

      <section>
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Tur günlüğü</h2>
        {gecmis.length === 0 ? (
          <p className="text-stone-600 bg-white border border-dashed border-stone-300 rounded-2xl px-5 py-8 text-center">
            Henüz soru sorulmadı.
          </p>
        ) : (
          <ul className="space-y-3">
            {gecmis.map((h) => (
              <HamleSatiri key={h.id} hamle={h} durum={durum} yapan={kisi(h.user_id)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SoruTahminFormu({ kod }: { kod: string }) {
  const [mod, setMod] = useState<"soru" | "tahmin">("soru");
  const [metin, setMetin] = useState("");
  const [sonuc, setSonuc] = useState<string | undefined>();
  const { bekliyor, hata, calistir } = useIslem();

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    const m = metin.trim();
    if (!m) return;
    setSonuc(undefined);
    if (mod === "soru") {
      calistir(() => soruSorAction(kod, m), () => setMetin(""));
    } else {
      calistir(async () => {
        const r = await tahminEtAction(kod, m);
        if (!r.hata) {
          setSonuc(r.tuttu ? undefined : `"${m}" değil. Sıra geçti.`);
          setMetin("");
        }
        return r;
      });
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">Sıra sende</p>
      <h2 className="text-3xl font-bold text-stone-900 mb-5">
        {mod === "soru" ? "Bir evet/hayır sorusu sor" : "Kim olduğunu tahmin et"}
      </h2>

      <div className="inline-flex p-1 bg-stone-100 rounded-xl mb-4" role="tablist">
        {(["soru", "tahmin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mod === m}
            onClick={() => setMod(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              mod === m ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {m === "soru" ? "Soru sor" : "Tahmin et"}
          </button>
        ))}
      </div>

      <form onSubmit={gonder} className="flex flex-col sm:flex-row gap-3">
        <input
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          maxLength={200}
          required
          autoComplete="off"
          aria-label={mod === "soru" ? "Sorun" : "Tahminin"}
          placeholder={mod === "soru" ? "Ben bir anime karakteri miyim?" : "Ben … miyim?  (karakterin adını yaz)"}
          className="alan flex-1"
        />
        <button type="submit" disabled={bekliyor || !metin.trim()} className="dugme shrink-0">
          {bekliyor ? "Gönderiliyor…" : mod === "soru" ? "Sor" : "Tahmin et"}
        </button>
      </form>

      <div className="mt-3 space-y-3">
        <FormMesaji hata={hata ?? sonuc} />
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir(() => sirayiDevretAction(kod))}
          className="text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4"
        >
          Pas geç
        </button>
      </div>
    </div>
  );
}

function CevapSayaci({ hamle, kisiSayisi }: { hamle: OdaHamlesi; kisiSayisi?: number }) {
  const say = (c: Cevap) => hamle.cevaplar.filter((x) => x.cevap === c).length;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {(["evet", "hayir", "belki"] as const).map((c) => {
        const n = say(c);
        return (
          <span
            key={c}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              n > 0 ? cevapStili[c].sinif : "bg-stone-50 border-stone-200 text-stone-400"
            }`}
          >
            {cevapStili[c].etiket} <span className="tabular-nums">{n}</span>
          </span>
        );
      })}
      {kisiSayisi !== undefined && (
        <span className="text-xs text-stone-500">
          {hamle.cevaplar.length} / {kisiSayisi} cevapladı
        </span>
      )}
    </div>
  );
}

function CevapBekleniyor({ durum, soru }: { durum: OdaDurumu; soru: OdaHamlesi }) {
  const { bekliyor, hata, calistir } = useIslem();
  const digerleri = durum.oyuncular.length - 1;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
        Sorun soruldu
      </p>
      <h2 className="text-3xl font-bold text-stone-900 mb-4">“{soru.metin}”</h2>
      <CevapSayaci hamle={soru} kisiSayisi={digerleri} />
      <p className="text-sm text-stone-600 mt-4">
        Herkes cevaplayınca sıra kendiliğinden geçer. Beklemek istemezsen en az bir cevaptan
        sonra devredebilirsin.
      </p>
      <div className="mt-4 space-y-3">
        <FormMesaji hata={hata} />
        <button
          type="button"
          disabled={bekliyor || soru.cevaplar.length === 0}
          onClick={() => calistir(() => sirayiDevretAction(durum.oda.kod))}
          className="dugme-cizgi"
        >
          <SkipForward className="w-4 h-4" />
          Sırayı devret
        </button>
      </div>
    </div>
  );
}

function SoruyaCevap({
  durum, soru, soran,
}: {
  durum: OdaDurumu;
  soru: OdaHamlesi;
  soran: OdaOyuncusu;
}) {
  const { bekliyor, hata, calistir } = useIslem();
  const benimCevabim = soru.cevaplar.find((c) => c.user_id === durum.ben)?.cevap;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
        {oyuncuAdi(soran)} soruyor
      </p>
      <h2 className="text-3xl font-bold text-stone-900 mb-3">“{soru.metin}”</h2>
      {soran.karakter && (
        <p className="text-stone-600 mb-5">
          Onun karakteri:{" "}
          <strong className="font-display text-lg text-stone-900">{soran.karakter}</strong>
          {soran.eser ? ` (${soran.eser})` : ""}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {(["evet", "hayir", "belki"] as const).map((c) => (
          <button
            key={c}
            type="button"
            disabled={bekliyor}
            aria-pressed={benimCevabim === c}
            onClick={() => calistir(() => cevapVerAction(durum.oda.kod, soru.id, c))}
            className={`py-3.5 rounded-xl border-2 font-bold text-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 ${
              benimCevabim === c ? cevapStili[c].secili : cevapStili[c].sinif
            }`}
          >
            {cevapStili[c].etiket}
          </button>
        ))}
      </div>
      <FormMesaji hata={hata} />
      <div className="mt-3">
        <CevapSayaci hamle={soru} kisiSayisi={durum.oyuncular.length - 1} />
      </div>
    </div>
  );
}

function SirayiAtla({ kod }: { kod: string }) {
  const { bekliyor, hata, calistir } = useIslem();
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={bekliyor}
        onClick={() => calistir(() => sirayiDevretAction(kod))}
        className="text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4"
      >
        Oyuncu yanıt vermiyor mu? Sırayı atla
      </button>
      <FormMesaji hata={hata} />
    </div>
  );
}

function HamleSatiri({
  hamle, durum, yapan,
}: {
  hamle: OdaHamlesi;
  durum: OdaDurumu;
  yapan: OdaOyuncusu | undefined;
}) {
  const { bekliyor, hata, calistir } = useIslem();
  const ad = yapan ? oyuncuAdi(yapan) : "Oyuncu";
  const onaylayabilirim =
    hamle.tip === "tahmin" &&
    hamle.dogru === false &&
    yapan?.yazan_id === durum.ben &&
    yapan.durum === "oynuyor" &&
    durum.oda.durum === "oyun";

  return (
    <li className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-3">
      <Avatar ad={ad} url={yapan?.avatar_url} boyut="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-stone-500">
          <span className="font-semibold text-stone-800">{ad}</span>{" "}
          {hamle.tip === "soru" ? "sordu" : "tahmin etti"}
        </p>
        <p className="text-stone-900 font-medium break-words">{hamle.metin}</p>
        <div className="mt-2">
          {hamle.tip === "soru" ? (
            <CevapSayaci hamle={hamle} />
          ) : hamle.dogru ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
              <Check className="w-3.5 h-3.5" /> Doğru!
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                <X className="w-3.5 h-3.5" /> Tutmadı
              </span>
              {onaylayabilirim && (
                <button
                  type="button"
                  disabled={bekliyor}
                  onClick={() => calistir(() => tahminiOnaylaAction(durum.oda.kod, hamle.id))}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
                >
                  Yazım farkı mı? Doğru say
                </button>
              )}
            </span>
          )}
        </div>
        <FormMesaji hata={hata} />
      </div>
    </li>
  );
}

// ---- Bitiş ------------------------------------------------------------------

function Bitis({ durum, kurucuyum }: { durum: OdaDurumu; kurucuyum: boolean }) {
  const { oda, oyuncular, ben } = durum;
  const { bekliyor, hata, calistir } = useIslem();
  const sirali = oyuncular.slice().sort((a, b) => {
    if (a.derece !== null && b.derece !== null) return a.derece - b.derece;
    if (a.derece !== null) return -1;
    if (b.derece !== null) return 1;
    return a.sira_no - b.sira_no;
  });
  const kazanan = sirali.find((o) => o.derece === 1);

  return (
    <Panel>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-altin/20 text-altin-koyu mb-3">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-bold text-stone-900">
          {kazanan
            ? kazanan.user_id === ben
              ? "Turu sen kazandın!"
              : `${oyuncuAdi(kazanan)} kazandı!`
            : "Tur bitti"}
        </h2>
        <p className="text-stone-600 mt-2">Bütün karakterler açıldı.</p>
      </div>

      <ol className="space-y-3 mb-8">
        {sirali.map((o) => (
          <li
            key={o.user_id}
            className={`flex items-center gap-4 rounded-2xl border p-4 ${
              o.derece === 1 ? "bg-amber-50 border-amber-200" : "bg-stone-50 border-stone-200"
            }`}
          >
            <span
              className="font-display text-3xl font-bold w-10 text-center tabular-nums text-stone-400"
              aria-label={o.derece ? `${o.derece}. sıra` : "pes etti"}
            >
              {o.derece ?? "–"}
            </span>
            <Avatar ad={oyuncuAdi(o)} url={o.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-stone-900 truncate">
                {oyuncuAdi(o)} {o.user_id === ben && <span className="text-stone-400 font-normal">(sen)</span>}
              </p>
              <p className="text-sm text-stone-600 truncate">
                <span className="font-display font-bold text-stone-900">{o.karakter ?? "—"}</span>
                {o.eser ? ` · ${o.eser}` : ""}
              </p>
            </div>
            <p className="text-xs text-stone-500 text-right shrink-0">
              {o.soru_sayisi} soru
              <br />
              {o.tahmin_sayisi} tahmin
            </p>
          </li>
        ))}
      </ol>

      <FormMesaji hata={hata} />
      {kurucuyum ? (
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir(() => oyunuBaslatAction(oda.kod))}
          className="dugme w-full mt-3"
        >
          <RotateCcw className="w-4 h-4" />
          {bekliyor ? "Başlatılıyor…" : "Yeni tur başlat"}
        </button>
      ) : (
        <p className="text-stone-600 bg-stone-100 rounded-xl px-4 py-3 text-sm text-center mt-3">
          Kurucu yeni turu başlatınca roller kayacak.
        </p>
      )}
    </Panel>
  );
}

// ---- Yan panel ---------------------------------------------------------------

function OyuncuListesi({ durum, kurucuyum }: { durum: OdaDurumu; kurucuyum: boolean }) {
  const { oda, oyuncular, ben } = durum;
  const { bekliyor, hata, calistir } = useIslem();
  const kisi = (id: string | null) => oyuncular.find((o) => o.user_id === id);

  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-5 shadow-kart">
      <h2 className="font-sans text-sm font-bold uppercase tracking-[0.16em] text-stone-500 mb-4">
        Oyuncular · {oyuncular.length}/{oda.kapasite}
      </h2>
      <ul className="space-y-3">
        {oyuncular.map((o) => {
          const sirada = oda.durum === "oyun" && oda.sira_id === o.user_id;
          const benim = o.user_id === ben;
          const yazan = kisi(o.yazan_id);
          return (
            <li
              key={o.user_id}
              className={`flex items-center gap-3 rounded-2xl p-2 -m-2 ${sirada ? "bg-emerald-50" : ""}`}
            >
              <div className="relative">
                <Avatar ad={oyuncuAdi(o)} url={o.avatar_url} />
                {sirada && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900 truncate flex items-center gap-1.5">
                  <span className="truncate">{oyuncuAdi(o)}</span>
                  {benim && <span className="text-xs font-normal text-stone-400">(sen)</span>}
                  {o.user_id === oda.kurucu_id && (
                    <Crown className="w-3.5 h-3.5 text-altin-koyu shrink-0" aria-label="Kurucu" />
                  )}
                </p>
                <p className="text-sm text-stone-500 truncate">
                  {oda.durum === "lobi" && "Hazır"}
                  {oda.durum === "karakter" &&
                    (o.karakter_hazir
                      ? "Karakteri hazır"
                      : yazan
                      ? `${yazan.user_id === ben ? "Sen yazıyorsun" : `${oyuncuAdi(yazan)} yazıyor`}…`
                      : "Bekliyor")}
                  {(oda.durum === "oyun" || oda.durum === "bitti") &&
                    (o.karakter ? (
                      <>
                        <span className="text-stone-800 font-medium">{o.karakter}</span>
                        {o.eser ? ` · ${o.eser}` : ""}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Kim olduğunu bilmiyor
                      </span>
                    ))}
                </p>
              </div>
              {oda.durum === "oyun" && o.durum === "bildi" && (
                <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">
                  {o.derece}. bildi
                </span>
              )}
              {oda.durum === "oyun" && o.durum === "pes" && (
                <span className="text-xs font-bold bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full shrink-0">
                  Pes
                </span>
              )}
              {kurucuyum && !benim && (oda.durum === "lobi" || oda.durum === "bitti") && (
                <button
                  type="button"
                  disabled={bekliyor}
                  onClick={() => calistir(() => oyuncuCikarAction(oda.kod, o.user_id))}
                  aria-label={`${oyuncuAdi(o)} oyuncusunu odadan çıkar`}
                  title="Odadan çıkar"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3">
        <FormMesaji hata={hata} />
      </div>
    </section>
  );
}

function OdaIslemleri({
  durum, kurucuyum, hamleSayisi,
}: {
  durum: OdaDurumu;
  kurucuyum: boolean;
  hamleSayisi: number;
}) {
  const { oda, oyuncular, ben } = durum;
  const { bekliyor, hata, calistir } = useIslem();
  const [pesOnay, setPesOnay] = useState(false);
  const benOyuncu = oyuncular.find((o) => o.user_id === ben);
  const oyunda = oda.durum === "karakter" || oda.durum === "oyun";

  return (
    <div className="space-y-3 text-sm">
      {oda.durum === "oyun" && benOyuncu?.durum === "oynuyor" && (
        pesOnay ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="text-stone-700 mb-3">Pes edersen karakterin sana açılır. Emin misin?</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={bekliyor}
                onClick={() => calistir(() => pesEtAction(oda.kod), () => setPesOnay(false))}
                className="dugme-cizgi py-2!"
              >
                Evet, pes ediyorum
              </button>
              <button type="button" onClick={() => setPesOnay(false)} className="px-3 text-stone-500 hover:text-stone-900">
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPesOnay(true)}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900"
          >
            <Flag className="w-4 h-4" />
            Pes et{hamleSayisi > 0 ? "" : " (daha yeni başladık!)"}
          </button>
        )
      )}

      {kurucuyum && oda.durum !== "lobi" && (
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir(() => lobiyeDonAction(oda.kod))}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900"
        >
          <RotateCcw className="w-4 h-4" />
          {oyunda ? "Turu iptal et, lobiye dön" : "Lobiye dön (yeni oyuncu al)"}
        </button>
      )}

      {!oyunda && (
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir(() => odadanAyrilAction(oda.kod))}
          className="flex items-center gap-2 text-stone-500 hover:text-rose-600"
        >
          <LogOut className="w-4 h-4" />
          Odadan ayrıl
        </button>
      )}

      <FormMesaji hata={hata} />
    </div>
  );
}
