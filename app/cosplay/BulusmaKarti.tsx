import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import Bilet from "@/components/ui/Bilet";
import { saat, tarihParcalari } from "@/lib/zaman";
import type { Bulusma } from "@/lib/bulusma";

// Buluşma kartı: gövdede ne/nerede, koçanda ne zaman + kaç kişi.
export default function BulusmaKarti({ bulusma: b }: { bulusma: Bulusma }) {
  const t = tarihParcalari(b.zaman);
  const dolu = b.kontenjan !== null && b.katilimci_sayisi >= b.kontenjan;
  const iptal = b.durum === "iptal";

  return (
    <Link
      href={`/cosplay/${b.id}`}
      className={`group block transition-transform hover:-translate-y-1 ${iptal ? "opacity-60" : ""}`}
    >
      <Bilet
        ton="beyaz"
        centik="60%"
        kocan={
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="text-center leading-none shrink-0">
              <p
                className="font-display font-bold text-4xl text-emerald-700 tabular-nums"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                {t.gun}
              </p>
              <p className="text-[11px] font-bold tracking-[0.2em] text-stone-500 mt-1">{t.ay}</p>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-stone-900">
                {t.haftaGunu} · {saat(b.zaman)}
              </p>
              <p className="text-stone-500 flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5" />
                {b.katilimci_sayisi}
                {b.kontenjan !== null ? ` / ${b.kontenjan}` : ""} kişi
                {iptal ? " · iptal" : dolu ? " · dolu" : ""}
              </p>
            </div>
          </div>
        }
      >
        <div className="px-5 pt-5 pb-6 min-h-36">
          {b.tema && (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-1.5 truncate">
              {b.tema}
            </p>
          )}
          <h3 className="font-display text-xl font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {b.baslik}
          </h3>
          <p className="mt-2 text-sm text-stone-600 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {b.mekan}, {b.sehir}
            </span>
          </p>
        </div>
      </Bilet>
    </Link>
  );
}
