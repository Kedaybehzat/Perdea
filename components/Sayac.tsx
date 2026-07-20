"use client";

import { useState } from "react";

export default function Sayac() {
  const [sayi, setSayi] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border border-stone-200 rounded-xl shadow-sm">
      <p className="text-stone-900 text-2xl">Sayaç: {sayi}</p>
      <button
        onClick={() => setSayi(sayi + 1)}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
      >
        Artır
      </button>
    </div>
  );
}