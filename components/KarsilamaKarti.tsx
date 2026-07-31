import type { LucideIcon } from "lucide-react";

type KarsilamaKartiProps = {
  baslik: string;
  aciklama: string;
  icon: LucideIcon;
};

export default function KarsilamaKarti({
  baslik,
  aciklama,
  icon: Icon,
}: KarsilamaKartiProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-semibold text-stone-900 mb-2">{baslik}</h3>
      <p className="text-stone-600 leading-relaxed">{aciklama}</p>
    </div>
  );
}