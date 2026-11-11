// Form sonucu: hata (kırmızı) ya da başarı (yeşil). Ekran okuyucuya duyurulur.
export default function FormMesaji({ hata, tamam }: { hata?: string; tamam?: string }) {
  if (!hata && !tamam) return null;
  return (
    <p
      role={hata ? "alert" : "status"}
      className={`text-sm rounded-xl px-4 py-3 border ${
        hata
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
    >
      {hata ?? tamam}
    </p>
  );
}
