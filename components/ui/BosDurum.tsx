import type { LucideIcon } from "lucide-react";

// Boş ekran: ne olduğunu söyler ve bir sonraki adımı gösterir.
export default function BosDurum({
  icon: Icon,
  baslik,
  aciklama,
  children,
}: {
  icon: LucideIcon;
  baslik: string;
  aciklama?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center bg-white border border-dashed border-stone-300 rounded-3xl px-6 py-14">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold text-stone-900 mb-2">{baslik}</h2>
      {aciklama && <p className="text-stone-600 max-w-md mx-auto mb-6">{aciklama}</p>}
      {children && <div className="flex items-center justify-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
