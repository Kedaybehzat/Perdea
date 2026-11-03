'use client'

import Link from "next/link";
import { useState } from "react";
import { profilGuncelle } from "../actions";

type Baslangic = {
  display_name: string;
  bio: string;
  avatar_url: string;
};

type Props = {
  baslangic: Baslangic;
  hata?: string;
};

export default function DuzenleFormu({ baslangic, hata }: Props) {
  const [bio, setBio] = useState(baslangic.bio);

  return (
    <form
      action={profilGuncelle}
      className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 space-y-5"
    >
      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {hata}
        </div>
      )}

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-stone-700 mb-1.5">
          Görünen isim
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={baslangic.display_name}
          maxLength={50}
          placeholder="Deniz K."
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
        <p className="mt-1 text-xs text-stone-500">
          Profilinde ve eşleşmelerde gösterilir. En fazla 50 karakter.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-stone-700 mb-1.5">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={240}
          placeholder="Korku filmi bağımlısı, anime gezgini..."
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 resize-none"
        />
        <p className="mt-1 text-xs text-stone-500 flex justify-between">
          <span>Kısa bir tanıtım — ne izlemeyi seversin?</span>
          <span>{bio.length}/240</span>
        </p>
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-stone-700 mb-1.5">
          Avatar bağlantısı
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={baslangic.avatar_url}
          placeholder="https://..."
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
        <p className="mt-1 text-xs text-stone-500">
          Şimdilik dış bir görsel bağlantısı (ör. imgur). Yükleme ileride.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Kaydet
        </button>
        <Link
          href="/profil"
          className="text-stone-600 hover:text-stone-900 font-medium px-4 py-2.5"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
