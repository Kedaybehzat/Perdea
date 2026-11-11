'use client'

import { useActionState } from "react";
import FormMesaji from "@/components/ui/FormMesaji";
import { hesabiSil } from "../actions";

export default function HesapSil() {
  const [durum, action, bekliyor] = useActionState(hesabiSil, {});

  return (
    <section id="hesabi-sil" className="mt-10 border border-rose-200 bg-rose-50/50 rounded-3xl p-6 scroll-mt-24">
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Hesabı sil</h2>
      <p className="text-sm text-stone-700 leading-relaxed mb-4">
        Profilin, favorilerin, puanların, yazdıkların, eşleşmelerin ve mesajların kalıcı olarak
        silinir. Bu işlem geri alınamaz.
      </p>
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-rose-700 hover:text-rose-800 w-fit">
          Hesabımı silmek istiyorum
        </summary>
        <form action={action} className="mt-4 flex flex-col gap-3 max-w-sm">
          <label htmlFor="sil-onay" className="text-sm text-stone-800">
            Onaylamak için <strong>SİL</strong> yaz
          </label>
          <input id="sil-onay" name="onay" autoComplete="off" required className="alan" />
          <FormMesaji hata={durum.hata} />
          <button
            type="submit"
            disabled={bekliyor}
            className="dugme bg-rose-600! hover:bg-rose-700! shadow-none!"
          >
            {bekliyor ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}
          </button>
        </form>
      </details>
    </section>
  );
}
