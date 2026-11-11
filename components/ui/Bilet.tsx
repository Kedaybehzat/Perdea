// Bilet: Perdea'nın imza kartı. Üst gövde + perforasyon + alt koçan.
// Davet niteliğindeki her şey bilettir: salon puanı, oda kodu, buluşma.
export default function Bilet({
  children,
  kocan,
  ton = "krem",
  centik = "68%",
  className = "",
}: {
  children: React.ReactNode;
  kocan?: React.ReactNode;
  ton?: "krem" | "beyaz" | "zumrut" | "koyu";
  centik?: string;
  className?: string;
}) {
  const tonlar = {
    krem: "bg-kum text-stone-900",
    beyaz: "bg-white text-stone-900",
    zumrut: "bg-emerald-600 text-white",
    koyu: "bg-perde-900 text-stone-50",
  } as const;
  return (
    <div className={`drop-shadow-[0_10px_18px_rgba(28,25,23,0.13)] ${className}`}>
      <div
        className={`bilet rounded-2xl ${tonlar[ton]} h-full flex flex-col`}
        style={{ "--centik": centik } as React.CSSProperties}
      >
        <div className="flex-1 min-h-0">{children}</div>
        {kocan && (
          <>
            <div className="bilet-cizgi" />
            <div>{kocan}</div>
          </>
        )}
      </div>
    </div>
  );
}
