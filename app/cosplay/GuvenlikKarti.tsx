import { ShieldCheck } from "lucide-react";

// Gerçek hayatta buluşma içerdiği için her cosplay sayfasında görünür.
export default function GuvenlikKarti() {
  return (
    <aside className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
      <h3 className="font-semibold text-emerald-900 flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5" />
        Güvenli buluşma
      </h3>
      <ul className="text-sm text-emerald-900/85 space-y-1.5 list-disc list-inside marker:text-emerald-500">
        <li>Kalabalık, halka açık yerlerde buluşun.</li>
        <li>İlk buluşmaya bir arkadaşınla git, nereye gittiğini birine söyle.</li>
        <li>Adres, telefon gibi özel bilgilerini ilan altında paylaşma.</li>
        <li>Seni rahatsız eden bir ilanı ya da kişiyi bize bildir.</li>
      </ul>
    </aside>
  );
}
