// Tablolar henüz oluşturulmamışsa (migration çalıştırılmadıysa) geliştiriciye not.
export default function KurulumNotu() {
  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl px-4 py-3">
      <strong>Kurulum bekleniyor:</strong> bu özelliğin tabloları veritabanında yok.
      Supabase → SQL Editor&apos;de{" "}
      <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
        docs/migrations/2026-11-11_salon_cosplay_oyun.sql
      </code>{" "}
      dosyasını çalıştır.
    </div>
  );
}
