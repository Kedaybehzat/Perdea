import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { goreceli } from "@/lib/zaman";
import { kisiAdi, type Kisi, type SohbetOzeti } from "@/lib/sohbet-tipleri";
import { sohbetBaslatAction } from "./actions";

// Sol sütun: yeni eşleşmeler (henüz yazışılmamış) + sohbetler.
export default function SohbetListesi({
  sohbetler,
  yeniEslesmeler,
  aktifId,
}: {
  sohbetler: SohbetOzeti[];
  yeniEslesmeler: Kisi[];
  aktifId?: string;
}) {
  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-3xl font-bold text-stone-900">Sohbetler</h1>
      </div>

      {yeniEslesmeler.length > 0 && (
        <div className="px-5 pb-4 border-b border-stone-200">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-3">
            Yeni eşleşmeler
          </p>
          <ul className="flex gap-3 overflow-x-auto kaydirma-gizli -mx-1 px-1 pb-1">
            {yeniEslesmeler.map((k) => (
              <li key={k.id} className="shrink-0">
                <form action={sohbetBaslatAction}>
                  <input type="hidden" name="kisiId" value={k.id} />
                  <button
                    type="submit"
                    className="group flex flex-col items-center gap-1.5 w-16"
                    title={`${kisiAdi(k)} ile sohbet başlat`}
                  >
                    <span className="rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-white transition-transform group-hover:scale-105">
                      <Avatar ad={kisiAdi(k)} url={k.avatar_url} boyut="lg" />
                    </span>
                    <span className="text-xs font-medium text-stone-700 truncate w-full text-center">
                      {kisiAdi(k)}
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sohbetler.length === 0 ? (
        <div className="px-5 py-10 text-center text-stone-500">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 text-stone-300" />
          {yeniEslesmeler.length > 0
            ? "Yukarıdan birine dokun, ilk mesajı sen yaz."
            : "Henüz sohbetin yok. Karşılıklı beğenince burada açılır."}
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto p-2">
          {sohbetler.map((s) => {
            const aktif = s.id === aktifId;
            return (
              <li key={s.id}>
                <Link
                  href={`/sohbet/${s.id}`}
                  aria-current={aktif ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors ${
                    aktif ? "bg-emerald-50" : "hover:bg-stone-100"
                  }`}
                >
                  <Avatar ad={kisiAdi(s.diger)} url={s.diger.avatar_url} boyut="lg" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate ${s.okunmamis ? "font-bold" : "font-semibold"} text-stone-900`}>
                        {kisiAdi(s.diger)}
                      </span>
                      {s.son_mesaj && (
                        <span className="text-xs text-stone-400 shrink-0">
                          {goreceli(s.son_mesaj.created_at)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          s.okunmamis ? "text-stone-900 font-medium" : "text-stone-500"
                        }`}
                      >
                        {s.son_mesaj
                          ? `${s.son_mesaj.benden ? "Sen: " : ""}${s.son_mesaj.icerik}`
                          : "Henüz mesaj yok. İlk sen yaz."}
                      </span>
                      {s.okunmamis > 0 && (
                        <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                          {s.okunmamis > 99 ? "99+" : s.okunmamis}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
