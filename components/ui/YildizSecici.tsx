'use client'

import { useState } from "react";
import { Star } from "lucide-react";

// 1–5 yıldız seçici. Değer gizli input ile forma gider (name ile).
export default function YildizSecici({
  name,
  etiket,
  baslangic = 0,
}: {
  name: string;
  etiket: string;
  baslangic?: number;
}) {
  const [deger, setDeger] = useState(baslangic);
  const [uzerinde, setUzerinde] = useState(0);
  const gosterilen = uzerinde || deger;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-medium text-stone-800" id={`${name}-etiket`}>
        {etiket}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${name}-etiket`}
        className="flex items-center"
        onMouseLeave={() => setUzerinde(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={deger === n}
            aria-label={`${n} yıldız`}
            onMouseEnter={() => setUzerinde(n)}
            onFocus={() => setUzerinde(n)}
            onBlur={() => setUzerinde(0)}
            onClick={() => setDeger(n)}
            className="p-1 rounded transition-transform hover:scale-110"
          >
            <Star
              key={n <= deger ? `d${deger}` : "b"}
              className={`w-6 h-6 transition-colors ${
                n <= gosterilen ? "text-altin fill-altin" : "text-stone-300"
              } ${n <= deger ? "animate-zipla" : ""}`}
              style={n <= deger ? { animationDelay: `${(n - 1) * 45}ms` } : undefined}
            />
          </button>
        ))}
        <input type="hidden" name={name} value={deger} />
      </div>
    </div>
  );
}
