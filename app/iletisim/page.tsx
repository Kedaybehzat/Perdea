import { Mail, Code2, AtSign, MessageSquare } from "lucide-react";

export const metadata = {
  title: "İletişim — Perdea",
  description: "Perdea ekibiyle iletişime geç — öneri, hata bildirimi veya iş birliği için.",
};

export default function IletisimPage() {
  return (
    <main className="bg-stone-50 min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          İletişim
        </h1>
        <p className="text-stone-600 mb-10 leading-relaxed">
          Perdea erken aşamada. Öneriler, hata bildirimleri ya da iş birliği
          konuları için aşağıdan bize ulaşabilirsin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KanalKart
            href="mailto:merhaba@perdea.app"
            icon={<Mail className="w-5 h-5" />}
            baslik="E-posta"
            aciklama="merhaba@perdea.app"
          />
          <KanalKart
            href="https://github.com/Kedaybehzat/Perdea"
            icon={<Code2 className="w-5 h-5" />}
            baslik="GitHub"
            aciklama="Issue aç ya da katkıda bulun"
          />
          <KanalKart
            href="https://www.instagram.com/perdea.app"
            icon={<AtSign className="w-5 h-5" />}
            baslik="Instagram"
            aciklama="@perdea.app"
          />
          <KanalKart
            href="/topluluk"
            icon={<MessageSquare className="w-5 h-5" />}
            baslik="Topluluk"
            aciklama="Diğer kullanıcılara sor"
          />
        </div>

        <p className="text-sm text-stone-400 mt-10 text-center">
          Linklerin bir kısmı placeholder — canlıya çıkınca güncellenecek.
        </p>
      </div>
    </main>
  );
}

function KanalKart({
  href,
  icon,
  baslik,
  aciklama,
}: {
  href: string;
  icon: React.ReactNode;
  baslik: string;
  aciklama: string;
}) {
  const disBagli = href.startsWith("http") || href.startsWith("mailto:");
  const linkProps = disBagli ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <a
      href={href}
      {...linkProps}
      className="group bg-white border border-stone-200 hover:border-emerald-300 rounded-2xl p-5 flex items-start gap-3 transition-colors"
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-stone-900">{baslik}</p>
        <p className="text-sm text-stone-500 truncate">{aciklama}</p>
      </div>
    </a>
  );
}
