// Avatar: görsel varsa görsel, yoksa baş harf. Renk isme göre sabit seçilir.
const tonlar = [
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-lime-100 text-lime-800",
];

const boyutlar = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
} as const;

export default function Avatar({
  ad,
  url,
  boyut = "md",
  className = "",
}: {
  ad: string;
  url?: string | null;
  boyut?: keyof typeof boyutlar;
  className?: string;
}) {
  const harf = (ad.trim()[0] ?? "?").toLocaleUpperCase("tr-TR");
  let toplam = 0;
  for (const c of ad) toplam += c.codePointAt(0) ?? 0;
  const ton = tonlar[toplam % tonlar.length];

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`${boyutlar[boyut]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${boyutlar[boyut]} ${ton} rounded-full inline-flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      {harf}
    </span>
  );
}
