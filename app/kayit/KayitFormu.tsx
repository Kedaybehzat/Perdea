'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { kayitOl } from './actions'

export default function KayitFormu({ hata }: { hata?: string }) {
  const [sifreGorunur, setSifreGorunur] = useState(false)

  return (
    <div className="bg-white rounded-3xl shadow-kart border border-stone-200 p-7 sm:p-9">
      <h2 className="text-4xl font-bold text-stone-900 text-center mb-2">
        Kayıt Ol
      </h2>
      <p className="text-stone-600 text-center mb-8">
        Zevkini paylaş, ruh eşini bul.
      </p>

      {/* Hata mesajı — sadece hata varsa görünür */}
      {hata && (
        <div role="alert" className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {hata}
        </div>
      )}

      <form action={kayitOl} className="flex flex-col gap-5">
        {/* E-posta */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-800">E-posta</label>
          <input
            type="email"
            name="email"
            placeholder="ornek@mail.com"
            required
            className="alan"
          />
        </div>

        {/* Parola */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-800">Parola</label>
          <div className="relative">
            <input
              type={sifreGorunur ? 'text' : 'password'}
              name="password"
              placeholder="En az 8 karakter"
              required
              className="alan pr-12!"
            />
            <button
              type="button"
              onClick={() => setSifreGorunur(!sifreGorunur)}
              aria-label={sifreGorunur ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {sifreGorunur ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Parola tekrar */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-800">Parola (tekrar)</label>
          <input
            type={sifreGorunur ? 'text' : 'password'}
            name="passwordConfirm"
            placeholder="Şifreyi tekrar gir"
            required
            className="alan"
          />
        </div>

        {/* Kullanıcı adı */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-800">Kullanıcı adı</label>
          <input
            type="text"
            name="username"
            placeholder="Kullanıcı adını gir"
            required
            className="alan"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            name="onay"
            value="evet"
            required
            className="mt-1 w-4 h-4 shrink-0 accent-emerald-600"
          />
          <span>
            18 yaşından büyüğüm.{" "}
            <Link href="/kosullar" target="_blank" className="text-emerald-700 font-semibold underline">
              Kullanım Koşulları
            </Link>
            ’nı kabul ediyorum;{" "}
            <Link href="/kvkk" target="_blank" className="text-emerald-700 font-semibold underline">
              KVKK Aydınlatma Metni
            </Link>
            ’ni okudum ve verilerimin yurt dışındaki sunucularda saklanmasına açık rıza veriyorum.
          </span>
        </label>

        <button
          type="submit"
          className="dugme mt-2 py-3!"
        >
          Kayıt Ol
        </button>
      </form>

      <p className="text-center text-stone-600 mt-6">
        Zaten hesabın var mı?{' '}
        <Link href="/giris" className="text-emerald-700 font-semibold hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  )
}