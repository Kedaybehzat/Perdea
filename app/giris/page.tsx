import GirisFormu from './GirisFormu'

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>
}) {
  const params = await searchParams
  const hata = params.hata

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-stone-100">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-emerald-700 text-center mb-8">
          Perdea
        </h1>
        <GirisFormu hata={hata} />
      </div>
    </main>
  )
}