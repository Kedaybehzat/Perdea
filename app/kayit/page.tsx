import AuthKabuk from '@/components/AuthKabuk'
import KayitFormu from './KayitFormu'

export const metadata = { title: 'Kayıt Ol — Perdea' }

export default async function KayitPage({
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
          Yerin ayrıldı. <em className="text-emerald-300">Perde</em> birazdan açılıyor.
        </>
      }
    >
      <KayitFormu hata={hata} />
    </AuthKabuk>
  )
}
