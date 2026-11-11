import { Star } from "lucide-react";

// 5 üzerinden puanı yıldızla gösterir (yarım yıldız destekli, salt görsel).
export default function Yildizlar({
  puan,
  boyut = "md",
  className = "",
}: {
  puan: number | null;
  boyut?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = boyut === "lg" ? "w-6 h-6" : boyut === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";
  const deger = puan ?? 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={puan === null ? "Henüz puan yok" : `5 üzerinden ${deger.toFixed(1)}`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const doluluk = Math.max(0, Math.min(1, deger - (i - 1)));
        return (
          <span key={i} className={`relative inline-block ${px}`}>
            <Star className={`absolute inset-0 ${px} text-stone-300`} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${doluluk * 100}%` }}
            >
              <Star className={`${px} text-altin fill-altin`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
