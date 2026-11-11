import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  benEngelledimMi,
  eslesmelerim,
  mesajlariGetir,
  sohbetOkundu,
  sohbetlerim,
} from "@/lib/sohbet";
import { kisiAdi } from "@/lib/sohbet-tipleri";
import SohbetListesi from "../SohbetListesi";
import MesajAlani from "./MesajAlani";

export async function generateMetadata() {
  return { title: "Sohbet — Perdea" };
}

export default async function SohbetDetay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  // Önce okundu say ki listede ve üst menüde sayı doğru çıksın.
  await sohbetOkundu(id);

  const [{ sohbetler }, yeniEslesmeler, mesajlar] = await Promise.all([
    sohbetlerim(),
    eslesmelerim(),
    mesajlariGetir(id),
  ]);
  const sohbet = sohbetler.find((s) => s.id === id);
  if (!sohbet) notFound();

  const benEngelledim = sohbet.engelli ? await benEngelledimMi(sohbet.diger.id) : false;

  return (
    <main className="bg-stone-50">
      <div className="max-w-6xl mx-auto px-0 sm:px-6 py-0 sm:py-6">
        <div className="bg-white sm:border border-stone-200 sm:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-[22rem_1fr] h-[calc(100dvh-4.1rem)] sm:h-[calc(100dvh-8rem)] min-h-[28rem] sm:shadow-kart">
          <div className="hidden md:block border-r border-stone-200 min-h-0">
            <SohbetListesi sohbetler={sohbetler} yeniEslesmeler={yeniEslesmeler} aktifId={id} />
          </div>
          <MesajAlani
            key={id}
            sohbetId={id}
            benId={user.id}
            diger={sohbet.diger}
            digerAd={kisiAdi(sohbet.diger)}
            mesajlar={mesajlar}
            engelli={sohbet.engelli}
            benEngelledim={benEngelledim}
          />
        </div>
      </div>
    </main>
  );
}
