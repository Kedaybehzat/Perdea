'use client'

import { useSyncExternalStore, useState } from "react";
import { BellRing } from "lucide-react";

const aboneOl = () => () => {};
const izinOku = () => (typeof Notification === "undefined" ? "yok" : Notification.permission);

// Tarayıcı bildirimi izni: sekme arkadayken yeni mesajı haber verir.
export default function IzinDugmesi() {
  const ilk = useSyncExternalStore(aboneOl, izinOku, () => "bilinmiyor");
  const [sonra, setSonra] = useState<string>();
  const izin = sonra ?? ilk;

  if (izin === "bilinmiyor" || izin === "yok") return null;

  if (izin === "granted") {
    return (
      <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2">
        <BellRing className="w-4 h-4 shrink-0" />
        Tarayıcı bildirimleri açık. Perdea başka sekmedeyken yeni mesajı haber veririz.
      </p>
    );
  }

  if (izin === "denied") {
    return (
      <p className="text-sm text-stone-600 bg-white border border-stone-200 rounded-2xl px-4 py-3">
        Tarayıcı bildirimleri engellenmiş. Açmak için adres çubuğundaki kilit simgesinden bu siteye bildirim izni ver.
      </p>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-stone-700">
        Perdea başka sekmedeyken yeni mesajı haber verelim mi?
      </p>
      <button
        type="button"
        className="dugme py-2! text-sm"
        onClick={async () => setSonra(await Notification.requestPermission())}
      >
        <BellRing className="w-4 h-4" />
        Bildirimleri aç
      </button>
    </div>
  );
}
