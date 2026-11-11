// Koyu perde bandı: sayfanın tepesindeki afiş başlığı.
// vurgu: başlığın italik, açık yeşil yazılan kısmı.
export default function PerdeBandi({
  ustEtiket,
  baslik,
  vurgu,
  aciklama,
  ampul = false,
  children,
}: {
  ustEtiket?: string;
  baslik: string;
  vurgu?: string;
  aciklama?: React.ReactNode;
  ampul?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="perde-zemin relative text-white">
      {ampul && <div className="ampuller absolute inset-x-0 top-0 h-4 opacity-80" aria-hidden />}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10 md:pt-14 md:pb-12 flex items-end justify-between gap-x-8 gap-y-6 flex-wrap">
        <div className="max-w-2xl animate-belir">
          {ustEtiket && (
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-altin mb-3">
              {ustEtiket}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.02] text-white">
            {baslik}
            {vurgu && (
              <>
                {" "}
                <em className="text-emerald-300">{vurgu}</em>
              </>
            )}
          </h1>
          {aciklama && (
            <p className="mt-4 text-lg text-emerald-50/85 leading-relaxed">{aciklama}</p>
          )}
        </div>
        {children && <div className="w-full md:w-auto animate-belir [animation-delay:0.12s]">{children}</div>}
      </div>
      <div className="film-seridi text-white absolute inset-x-0 bottom-0" aria-hidden />
    </section>
  );
}
