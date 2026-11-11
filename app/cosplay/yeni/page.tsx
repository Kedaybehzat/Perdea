import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { yerelGirdiEnErken } from "@/lib/zaman";
import BulusmaFormu from "./BulusmaFormu";
import GuvenlikKarti from "../GuvenlikKarti";

export const metadata = { title: "Buluşma Aç — Perdea" };

export default async function YeniBulusmaSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const enErken = yerelGirdiEnErken(1);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/cosplay"
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Buluşmalar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-kart">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">Buluşma aç</h1>
            <p className="text-stone-600 mb-8">
              Bir tarih, halka açık bir yer ve bir tema yeter. Sen otomatik olarak ilk katılımcısın.
            </p>
            <BulusmaFormu enErken={enErken} />
          </div>
          <GuvenlikKarti />
        </div>
      </div>
    </main>
  );
}
