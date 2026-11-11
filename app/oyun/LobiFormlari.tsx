'use client'

import { useActionState } from "react";
import { DoorOpen, Plus } from "lucide-react";
import FormMesaji from "@/components/ui/FormMesaji";
import { kodlaKatilAction, odaKurAction, type FormDurumu } from "./actions";

const ilk: FormDurumu = {};

export function OdaKurFormu() {
  const [durum, formAction, bekliyor] = useActionState(odaKurAction, ilk);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Oda adı</span>
        <input name="ad" required minLength={2} maxLength={50} placeholder="Örn. Cuma gecesi ekibi" className="alan" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">
          Tema <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <input name="tema" maxLength={60} placeholder="Örn. Anime, Marvel, Yeşilçam, serbest" className="alan" />
      </label>
      <div className="flex items-end gap-4 flex-wrap">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-stone-800">Kaç kişilik?</span>
          <select name="kapasite" defaultValue="6" className="alan w-28!">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-3 text-sm text-stone-700 cursor-pointer">
          <input type="checkbox" name="gizli" className="w-4 h-4 accent-emerald-600" />
          Gizli oda (yalnızca kodla girilir)
        </label>
      </div>
      <FormMesaji hata={durum.hata} />
      <button type="submit" disabled={bekliyor} className="dugme">
        <Plus className="w-4 h-4" />
        {bekliyor ? "Kuruluyor…" : "Odayı kur"}
      </button>
    </form>
  );
}

export function KodlaKatilFormu() {
  const [durum, formAction, bekliyor] = useActionState(kodlaKatilAction, ilk);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Oda kodu</span>
        <input
          name="kod"
          required
          minLength={5}
          maxLength={5}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="• • • • •"
          className="alan font-mono text-2xl tracking-[0.4em] text-center uppercase"
        />
      </label>
      <FormMesaji hata={durum.hata} />
      <button type="submit" disabled={bekliyor} className="dugme-cizgi">
        <DoorOpen className="w-4 h-4" />
        {bekliyor ? "Giriliyor…" : "Odaya gir"}
      </button>
    </form>
  );
}
