import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CalendarHeart, Heart, MessagesSquare, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { bildirimMetni, bildirimleriOkunduSay, bildirimlerim, type BildirimTuru } from "@/lib/bildirim";
import { goreceli } from "@/lib/zaman";
import SayfaBasligi from "@/components/ui/SayfaBasligi";
import BosDurum from "@/components/ui/BosDurum";
import KurulumNotu from "@/components/ui/KurulumNotu";
import Avatar from "@/components/ui/Avatar";
import IzinDugmesi from "./IzinDugmesi";

export const metadata = {
  title: "Bildirimler — Perdea",
};

const simgeler: Record<BildirimTuru, typeof Bell> = {
  eslesme: Sparkles,
  entry_begeni: Heart,
  gonderi_begeni: Heart,
  baslik_entry: MessagesSquare,
  bulusma_katilim: CalendarHeart,
};

export default async function BildirimlerSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { bildirimler, kurulumEksik } = await bildirimlerim();
  // Liste alındıktan sonra okundu say: bu ekranda yeni olanlar hâlâ vurgulu görünür.
  if (bildirimler.some((b) => !b.okundu)) await bildirimleriOkunduSay();

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <SayfaBasligi ustEtiket="Senin için" baslik="Bildirimler" />
        {kurulumEksik && <KurulumNotu dosya="docs/migrations/2026-11-11c_medya_bildirim_kvkk.sql" />}

        <div className="mb-6">
          <IzinDugmesi />
        </div>

        {bildirimler.length === 0 ? (
          <BosDurum
            icon={Bell}
            baslik="Şimdilik sessiz"
            aciklama="Eşleşince, yazdıkların beğenilince ya da buluşmana biri katılınca burada görürsün."
          >
            <Link href="/eslesme" className="dugme">Eşleşmelere bak</Link>
          </BosDurum>
        ) : (
          <ol className="sirali bg-white border border-stone-200 rounded-3xl divide-y divide-stone-100 overflow-hidden">
            {bildirimler.map((b) => {
              const Simge = simgeler[b.tur] ?? Bell;
              const ad = b.aktor?.display_name || b.aktor?.username || "Perdea";
              return (
                <li key={b.id}>
                  <Link
                    href={b.baglanti}
                    className={`flex items-start gap-3 px-5 py-4 hover:bg-stone-50 transition-colors ${
                      b.okundu ? "" : "bg-emerald-50/60"
                    }`}
                  >
                    <span className="relative shrink-0">
                      <Avatar ad={ad} url={b.aktor?.avatar_url} boyut="md" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-emerald-700">
                        <Simge className="w-3 h-3" />
                      </span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-stone-900 ${b.okundu ? "" : "font-semibold"}`}>
                        {bildirimMetni(b)}
                      </span>
                      {b.ozet && (
                        <span className="block text-sm text-stone-500 line-clamp-1 [overflow-wrap:anywhere]">
                          {b.ozet}
                        </span>
                      )}
                      <span className="block text-xs text-stone-400 mt-0.5">{goreceli(b.created_at)}</span>
                    </span>
                    {!b.okundu && (
                      <span className="mt-2 w-2 h-2 rounded-full bg-emerald-600 shrink-0" aria-label="Yeni" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
