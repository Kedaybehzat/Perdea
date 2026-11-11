// Uyum yüzdesi: dolan halka + ortada sayı.
export default function UyumHalkasi({
  yuzde,
  boyut = 132,
  koyu = false,
}: {
  yuzde: number;
  boyut?: number;
  koyu?: boolean;
}) {
  const y = Math.max(0, Math.min(100, Math.round(yuzde)));
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: boyut, height: boyut }}
      role="img"
      aria-label={`Yüzde ${y} uyum`}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="17"
          fill="none"
          strokeWidth="3"
          className={koyu ? "stroke-white/15" : "stroke-stone-200"}
        />
        <circle
          cx="20"
          cy="20"
          r="17"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          className={`halka-dol ${koyu ? "stroke-altin" : "stroke-emerald-600"}`}
          style={{ "--hedef": 100 - y } as React.CSSProperties}
        />
      </svg>
      <div className="text-center leading-none">
        <span
          className={`font-display font-bold ${koyu ? "text-white" : "text-stone-900"}`}
          style={{ fontSize: boyut * 0.3 }}
        >
          <span className="text-[0.55em] align-top">%</span>
          {y}
        </span>
        <span
          className={`block mt-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
            koyu ? "text-emerald-200/80" : "text-stone-500"
          }`}
        >
          uyum
        </span>
      </div>
    </div>
  );
}
