'use client'

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { sehirler } from "@/lib/sehirler";
import FormMesaji from "@/components/ui/FormMesaji";
import { salonEkleAction, type FormDurumu } from "./actions";

const ilk: FormDurumu = {};

export default function SalonEkleFormu({ varsayilanSehir }: { varsayilanSehir?: string }) {
  const [durum, formAction, bekliyor] = useActionState(salonEkleAction, ilk);

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Salonun adı</span>
        <input
          name="ad"
          required
          minLength={2}
          maxLength={80}
          placeholder="Örn. Kadıköy Rexx Sineması"
          className="alan"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Şehir</span>
        <select name="sehir" required defaultValue={varsayilanSehir ?? ""} className="alan">
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
        <span className="text-sm font-semibold text-stone-800">
          İlçe <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <input name="ilce" maxLength={40} placeholder="Örn. Kadıköy" className="alan" />
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">
          Zincir / işletme <span className="font-normal text-stone-500">(isteğe bağlı)</span>
        </span>
        <input name="zincir" maxLength={40} placeholder="Bağımsız salonsa boş bırak" className="alan" />
      </label>

      <div className="sm:col-span-2 flex items-center gap-3 flex-wrap">
        <button type="submit" disabled={bekliyor} className="dugme">
          <Plus className="w-4 h-4" />
          {bekliyor ? "Ekleniyor…" : "Salonu ekle"}
        </button>
        <div className="flex-1 min-w-48">
          <FormMesaji hata={durum.hata} />
        </div>
      </div>
    </form>
  );
}
