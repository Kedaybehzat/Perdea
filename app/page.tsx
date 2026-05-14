import KarsilamaKarti from "@/components/KarsilamaKarti";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-black">
      <h1 className="text-5xl font-bold text-white mb-8">Perdea</h1>

      <KarsilamaKarti
        baslik="Eşleşme"
        aciklama="Beğenilerine göre seninle uyumlu film severlerle tanış."
      />

      <KarsilamaKarti
        baslik="Topluluk"
        aciklama="Sevdiğin yapımları tartış, listeler oluştur, grupların parçası ol."
      />

      <KarsilamaKarti
        baslik="Keşif"
        aciklama="Algoritmanın seçtiği değil, gerçek insanların önerdiği yapımları keşfet."
      />
    </main>
  );
}