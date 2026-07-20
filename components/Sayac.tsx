"use client"

import { useState} from "react";

export default function Sayac(){
    const [sayi, setSayi] = useState(0);

    return (
        <div className="flex flex-col items-center gap-4 p-6 border border-zinc-700 rounded-xl">
        <p className="text-white text-2xl">Sayaç: {sayi}</p>
        <button
            onClick={() => setSayi(sayi + 1)}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300"
        >
        Artır
        </button>
    </div>
    );
}