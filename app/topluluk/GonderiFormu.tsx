'use client'

import { useActionState, useState } from "react";
import FormMesaji from "@/components/ui/FormMesaji";
import { gonderiYazAction, type FormDurumu } from "./actions";

const ilk: FormDurumu = {};

export default function GonderiFormu() {
  const [metin, setMetin] = useState("");
  // Başarılıysa alanı boşalt; hata varsa yazılan kalsın.
  const [durum, action, bekliyor] = useActionState(async (onceki: FormDurumu, fd: FormData) => {
    const sonuc = await gonderiYazAction(onceki, fd);
    if (sonuc.tamam) setMetin("");
    return sonuc;
  }, ilk);
  const uzunluk = metin.length;

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="gonderi" className="sr-only">
        Gönderin
      </label>
      <textarea
        id="gonderi"
        name="icerik"
        required
        maxLength={500}
        rows={3}
        value={metin}
        onChange={(e) => setMetin(e.target.value)}
        placeholder="Ne izledin, ne düşünüyorsun?"
        className="alan resize-none"
      />
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs tabular-nums ${uzunluk > 450 ? "text-altin-koyu font-semibold" : "text-stone-400"}`}>
          {uzunluk}/500
        </p>
        <button type="submit" disabled={bekliyor || uzunluk === 0} className="dugme">
          {bekliyor ? "Paylaşılıyor…" : "Paylaş"}
        </button>
      </div>
      {durum.hata && <FormMesaji hata={durum.hata} />}
    </form>
  );
}
