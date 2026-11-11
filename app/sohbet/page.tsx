import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { eslesmelerim, sohbetlerim } from "@/lib/sohbet";
import KurulumNotu from "@/components/ui/KurulumNotu";
import FormMesaji from "@/components/ui/FormMesaji";
import SohbetListesi from "./SohbetListesi";

export const metadata = {
  title: "Sohbetler — Perdea",
  description: "Eşleştiklerinle birebir yazış.",
};

export default async function SohbetSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { hata } = await searchParams;
  const [{ sohbetler, kurulumEksik }, yeniEslesmeler] = await Promise.all([
    sohbetlerim(),
    eslesmelerim(),
  ]);

  return (
    <main className="bg-stone-50">
      <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-6">
        {kurulumEksik && (
          <div className="px-4 pt-4 sm:px-0 sm:pt-0">
            <KurulumNotu dosya="docs/migrations/2026-11-11b_sohbet_baslik_akis.sql" />
          </div>
        )}
        {hata && (
          <div className="px-4 pt-4 sm:px-0 sm:pt-0 mb-4">
            <FormMesaji hata="Sohbet açılamadı. Yalnızca karşılıklı eşleştiğin kişilerle yazışabilirsin." />
          </div>
        )}
        <div className="bg-white sm:border border-stone-200 sm:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-[22rem_1fr] min-h-[calc(100dvh-8rem)] sm:shadow-kart">
          <div className="md:border-r border-stone-200 min-h-0">
            <SohbetListesi sohbetler={sohbetler} yeniEslesmeler={yeniEslesmeler} />
          </div>
          <div className="hidden md:flex perde-zemin text-white items-center justify-center p-10 text-center">
            <div className="max-w-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-altin" />
              <h2 className="text-3xl font-bold text-white mb-3">
                Bir sohbet seç ya da <em className="text-emerald-300">yenisini başlat</em>
              </h2>
              <p className="text-emerald-50/80 leading-relaxed">
                Yalnızca karşılıklı beğendiklerinle yazışabilirsin. İlk mesajı ortak bir favoriden aç.
              </p>
              <Link href="/eslesme" className="dugme mt-6 bg-altin! text-perde-950! shadow-none! hover:brightness-105">
                Eşleşmelere bak
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
