import Link from "next/link";
import Logo from "./Logo";

const sutunlar = [
  {
    baslik: "Keşfet",
    linkler: [
      { href: "/kesfet", etiket: "Film, dizi, anime" },
      { href: "/vizyon", etiket: "Vizyondakiler" },
      { href: "/salonlar", etiket: "Salon puanları" },
    ],
  },
  {
    baslik: "Tanış",
    linkler: [
      { href: "/eslesme", etiket: "Eşleşmeler" },
      { href: "/oyun", etiket: "Ben Kimim? odaları" },
      { href: "/cosplay", etiket: "Cosplay buluşmaları" },
    ],
  },
  {
    baslik: "Topluluk",
    linkler: [
      { href: "/topluluk", etiket: "Akış" },
      { href: "/baslik", etiket: "Başlıklar" },
      { href: "/sohbet", etiket: "Sohbetler" },
    ],
  },
  {
    baslik: "Perdea",
    linkler: [
      { href: "/hakkimizda", etiket: "Hakkımızda" },
      { href: "/iletisim", etiket: "İletişim" },
      { href: "/kvkk", etiket: "KVKK" },
      { href: "/kosullar", etiket: "Kullanım koşulları" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="perde-zemin text-emerald-100/80 mt-auto">
      <div className="film-seridi text-stone-50" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
          <div className="col-span-2">
            <Logo koyuZemin />
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Film, dizi ve anime tutkunlarını zevklerine göre bir araya getiren
              Türkçe sosyal platform.
            </p>
          </div>

          {sutunlar.map((s) => (
            <div key={s.baslik}>
              <h3 className="font-semibold text-stone-50 mb-3">{s.baslik}</h3>
              <ul className="space-y-2 text-sm">
                {s.linkler.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white transition-colors">
                      {l.etiket}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-emerald-100/60">
          <p>© 2026 Perdea. Tüm hakları saklıdır.</p>
          <p>Bu ürün TMDB API kullanmaktadır ancak TMDB tarafından onaylanmamıştır.</p>
        </div>
      </div>
    </footer>
  );
}
