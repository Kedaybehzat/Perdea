type KarsilamaKartiProps = {
    baslik : string;
    aciklama : string;
};

export default function KarsilamaKarti({ baslik, aciklama }: KarsilamaKartiProps) {
  return (
    <div className="border border-zinc-700 rounded-xl p-6 max-w-md">
      <h2 className="text-2xl font-bold mb-3 text-white">{baslik}</h2>
      <p className="text-zinc-400 leading-relaxed">{aciklama}</p>
    </div>
  );
}