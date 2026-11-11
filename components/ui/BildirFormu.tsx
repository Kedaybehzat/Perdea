'use client'

import { useActionState } from "react";
import FormMesaji from "./FormMesaji";

type FormDurumu = { hata?: string; tamam?: string };

const ilk: FormDurumu = {};

// Genel "bildir" formu: hedefId + sebep. Action dışarıdan verilir.
export default function BildirFormu({
  hedefId,
  action,
  ozet = "Bir sorun mu var? Bildir",
}: {
  hedefId: string;
  action: (onceki: FormDurumu, formData: FormData) => Promise<FormDurumu>;
  ozet?: string;
}) {
  const [durum, formAction, bekliyor] = useActionState(action, ilk);

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-stone-500 hover:text-stone-800 underline underline-offset-4 w-fit">
        {ozet}
      </summary>
      {durum.tamam ? (
        <div className="mt-3">
          <FormMesaji tamam={durum.tamam} />
        </div>
      ) : (
        <form action={formAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="hedefId" value={hedefId} />
          <textarea
            name="sebep"
            required
            minLength={5}
            maxLength={500}
            rows={3}
            placeholder="Ne yanlış ya da rahatsız edici?"
            aria-label="Bildirim sebebi"
            className="alan"
          />
          <FormMesaji hata={durum.hata} />
          <button type="submit" disabled={bekliyor} className="dugme-cizgi w-fit">
            {bekliyor ? "Gönderiliyor…" : "Gönder"}
          </button>
        </form>
      )}
    </details>
  );
}
