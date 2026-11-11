// Kutlama konfetisi (saf CSS). Kapsayıcısı relative olmalı.
const RENKLER = ["#d9a441", "#34d399", "#f5f0e6", "#059669", "#fbbf24"];

export default function Konfeti({ adet = 18 }: { adet?: number }) {
  return (
    <div className="konfeti" aria-hidden>
      {Array.from({ length: adet }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            background: RENKLER[i % RENKLER.length],
            animationDelay: `${(i % 6) * 0.12}s`,
            animationDuration: `${2 + (i % 4) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}
