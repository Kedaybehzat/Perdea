import Link from "next/link";
import { Heart, Users, Film, MessageCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: "Hakkımızda — Perdea",
  description:
    "Perdea, film/dizi/anime severler için Türkçe sosyal eşleşme ve topluluk platformu. Zevkini paylaş, ruh eşini bul.",
};

export default function HakkimizdaPage() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Perdea hakkında
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-5 leading-tight">
            Zevkini paylaş,{" "}
            <span className="text-emerald-700">ruh eşini bul.</span>
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            Perdea, Türkiye'deki sinefiller için tasarlanmış bir sosyal
            platform. Film, dizi ve anime zevkine göre insanlarla tanışman,
            birlikte keşfetmen ve konuşman için tek çatı.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Fikir</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Bir sinefil şu an 5 ayrı yerde vakit geçiriyor — Beyazperde haber
            için, Letterboxd puanlama için, Discord sohbet için, Reddit
            tartışma için, Ekşi Türk dizi için. Perdea hepsini tek yerde
            toplamayı hedefliyor: puanlama, keşif, topluluk ve en önemlisi —
            zevke dayalı eşleşme.
          </p>
          <h2 className="text-2xl font-bold text-stone-900 mb-3 mt-8">
            Ayırt edici özellik
          </h2>
          <p className="text-stone-700 leading-relaxed">
            Eşleşme algoritması. Letterboxd puanlıyor, Perdea bir adım daha
            atıyor — aynı zevkte kişileri buluşturuyor. "Film ikizini bul."
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          <Kart
            icon={<Users className="w-5 h-5" />}
            baslik="Eşleşme"
            metin="Favori ve puanlarına göre sana yakın insanları bulur."
          />
          <Kart
            icon={<Film className="w-5 h-5" />}
            baslik="Keşif"
            metin="TMDB'den 500.000+ yapım. Favoriye ekle, puan ver, listeleye başla."
          />
          <Kart
            icon={<MessageCircle className="w-5 h-5" />}
            baslik="Topluluk"
            metin="Başlık aç, entry yaz, tartış. Eşleştiklerinle birebir sohbet."
          />
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-emerald-700 text-white rounded-2xl p-8 md:p-10 text-center">
          <Heart className="w-8 h-8 mx-auto mb-4 fill-white" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Sinefil topluluğuna katıl
          </h2>
          <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
            Perdea erken aşamada. Katılan herkes topluluk kurulurken yanımızda
            olacak.
          </p>
          <Link
            href="/kayit"
            className="inline-block bg-white text-emerald-700 hover:bg-stone-100 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Hemen kayıt ol
          </Link>
        </div>
      </section>
    </main>
  );
}

function Kart({
  icon,
  baslik,
  metin,
}: {
  icon: React.ReactNode;
  baslik: string;
  metin: string;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-stone-900 mb-1">{baslik}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{metin}</p>
    </div>
  );
}
