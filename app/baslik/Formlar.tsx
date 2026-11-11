'use client'

import { useActionState, useState } from "react";
import FormMesaji from "@/components/ui/FormMesaji";
import { baslikAcAction, entryYazAction, type FormDurumu } from "./actions";

const ilk: FormDurumu = {};

export function BaslikAcFormu({ onBaslik = "" }: { onBaslik?: string }) {
  const [durum, action, bekliyor] = useActionState(baslikAcAction, ilk);
  const [baslik, setBaslik] = useState(onBaslik);
  const [entry, setEntry] = useState("");
  const uzunluk = entry.length;

  return (
    <form action={action} className="flex flex-col gap-3">
      <div>
        <label htmlFor="baslik" className="block text-sm font-medium text-stone-800 mb-1.5">
          Başlık
        </label>
        <input
          id="baslik"
          name="baslik"
          required
          minLength={3}
          maxLength={80}
          value={baslik}
          onChange={(e) => setBaslik(e.target.value)}
          placeholder="örn. dune 2'nin son sahnesi"
          className="alan"
        />
      </div>
      <div>
        <label htmlFor="entry" className="block text-sm font-medium text-stone-800 mb-1.5">
          İlk entry
        </label>
        <textarea
          id="entry"
          name="entry"
          required
          minLength={2}
          maxLength={2000}
          rows={4}
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Ne düşünüyorsun? İki satır yeter."
          className="alan resize-y"
        />
        <p className="mt-1 text-xs text-stone-400 text-right tabular-nums">{uzunluk}/2000</p>
      </div>
      <FormMesaji hata={durum.hata} />
      <button type="submit" disabled={bekliyor} className="dugme">
        {bekliyor ? "Açılıyor…" : "Başlığı aç"}
      </button>
    </form>
  );
}

export function EntryFormu({ baslikId, slug }: { baslikId: string; slug: string }) {
  const [metin, setMetin] = useState("");
  // Başarılıysa alanı boşalt; hata varsa yazılan kalsın.
  const [durum, action, bekliyor] = useActionState(async (onceki: FormDurumu, fd: FormData) => {
    const sonuc = await entryYazAction(onceki, fd);
    if (sonuc.tamam) setMetin("");
    return sonuc;
  }, ilk);
  const uzunluk = metin.length;

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="baslikId" value={baslikId} />
      <input type="hidden" name="slug" value={slug} />
      <label htmlFor="icerik" className="sr-only">
        Entry
      </label>
      <textarea
        id="icerik"
        name="icerik"
        required
        minLength={2}
        maxLength={2000}
        rows={4}
        value={metin}
        onChange={(e) => setMetin(e.target.value)}
        placeholder="Bu başlığa sen ne dersin?"
        className="alan resize-y"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-400 tabular-nums">{uzunluk}/2000</p>
        <button type="submit" disabled={bekliyor} className="dugme">
          {bekliyor ? "Gönderiliyor…" : "Entry ekle"}
        </button>
      </div>
      <FormMesaji hata={durum.hata} tamam={durum.tamam} />
    </form>
  );
}
