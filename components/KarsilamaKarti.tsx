type KarsilamaKartiProps = {
  baslik: string;
  aciklama: string;
};

export default function KarsilamaKarti({ baslik, aciklama }: KarsilamaKartiProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 max-w-md shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-2xl font-bold mb-3 text-emerald-700">{baslik}</h2>
      <p className="text-stone-600 leading-relaxed">{aciklama}</p>
    </div>
  );
}