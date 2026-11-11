'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, Ban, ImagePlus, Mic, MoreVertical, Send, Square, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import BildirFormu from "@/components/ui/BildirFormu";
import type { Kisi, Mesaj } from "@/lib/sohbet-tipleri";
import {
  engelKaldirAction,
  engelleAction,
  medyaGonderAction,
  mesajGonderAction,
  sohbetSikayetAction,
} from "../actions";
import { EN_BUYUK_GORSEL, EN_UZUN_SES_SN, gorseliHazirla, medyaYukle, sesBicimi } from "./medya";

type Bekleyen = { anahtar: number; icerik: string; hata?: string };

const gunBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  weekday: "long",
  timeZone: "Europe/Istanbul",
});
const saatBicimi = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export default function MesajAlani({
  sohbetId,
  benId,
  diger,
  digerAd,
  mesajlar,
  engelli,
  benEngelledim,
}: {
  sohbetId: string;
  benId: string;
  diger: Kisi;
  digerAd: string;
  mesajlar: Mesaj[];
  engelli: boolean;
  benEngelledim: boolean;
}) {
  const router = useRouter();
  const [metin, setMetin] = useState("");
  const [bekleyenler, setBekleyenler] = useState<Bekleyen[]>([]);
  const [menuAcik, setMenuAcik] = useState(false);
  const [hata, setHata] = useState<string>();
  const [, baslat] = useTransition();
  const son = useRef<HTMLDivElement>(null);
  const sayac = useRef(0);
  const dosyaGirdisi = useRef<HTMLInputElement>(null);
  const [yukleniyor, setYukleniyor] = useState<string>();
  const [kayitSn, setKayitSn] = useState<number | null>(null);
  const kayit = useRef<{ kaydedici: MediaRecorder; akis: MediaStream; iptal: boolean; baslangic: number } | null>(null);

  // Canlı: yeni mesaj gelince tazele. Realtime bağlanamazsa birkaç saniyede bir yokla.
  useEffect(() => {
    let canli = false;
    const supabase = createClient();
    const kanal = supabase
      .channel(`sohbet:${sohbetId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mesajlar", filter: `sohbet_id=eq.${sohbetId}` },
        () => router.refresh()
      )
      .subscribe((durum) => {
        canli = durum === "SUBSCRIBED";
      });

    const yokla = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!canli) router.refresh();
    }, 4000);
    const yedek = setInterval(() => {
      if (canli && document.visibilityState === "visible") router.refresh();
    }, 20000);
    const gorunur = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", gorunur);

    return () => {
      clearInterval(yokla);
      clearInterval(yedek);
      document.removeEventListener("visibilitychange", gorunur);
      supabase.removeChannel(kanal);
    };
  }, [sohbetId, router]);

  // Yeni mesajda en alta in.
  useEffect(() => {
    son.current?.scrollIntoView({ block: "end" });
  }, [mesajlar.length, bekleyenler.length]);

  function gonder(icerik: string, anahtar?: number) {
    const temiz = icerik.trim();
    if (!temiz) return;
    const k = anahtar ?? ++sayac.current;
    setBekleyenler((b) => [...b.filter((x) => x.anahtar !== k), { anahtar: k, icerik: temiz }]);
    baslat(async () => {
      const r = await mesajGonderAction(sohbetId, temiz);
      if (r.hata) {
        setBekleyenler((b) => b.map((x) => (x.anahtar === k ? { ...x, hata: r.hata } : x)));
        return;
      }
      router.refresh();
      setBekleyenler((b) => b.filter((x) => x.anahtar !== k));
    });
  }

  async function medyaGonder(tur: "gorsel" | "ses", veri: Blob, uzanti: string, tip: string, sureSn?: number) {
    setHata(undefined);
    setYukleniyor(tur === "gorsel" ? "Fotoğraf gönderiliyor…" : "Sesli mesaj gönderiliyor…");
    try {
      const yukleme = await medyaYukle(sohbetId, benId, veri, uzanti, tip);
      if (yukleme.hata || !yukleme.yol) {
        setHata(yukleme.hata ?? "Dosya yüklenemedi.");
        return;
      }
      const r = await medyaGonderAction(sohbetId, tur, yukleme.yol, sureSn);
      if (r.hata) setHata(r.hata);
      else router.refresh();
    } finally {
      setYukleniyor(undefined);
    }
  }

  async function gorselSecildi(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;
    if (!dosya.type.startsWith("image/")) {
      setHata("Yalnızca fotoğraf gönderebilirsin.");
      return;
    }
    if (dosya.size > EN_BUYUK_GORSEL) {
      setHata("Fotoğraf çok büyük (en çok 15 MB).");
      return;
    }
    try {
      const kucuk = await gorseliHazirla(dosya);
      await medyaGonder("gorsel", kucuk, "jpg", "image/jpeg");
    } catch {
      setHata("Bu fotoğraf açılamadı. Başka bir dosya dener misin?");
    }
  }

  async function kaydiBaslat() {
    setHata(undefined);
    const bicim = sesBicimi();
    if (!bicim || !navigator.mediaDevices?.getUserMedia) {
      setHata("Bu tarayıcı ses kaydını desteklemiyor.");
      return;
    }
    let akis: MediaStream;
    try {
      akis = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setHata("Mikrofona izin verilmedi. Tarayıcının adres çubuğundan izin verip yeniden dene.");
      return;
    }
    const parcalar: Blob[] = [];
    const kaydedici = new MediaRecorder(akis, { mimeType: bicim.mime });
    const durum = { kaydedici, akis, iptal: false, baslangic: Date.now() };
    kayit.current = durum;
    kaydedici.ondataavailable = (ev) => {
      if (ev.data.size) parcalar.push(ev.data);
    };
    kaydedici.onstop = () => {
      akis.getTracks().forEach((t) => t.stop());
      const sure = Math.max(1, Math.round((Date.now() - durum.baslangic) / 1000));
      kayit.current = null;
      setKayitSn(null);
      if (durum.iptal || !parcalar.length) return;
      void medyaGonder("ses", new Blob(parcalar, { type: bicim.tip }), bicim.uzanti, bicim.tip, Math.min(sure, EN_UZUN_SES_SN));
    };
    kaydedici.start();
    setKayitSn(0);
  }

  function kaydiBitir(iptal: boolean) {
    const k = kayit.current;
    if (!k) return;
    k.iptal = iptal;
    if (k.kaydedici.state !== "inactive") k.kaydedici.stop();
  }

  // Kayıt sayacı; süre dolunca kendiliğinden gönderir. Sayfadan çıkılırsa mikrofonu bırak.
  useEffect(() => {
    if (kayitSn === null) return;
    if (kayitSn >= EN_UZUN_SES_SN) {
      kaydiBitir(false);
      return;
    }
    const z = setTimeout(() => setKayitSn((s) => (s === null ? null : s + 1)), 1000);
    return () => clearTimeout(z);
  }, [kayitSn]);
  useEffect(
    () => () => {
      const k = kayit.current;
      if (k) {
        k.iptal = true;
        if (k.kaydedici.state !== "inactive") k.kaydedici.stop();
        k.akis.getTracks().forEach((t) => t.stop());
      }
    },
    []
  );

  function formGonder(e: React.FormEvent) {
    e.preventDefault();
    gonder(metin);
    setMetin("");
  }

  function engelDegistir() {
    setHata(undefined);
    setMenuAcik(false);
    baslat(async () => {
      const r = benEngelledim
        ? await engelKaldirAction(diger.id, sohbetId)
        : await engelleAction(diger.id, sohbetId);
      if (r.hata) setHata(r.hata);
      router.refresh();
    });
  }

  // Gün başlıklarıyla grupla.
  const satirlar = useMemo(() => {
    const cikti: ({ tur: "gun"; etiket: string } | { tur: "mesaj"; m: Mesaj })[] = [];
    let oncekiGun = "";
    for (const m of mesajlar) {
      const gun = gunBicimi.format(new Date(m.created_at));
      if (gun !== oncekiGun) {
        cikti.push({ tur: "gun", etiket: gun });
        oncekiGun = gun;
      }
      cikti.push({ tur: "mesaj", m });
    }
    return cikti;
  }, [mesajlar]);

  return (
    <section className="flex flex-col min-h-0 min-w-0" aria-label={`${digerAd} ile sohbet`}>
      {/* Üst şerit */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
        <Link
          href="/sohbet"
          aria-label="Sohbetlere dön"
          className="md:hidden p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar ad={digerAd} url={diger.avatar_url} boyut="md" />
        <div className="flex-1 min-w-0">
          {diger.username ? (
            <Link href={`/u/${diger.username}`} className="font-semibold text-stone-900 hover:text-emerald-700 truncate block">
              {digerAd}
            </Link>
          ) : (
            <p className="font-semibold text-stone-900 truncate">{digerAd}</p>
          )}
          {diger.username && <p className="text-xs text-stone-500 truncate">@{diger.username}</p>}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuAcik((a) => !a)}
            aria-expanded={menuAcik}
            aria-label="Sohbet seçenekleri"
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuAcik && (
            <div className="animate-belir absolute right-0 top-full mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-kart p-4 z-20 space-y-4">
              <button
                type="button"
                onClick={engelDegistir}
                className="flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-800"
              >
                <Ban className="w-4 h-4" />
                {benEngelledim ? "Engeli kaldır" : `${digerAd} adlı kişiyi engelle`}
              </button>
              <BildirFormu hedefId={sohbetId} action={sohbetSikayetAction} ozet="Bu sohbeti bildir" />
            </div>
          )}
        </div>
      </header>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-5 bg-stone-50/60" aria-live="polite">
        {mesajlar.length === 0 && bekleyenler.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <Avatar ad={digerAd} url={diger.avatar_url} boyut="xl" />
            <p className="font-display text-2xl font-bold text-stone-900 mt-4">Eşleştiniz.</p>
            <p className="text-stone-600 mt-1 max-w-xs">
              İlk mesaj hep en zoru. Ortak bir favorinizle başla: “Finali sen nasıl buldun?”
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-1.5">
            {satirlar.map((s, i) =>
              s.tur === "gun" ? (
                <li key={`g${i}`} className="self-center my-3 text-xs font-semibold text-stone-500 bg-white border border-stone-200 rounded-full px-3 py-1">
                  {s.etiket}
                </li>
              ) : (
                <Balon key={s.m.id} benden={s.m.gonderen_id === benId} m={s.m} saat={saatBicimi.format(new Date(s.m.created_at))} />
              )
            )}
            {bekleyenler.map((b) => (
              <li key={`b${b.anahtar}`} className="self-end max-w-[80%] flex flex-col items-end">
                <span className={`px-4 py-2.5 rounded-2xl rounded-br-md whitespace-pre-wrap [overflow-wrap:anywhere] ${b.hata ? "bg-rose-100 text-rose-900" : "bg-emerald-600/70 text-white"}`}>
                  {b.icerik}
                </span>
                {b.hata ? (
                  <span className="text-xs text-rose-700 mt-1" role="alert">
                    {b.hata}{" "}
                    <button type="button" className="underline font-semibold" onClick={() => gonder(b.icerik, b.anahtar)}>
                      Yeniden dene
                    </button>
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 mt-0.5">Gönderiliyor…</span>
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={son} />
      </div>

      {/* Yazma alanı */}
      <div className="border-t border-stone-200 p-3">
        {hata && <p role="alert" className="text-sm text-rose-700 mb-2">{hata}</p>}
        {yukleniyor && <p role="status" className="text-sm text-stone-500 mb-2">{yukleniyor}</p>}
        {engelli ? (
          <p className="text-sm text-stone-600 text-center py-2">
            {benEngelledim ? (
              <>
                Bu kişiyi engelledin.{" "}
                <button type="button" onClick={engelDegistir} className="underline font-semibold text-stone-900">
                  Engeli kaldır
                </button>
              </>
            ) : (
              "Bu sohbette mesajlaşma kapalı."
            )}
          </p>
        ) : (
          kayitSn !== null ? (
            <div className="flex items-center gap-3" role="status">
              <button
                type="button"
                onClick={() => kaydiBitir(true)}
                aria-label="Kaydı iptal et"
                className="p-3 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <span className="flex-1 flex items-center gap-3 px-4 h-[46px] rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" aria-hidden />
                Kaydediliyor
                <span className="tabular-nums ml-auto">
                  {sureYaz(kayitSn)} / {sureYaz(EN_UZUN_SES_SN)}
                </span>
              </span>
              <button type="button" onClick={() => kaydiBitir(false)} aria-label="Kaydı bitir ve gönder" className="dugme px-4! h-[46px]">
                <Square className="w-4 h-4 fill-current" />
                Gönder
              </button>
            </div>
          ) : (
            <form onSubmit={formGonder} className="flex items-end gap-1.5">
              <input ref={dosyaGirdisi} type="file" accept="image/*" hidden onChange={gorselSecildi} />
              <button
                type="button"
                onClick={() => dosyaGirdisi.current?.click()}
                disabled={Boolean(yukleniyor)}
                aria-label="Fotoğraf gönder"
                title="Fotoğraf gönder"
                className="p-3 rounded-xl text-stone-600 hover:text-emerald-700 hover:bg-stone-100 disabled:opacity-50"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
              <textarea
                value={metin}
                onChange={(e) => setMetin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    gonder(metin);
                    setMetin("");
                  }
                }}
                rows={1}
                maxLength={1000}
                aria-label="Mesajın"
                placeholder="Bir mesaj yaz"
                className="alan flex-1 resize-none max-h-32 [field-sizing:content]"
              />
              {metin.trim() ? (
                <button type="submit" aria-label="Gönder" className="dugme px-4! h-[46px]">
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={kaydiBaslat}
                  disabled={Boolean(yukleniyor)}
                  aria-label="Sesli mesaj kaydet"
                  title="Sesli mesaj kaydet"
                  className="dugme px-4! h-[46px]"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          )
        )}
      </div>
    </section>
  );
}

function sureYaz(sn: number): string {
  return `${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, "0")}`;
}

function Balon({ benden, m, saat }: { benden: boolean; m: Mesaj; saat: string }) {
  const hiza = benden ? "self-end items-end" : "self-start items-start";
  let govde: React.ReactNode;

  if (m.tur !== "metin" && !m.medya_url) {
    govde = (
      <span className="px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-500 text-sm italic">
        {m.tur === "gorsel" ? "Fotoğraf yüklenemedi" : "Sesli mesaj yüklenemedi"}
      </span>
    );
  } else if (m.tur === "gorsel") {
    govde = (
      <a
        href={m.medya_url!}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 hover:opacity-95 transition-opacity"
        title="Büyük hâlini aç"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.medya_url!} alt="Gönderilen fotoğraf" loading="lazy" className="block max-h-80 max-w-full w-auto" />
      </a>
    );
  } else if (m.tur === "ses") {
    govde = (
      <span
        className={`flex items-center gap-2 pl-2 pr-3 py-2 rounded-2xl ${
          benden ? "bg-emerald-600 rounded-br-md" : "bg-white border border-stone-200 rounded-bl-md"
        }`}
      >
        <audio controls preload="metadata" src={m.medya_url!} className="h-10 w-56 max-w-full" aria-label="Sesli mesaj" />
        {m.sure_sn ? (
          <span className={`text-xs tabular-nums ${benden ? "text-emerald-50" : "text-stone-500"}`}>
            {sureYaz(m.sure_sn)}
          </span>
        ) : null}
      </span>
    );
  } else {
    govde = (
      <span
        className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap [overflow-wrap:anywhere] ${
          benden
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-white border border-stone-200 text-stone-900 rounded-bl-md"
        }`}
      >
        {m.icerik}
      </span>
    );
  }

  return (
    <li className={`max-w-[80%] flex flex-col ${hiza}`}>
      {govde}
      <span className="text-[11px] text-stone-400 mt-0.5 px-1">{saat}</span>
    </li>
  );
}
