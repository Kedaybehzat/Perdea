import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { odaDurumu } from "@/lib/oyun";
import KurulumNotu from "@/components/ui/KurulumNotu";
import { odayaKatilAction } from "../actions";
import OdaCanli from "./OdaCanli";

type Props = { params: Promise<{ kod: string }> };

export async function generateMetadata({ params }: Props) {
  const { kod } = await params;
  return { title: `Oda ${kod.toUpperCase()} — Ben Kimim? — Perdea` };
}

export default async function OdaSayfasi({ params }: Props) {
  const { kod: hamKod } = await params;
  const kod = hamKod.toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(kod)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { durum, kurulumEksik } = await odaDurumu(kod);

  if (kurulumEksik) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <KurulumNotu />
      </main>
    );
  }
  if (!durum) notFound();

  // Üye değilse: davet ekranı.
  if (!durum.uye) {
    const o = durum.oda;
    const dolu = o.oyuncu_sayisi >= o.kapasite;
    const girilebilir = o.durum === "lobi" && !dolu;
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-kart text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-2">
            Ben Kimim? · davet
          </p>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">{o.ad}</h1>
          {o.tema && <p className="text-stone-600">Tema: {o.tema}</p>}
          <p className="mt-3 text-sm text-stone-500 flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4" />
            {o.oyuncu_sayisi} / {o.kapasite} kişi
            {o.kurucu ? ` · @${o.kurucu} kurdu` : ""}
          </p>
          <p className="my-6 font-mono text-3xl font-bold tracking-[0.35em] text-stone-900">{o.kod}</p>

          {girilebilir ? (
            <form action={odayaKatilAction.bind(null, o.kod)}>
              <button type="submit" className="dugme w-full">
                Odaya katıl
              </button>
            </form>
          ) : (
            <p className="text-stone-600 bg-stone-100 rounded-xl px-4 py-3 text-sm">
              {dolu ? "Oda dolu." : "Oyun başlamış; tur bitince lobiye dönülürse katılabilirsin."}
            </p>
          )}
          <Link href="/oyun" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-emerald-700 mt-5">
            <ArrowLeft className="w-4 h-4" />
            Tüm odalar
          </Link>
        </div>
      </main>
    );
  }

  return <OdaCanli durum={durum} />;
}
