// Kurgusal film afişleri — telifsiz, tamamen CSS/SVG. Landing ve boş durumlarda
// "eski sinema afişi" hissini verir. (Gerçek afişler Keşfet'te TMDB'den gelir.)
type Sahne = "sehir" | "perde" | "fener" | "gunes" | "ay" | "sandalye";

const afisler: Record<Sahne, { baslik: [string, string]; zemin: string; yazi: string }> = {
  sehir: { baslik: ["GECE", "VARDİYASI"], zemin: "from-[#12303a] to-[#0a1a22]", yazi: "text-[#f3d9a0]" },
  perde: { baslik: ["KIRMIZI", "PERDE"], zemin: "from-[#8c2f25] to-[#4a1512]", yazi: "text-[#f6e3c0]" },
  fener: { baslik: ["UZAK", "KIYILAR"], zemin: "from-[#e9dcc0] to-[#c9b78f]", yazi: "text-[#3a3a2e]" },
  gunes: { baslik: ["YOLCULUK", ""], zemin: "from-[#f0c27a] to-[#d9743a]", yazi: "text-[#4a2313]" },
  ay: { baslik: ["AY", "IŞIĞI"], zemin: "from-[#27324f] to-[#111627]", yazi: "text-[#e6e9f5]" },
  sandalye: { baslik: ["SON", "SEANS"], zemin: "from-[#f1e6cf] to-[#dccba6]", yazi: "text-[#3b2a1c]" },
};

export default function KurguAfis({
  sahne,
  className = "",
}: {
  sahne: Sahne;
  className?: string;
}) {
  const a = afisler[sahne];
  return (
    // Dış kutu konumu (className) taşır; iç kutu afişin kendisi.
    <div className={className} aria-hidden>
    <div
      className={`@container relative aspect-[2/3] rounded-md overflow-hidden bg-gradient-to-b ${a.zemin} shadow-afis ring-4 ring-[#f3ead6]`}
    >
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {sahne === "sehir" && (
          <g>
            <circle cx="72" cy="52" r="9" fill="#f3d9a0" opacity=".9" />
            <g fill="#07131a">
              <rect x="0" y="92" width="16" height="58" />
              <rect x="14" y="74" width="14" height="76" />
              <rect x="30" y="86" width="12" height="64" />
              <rect x="44" y="64" width="16" height="86" />
              <rect x="62" y="80" width="13" height="70" />
              <rect x="77" y="70" width="12" height="80" />
              <rect x="90" y="88" width="10" height="62" />
            </g>
            <g fill="#f3d9a0" opacity=".75">
              <rect x="18" y="80" width="2" height="3" /><rect x="23" y="88" width="2" height="3" />
              <rect x="48" y="70" width="2" height="3" /><rect x="54" y="78" width="2" height="3" />
              <rect x="48" y="90" width="2" height="3" /><rect x="66" y="86" width="2" height="3" />
              <rect x="81" y="76" width="2" height="3" /><rect x="84" y="92" width="2" height="3" />
            </g>
            <rect x="46" y="120" width="5" height="16" rx="2" fill="#f3d9a0" opacity=".9" />
            <circle cx="48.5" cy="116" r="3" fill="#f3d9a0" opacity=".9" />
          </g>
        )}
        {sahne === "perde" && (
          <g>
            <g fill="#5e1b16">
              <path d="M0 40 Q14 44 12 150 H0Z" />
              <path d="M100 40 Q86 44 88 150 H100Z" />
            </g>
            <g fill="#a23a2e" opacity=".55">
              <path d="M12 40 Q24 60 20 150 H12Z" />
              <path d="M88 40 Q76 60 80 150 H88Z" />
            </g>
            <circle cx="42" cy="96" r="8" fill="#f6e3c0" />
            <path d="M30 150 Q30 108 42 108 Q54 108 54 150Z" fill="#2b0d0b" />
            <circle cx="62" cy="104" r="7" fill="#f6e3c0" opacity=".9" />
            <path d="M52 150 Q52 114 62 114 Q72 114 72 150Z" fill="#3a1210" />
          </g>
        )}
        {sahne === "fener" && (
          <g>
            <circle cx="70" cy="62" r="12" fill="#f7efd9" />
            <path d="M0 118 Q24 104 50 116 T100 110 V150 H0Z" fill="#5d7a78" />
            <path d="M0 130 Q30 120 56 130 T100 126 V150 H0Z" fill="#3f5a5b" />
            <path d="M22 118 L26 78 H34 L38 118Z" fill="#f7efd9" />
            <rect x="25" y="72" width="10" height="6" fill="#3a3a2e" />
            <path d="M24 72 L30 64 L36 72Z" fill="#8c2f25" />
            <rect x="26" y="92" width="8" height="6" fill="#8c2f25" />
            <path d="M35 75 L78 66 L78 84Z" fill="#f7efd9" opacity=".35" />
          </g>
        )}
        {sahne === "gunes" && (
          <g>
            <circle cx="50" cy="84" r="24" fill="#f7d98a" />
            <g fill="#c2582a" opacity=".5">
              <rect x="20" y="78" width="60" height="3" /><rect x="20" y="86" width="60" height="3" />
              <rect x="20" y="94" width="60" height="3" />
            </g>
            <path d="M0 104 H100 V150 H0Z" fill="#7a3518" />
            <path d="M44 104 L56 104 L70 150 L30 150Z" fill="#4a2313" />
            <path d="M49.5 108 V116 M49.5 124 V134 M49.5 142 V150" stroke="#f7d98a" strokeWidth="1.2" />
          </g>
        )}
        {sahne === "ay" && (
          <g>
            <circle cx="50" cy="74" r="20" fill="#e6e9f5" />
            <circle cx="43" cy="68" r="4" fill="#c5cae0" /><circle cx="57" cy="80" r="5" fill="#c5cae0" />
            <circle cx="55" cy="66" r="2" fill="#c5cae0" />
            <g fill="#e6e9f5" opacity=".7">
              <circle cx="16" cy="52" r=".9" /><circle cx="84" cy="46" r=".9" /><circle cx="26" cy="96" r=".8" />
              <circle cx="78" cy="104" r=".8" /><circle cx="88" cy="74" r=".7" /><circle cx="12" cy="78" r=".7" />
            </g>
            <path d="M0 126 Q26 112 50 124 T100 118 V150 H0Z" fill="#0a0e1c" />
          </g>
        )}
        {sahne === "sandalye" && (
          <g>
            <rect x="0" y="118" width="100" height="32" fill="#c8b68c" />
            <g fill="#5a3a22">
              <rect x="38" y="70" width="3" height="56" /><rect x="59" y="70" width="3" height="56" />
              <rect x="38" y="70" width="24" height="3" /><rect x="38" y="80" width="24" height="3" />
              <rect x="36" y="98" width="28" height="4" />
              <rect x="34" y="100" width="3" height="28" /><rect x="63" y="100" width="3" height="28" />
            </g>
            <ellipse cx="50" cy="130" rx="22" ry="3" fill="#3b2a1c" opacity=".25" />
          </g>
        )}
      </svg>

      <div className={`absolute inset-x-0 top-0 p-[9%] text-center ${a.yazi}`}>
        <p
          className="font-display font-black leading-[0.92] tracking-wide"
          style={{ fontSize: "clamp(0.7rem, 15cqw, 1.6rem)", fontVariationSettings: '"opsz" 144' }}
        >
          {a.baslik[0]}
          {a.baslik[1] && (
            <>
              <br />
              {a.baslik[1]}
            </>
          )}
        </p>
      </div>
    </div>
    </div>
  );
}
