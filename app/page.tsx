import Link from "next/link";
import { Users, MessageCircle, Film, UserPlus, ListChecks, Heart } from "lucide-react";
import KarsilamaKarti from "@/components/KarsilamaKarti";

export default function Home() {
  return (
    <main>
      {/* Hero Section — iki sütunlu: solda metin+butonlar, sağda görsel */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* SOL: başlık, açıklama, butonlar */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-stone-900 mb-6 leading-tight">
              Zevkini paylaş,<br />
              <span className="text-emerald-700">ruh eşini bul.</span>
            </h1>

            <p className="text-lg text-stone-600 mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Film, dizi ve anime zevkine göre insanlarla eşleş; birlikte keşfet,
              konuş, paylaş.
            </p>

            <div className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4">
              <Link
                href="/kayit"
                className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
              >
                Hemen Başla
              </Link>
              <Link
                href="/kesfet"
                className="px-8 py-4 border border-stone-300 text-stone-700 rounded-lg font-semibold text-lg hover:border-emerald-600 hover:text-emerald-700 transition-colors w-full sm:w-auto"
              >
                Nasıl Çalışır
              </Link>
            </div>
          </div>

          {/* SAĞ: görsel alanı — Rana'nın PNG'si gelince buraya <img> girecek.
              Mobilde gizli (dekoratif), md üstünde görünür. */}
          <div className="flex-1 hidden md:block">
            <div className="w-full aspect-square bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center text-stone-400 text-center px-6">
              Görsel buraya gelecek
              <br />
              (poster + eşleşme kartı — Rana'nın PNG'si)
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Section */}
      <section className="px-6 py-16 bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Perdea'da neler var?
            </h2>
            <p className="text-lg text-stone-600">
              Sinefil bir Türk kullanıcının ihtiyacı olan her şey, tek çatı altında.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KarsilamaKarti
              icon={Users}
              baslik="Eşleşme"
              aciklama="Zevkine göre seni anlayan insanlarla eşleş. Doğru kişi, doğru filmde buluşur."
            />
            <KarsilamaKarti
              icon={MessageCircle}
              baslik="Topluluk"
              aciklama="İzlediklerin üzerine konuş, tartış, öner. Seni anlayan bir toplulukla bağ kur."
            />
            <KarsilamaKarti
              icon={Film}
              baslik="Keşif"
              aciklama="Yeni filmler, diziler ve anime'ler keşfet. Zevkini genişlet, ufkunu aç."
            />
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nasıl çalışır?
            </h2>
            <p className="text-lg text-stone-600">
              Üç basit adım, sonrası zevk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Kaydol
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Hemen ücretsiz kayıt ol ve kendi profilini oluştur.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                <ListChecks className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Zevkini göster
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sevdiğin yapımları seç, beğenilerini paylaş.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Eşleş
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sana uygun insanlarla eşleş, tanış ve birlikte keşfet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — Alta çekici bir davet */}
      <section className="px-6 py-20 bg-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sinefil topluluğuna katıl
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            İyi filmler, doğru insanlar ve sonsuz sohbet seni bekliyor.
          </p>
          <Link
            href="/kayit"
            className="inline-block px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold text-lg hover:bg-stone-100 transition-colors"
          >
            Hemen Başla
          </Link>
        </div>
      </section>
    </main>
  );
}