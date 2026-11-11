'use client'

import { useActionState } from "react";
import { sehirler } from "@/lib/sehirler";
import FormMesaji from "@/components/ui/FormMesaji";
import { bulusmaOlusturAction, type FormDurumu } from "../actions";

const ilk: FormDurumu = {};

export default function BulusmaFormu({ enErken }: { enErken: string }) {
  const [durum, formAction, bekliyor] = useActionState(bulusmaOlusturAction, ilk);

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Buluşmanın adı</span>
        <input
          name="baslik"
          required
          minLength={4}
          maxLength={90}
          placeholder="Örn. Ghibli pikniği — Moda Sahili"
          className="alan"
        />
      </label>

      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">
          Tema / evren <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <input name="tema" maxLength={80} placeholder="Örn. Studio Ghibli, Marvel, serbest" className="alan" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Şehir</span>
        <select name="sehir" required defaultValue="" className="alan">
          <option value="" disabled>
            Şehir seç
          </option>
          {sehirler.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Tarih ve saat</span>
        <input type="datetime-local" name="zaman" required min={enErken} className="alan" />
        <span className="text-xs text-stone-500">Türkiye saatiyle.</span>
      </label>

      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Buluşma yeri</span>
        <input
          name="mekan"
          required
          minLength={3}
          maxLength={120}
          placeholder="Halka açık bir yer: park, meydan, AVM girişi…"
          className="alan"
        />
        <span className="text-xs text-stone-500">Ev adresi yazma; kalabalık, herkesin bulabileceği bir nokta seç.</span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">
          Kontenjan <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <input type="number" name="kontenjan" min={2} max={500} placeholder="Sınırsız" className="alan" />
      </label>

      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">
          Açıklama <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <textarea
          name="aciklama"
          rows={4}
          maxLength={1500}
          placeholder="Program, ne getirmeli, fotoğraf çekimi olacak mı…"
          className="alan resize-y"
        />
      </label>

      <div className="sm:col-span-2 space-y-3">
        <FormMesaji hata={durum.hata} />
        <button type="submit" disabled={bekliyor} className="dugme w-full sm:w-auto">
          {bekliyor ? "Oluşturuluyor…" : "Buluşmayı yayınla"}
        </button>
      </div>
    </form>
  );
}
