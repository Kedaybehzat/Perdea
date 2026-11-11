'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { girisYap } from './actions'

export default function GirisFormu({ hata }: { hata?: string }) {
  const [sifreGorunur, setSifreGorunur] = useState(false)

  return (
    <div className="bg-white rounded-3xl shadow-kart border border-stone-200 p-7 sm:p-9">
      <h2 className="text-4xl font-bold text-stone-900 text-center mb-2">
        Giriş Yap
      </h2>
      <p className="text-stone-600 text-center mb-8">
        Tekrar hoş geldin.
      </p>

      {hata && (
        <div role="alert" className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {hata}
        </div>
      )}

      <form action={girisYap} className="flex flex-col gap-5">
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
              placeholder="Şifreni gir"
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

        <button
          type="submit"
          className="dugme mt-2 py-3!"
        >
          Giriş Yap
        </button>
      </form>

      <p className="text-center text-stone-600 mt-6">
        Hesabın yok mu?{' '}
        <Link href="/kayit" className="text-emerald-700 font-semibold hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  )
}