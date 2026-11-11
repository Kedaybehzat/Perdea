// Posteri olmayan yapım için: düz gri kutu yerine başlığı taşıyan sade bir afiş.
const TONLAR = [
  "from-perde-700 to-perde-950",
  "from-stone-700 to-stone-900",
  "from-amber-800 to-stone-900",
  "from-teal-800 to-perde-950",
  "from-rose-900 to-stone-900",
];

export default function AfisYok({ baslik }: { baslik: string }) {
  let h = 0;
  for (const c of baslik) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (
    <div
      className={`w-full h-full bg-gradient-to-b ${TONLAR[h % TONLAR.length]} flex flex-col justify-center px-3 pb-6`}
    >
      <span className="block w-8 h-0.5 bg-altin mb-2" aria-hidden />
      <span className="font-display font-bold text-white leading-tight line-clamp-4 [overflow-wrap:anywhere]">
        {baslik}
      </span>
    </div>
  );
}
