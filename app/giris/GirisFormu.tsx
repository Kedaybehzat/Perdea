'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { girisYap } from './actions'

export default function GirisFormu({ hata }: { hata?: string }) {
  const [sifreGorunur, setSifreGorunur] = useState(false)

  return (
    <div className="bg-stone-50 rounded-2xl shadow-sm border border-stone-200 p-8">
      <h2 className="text-3xl font-bold text-stone-900 text-center mb-2">
        Giriş Yap
      </h2>
      <p className="text-stone-600 text-center mb-8">
        Tekrar hoş geldin.
      </p>

      {hata && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
            className="px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
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
              className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
            />
            <button
              type="button"
              onClick={() => setSifreGorunur(!sifreGorunur)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {sifreGorunur ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 px-4 py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
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