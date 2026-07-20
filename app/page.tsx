import KarsilamaKarti from "@/components/KarsilamaKarti";
import Sayac from "@/components/Sayac";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-stone-50">
      <h1 className="text-6xl font-bold text-stone-900 mb-2">Perdea</h1>
      <p className="text-stone-600 mb-8 italic">Zevkini paylaş, ruh eşini bul.</p>

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

      <Sayac />
    </main>
  );
}