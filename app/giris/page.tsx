import AuthKabuk from '@/components/AuthKabuk'
import GirisFormu from './GirisFormu'

export const metadata = { title: 'Giriş Yap — Perdea' }

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>
}) {
  const params = await searchParams
  const hata = params.hata

  return (
    <AuthKabuk
      slogan={
        <>
          Kaldığın <em className="text-emerald-300">sahneden</em> devam.
        </>
      }
    >
      <GirisFormu hata={hata} />
    </AuthKabuk>
  )
}
