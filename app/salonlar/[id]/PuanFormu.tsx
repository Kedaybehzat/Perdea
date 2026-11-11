'use client'

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { OLCUTLER, type SalonPuani } from "@/lib/sinema-tipleri";
import YildizSecici from "@/components/ui/YildizSecici";
import FormMesaji from "@/components/ui/FormMesaji";
import { salonPuanlaAction, salonPuaniSilAction, type FormDurumu } from "../actions";

const ilk: FormDurumu = {};

export default function PuanFormu({
  sinemaId,
  mevcut,
}: {
  sinemaId: string;
  mevcut: SalonPuani | null;
}) {
  const [durum, formAction, bekliyor] = useActionState(salonPuanlaAction, ilk);
  const [silDurumu, setSilDurumu] = useState<FormDurumu>({});
  const [siliniyor, startTransition] = useTransition();

  function sil() {
    startTransition(async () => {
      setSilDurumu(await salonPuaniSilAction(sinemaId));
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="sinemaId" value={sinemaId} />

      <div className="divide-y divide-stone-200">
        {OLCUTLER.map((o) => (
          <YildizSecici
            key={`${o.anahtar}-${mevcut?.updated_at ?? "yeni"}`}
            name={o.anahtar}
            etiket={o.etiket}
            baslangic={mevcut?.[o.anahtar] ?? 0}
          />
        ))}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">
          Yorumun <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <textarea
          name="yorum"
          rows={3}
          maxLength={600}
          defaultValue={mevcut?.yorum ?? ""}
          placeholder="Hangi salon, hangi sıra iyi? Ses nasıldı?"
          className="alan resize-y"
        />
      </label>

      <FormMesaji hata={durum.hata ?? silDurumu.hata} tamam={durum.tamam ?? silDurumu.tamam} />

      <div className="flex items-center gap-3 flex-wrap">
        <button type="submit" disabled={bekliyor || siliniyor} className="dugme flex-1">
          {bekliyor ? "Kaydediliyor…" : mevcut ? "Puanımı güncelle" : "Puanımı kaydet"}
        </button>
        {mevcut && (
          <button
            type="button"
            onClick={sil}
            disabled={bekliyor || siliniyor}
            className="dugme-cizgi text-rose-600! hover:border-rose-400!"
          >
            <Trash2 className="w-4 h-4" />
            Kaldır
          </button>
        )}
      </div>
    </form>
  );
}
