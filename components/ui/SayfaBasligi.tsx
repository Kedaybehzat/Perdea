// Sayfa başlığı: küçük üst etiket + afiş serifli başlık + açıklama (+ sağda aksiyon).
export default function SayfaBasligi({
  ustEtiket,
  baslik,
  aciklama,
  children,
}: {
  ustEtiket?: string;
  baslik: React.ReactNode;
  aciklama?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-x-6 gap-y-4 flex-wrap">
      <div className="max-w-2xl">
        {ustEtiket && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
            {ustEtiket}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-[1.05]">
          {baslik}
        </h1>
        {aciklama && (
          <p className="mt-3 text-lg text-stone-600 leading-relaxed">{aciklama}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}
