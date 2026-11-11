'use client'

import { useActionState, useState, useTransition } from "react";
import FormMesaji from "@/components/ui/FormMesaji";
import { ayrilAction, iptalAction, katilAction, type FormDurumu } from "../actions";

const ilk: FormDurumu = {};

export default function KatilFormu({
  bulusmaId,
  katildi,
  karakterim,
  duzenleyen,
  dolu,
}: {
  bulusmaId: string;
  katildi: boolean;
  karakterim: string | null;
  duzenleyen: boolean;
  dolu: boolean;
}) {
  const [durum, formAction, bekliyor] = useActionState(katilAction, ilk);
  const [ekDurum, setEkDurum] = useState<FormDurumu>({});
  const [isliyor, startTransition] = useTransition();
  const [iptalOnay, setIptalOnay] = useState(false);

  const mesgul = bekliyor || isliyor;

  return (
    <div className="flex flex-col gap-4">
      {!katildi && dolu ? (
        <p className="text-stone-600 bg-stone-100 rounded-xl px-4 py-3 text-sm">
          Kontenjan dolmuş. Biri ayrılırsa yer açılır.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="bulusmaId" value={bulusmaId} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-stone-800">
              Kim olarak geliyorsun?{" "}
              <span className="font-normal text-stone-500">(isteğe bağlı)</span>
            </span>
            <input
              name="karakter"
              maxLength={60}
              defaultValue={karakterim ?? ""}
              placeholder="Örn. Howl, Örümcek Adam, Levi"
              className="alan"
            />
          </label>
          <button type="submit" disabled={mesgul} className={katildi ? "dugme-cizgi" : "dugme"}>
            {bekliyor ? "Kaydediliyor…" : katildi ? "Karakterimi güncelle" : "Katılıyorum"}
          </button>
        </form>
      )}

      <FormMesaji hata={durum.hata ?? ekDurum.hata} tamam={ekDurum.tamam ?? durum.tamam} />

      {katildi && !duzenleyen && (
        <button
          type="button"
          disabled={mesgul}
          onClick={() => startTransition(async () => setEkDurum(await ayrilAction(bulusmaId)))}
          className="text-sm text-stone-500 hover:text-rose-600 underline underline-offset-4 w-fit"
        >
          Katılmaktan vazgeç
        </button>
      )}

      {duzenleyen &&
        (iptalOnay ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm">
            <p className="text-rose-800 mb-3">
              Buluşma iptal edilecek ve katılımcılar iptal olarak görecek. Geri alınamaz.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={mesgul}
                onClick={() => startTransition(async () => setEkDurum(await iptalAction(bulusmaId)))}
                className="dugme bg-rose-600! hover:bg-rose-700! shadow-none!"
              >
                Buluşmayı iptal et
              </button>
              <button type="button" onClick={() => setIptalOnay(false)} className="dugme-cizgi">
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIptalOnay(true)}
            className="text-sm text-stone-500 hover:text-rose-600 underline underline-offset-4 w-fit"
          >
            Buluşmayı iptal et
          </button>
        ))}
    </div>
  );
}
