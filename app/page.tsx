import Link from "next/link";
import KarsilamaKarti from "@/components/KarsilamaKarti";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full mb-6">
            🎬 Türkiye'nin sinefil platformu
          </span>

          <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-6 leading-tight">
            Zevkini paylaş,<br />
            <span className="text-emerald-700">ruh eşini bul</span>
          </h1>

          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Film, dizi ve anime tutkunları için sosyal eşleşme ve topluluk platformu.
            Beyazperde, Letterboxd ve Discord'un en iyi yanları tek bir yerde.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/kayit"
              className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
            >
              Ücretsiz kayıt ol
            </Link>
            <Link
              href="/kesfet"
              className="px-8 py-4 border border-stone-300 text-stone-700 rounded-lg font-semibold text-lg hover:border-emerald-600 hover:text-emerald-700 transition-colors w-full sm:w-auto"
            >
              Keşfetmeye başla
            </Link>
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
              baslik="Eşleşme"
              aciklama="Beğenilerine göre seninle uyumlu film severlerle tanış. Film ikizini veya keşif partnerini bul."
            />
            <KarsilamaKarti
              baslik="Topluluk"
              aciklama="Sevdiğin yapımları tartış, listeler oluştur, fandom gruplarının bir parçası ol."
            />
            <KarsilamaKarti
              baslik="Keşif"
              aciklama="Algoritmanın seçtiği değil, gerçek insanların önerdiği yapımları keşfet."
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
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full font-bold text-2xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Zevk profili oluştur
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sevdiğin filmleri, dizileri ve animeleri puanla. Favori 4'ünü seç.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full font-bold text-2xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Eşleş
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Algoritma senin gibi düşünen kullanıcıları bulup önerir. Uyumluluk yüzdesi gör.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full font-bold text-2xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Tanış ve tartış
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sohbet et, ortak listeler yap, gruplara katıl. Yeni sinefil arkadaşlar bul.
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
            Ücretsiz kayıt ol, hemen zevk profilini oluşturmaya başla.
          </p>
          <Link
            href="/kayit"
            className="inline-block px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold text-lg hover:bg-stone-100 transition-colors"
          >
            Perdea'ya kayıt ol
          </Link>
        </div>
      </section>
    </main>
  );
}