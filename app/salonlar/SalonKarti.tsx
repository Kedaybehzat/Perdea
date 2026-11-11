import Link from "next/link";
import { MapPin } from "lucide-react";
import Bilet from "@/components/ui/Bilet";
import Yildizlar from "@/components/ui/Yildizlar";
import type { SalonOzet } from "@/lib/sinema";

// Salon kartı: bilet gövdesinde salon, koçanında puan.
export default function SalonKarti({ salon }: { salon: SalonOzet }) {
  return (
    <Link
      href={`/salonlar/${salon.id}`}
      className="group block kalkar hover:shadow-none! focus-visible:-translate-y-1"
    >
      <Bilet
        ton="beyaz"
        centik="62%"
        kocan={
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <Yildizlar puan={salon.genel} boyut="sm" />
              <p className="text-xs text-stone-500 mt-1">
                {salon.puan_sayisi > 0 ? `${salon.puan_sayisi} puan` : "İlk puanı sen ver"}
              </p>
            </div>
            <p
              className="font-display font-bold text-4xl leading-none text-stone-900 tabular-nums"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {salon.genel !== null ? salon.genel.toFixed(1) : "—"}
            </p>
          </div>
        }
      >
        <div className="px-5 pt-5 pb-6 min-h-32">
          {salon.zincir && (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-1.5">
              {salon.zincir}
            </p>
          )}
          <h3 className="font-display text-xl font-bold text-stone-900 leading-snug group-hover:text-emerald-700 transition-colors">
            {salon.ad}
          </h3>
          <p className="mt-2 text-sm text-stone-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {salon.ilce ? `${salon.ilce}, ${salon.sehir}` : salon.sehir}
          </p>
        </div>
      </Bilet>
    </Link>
  );
}
