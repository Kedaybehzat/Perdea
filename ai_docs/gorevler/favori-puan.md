# Görev: Favori ekleme + Puan verme

**Durum:** `favorites`/`ratings` tabloları + RLS hazır ama hiç kullanılmıyor.
**Önce:** `core/durum.md` + `core/sema.md` (favorites/ratings yapısı, RLS).

## ⚠️ ÖNCE KARAR: film verisi nereden?
`movie_id integer` bir film kaynağının id'si olmalı. **TMDB** en olası (ücretsiz API, `movie_id` = TMDB id). Ayberk onaylamadan bu görevi başlatma.
TMDB seçilirse: API key al, `.env.local`'e `TMDB_API_KEY` (NEXT_PUBLIC değil — server-side), `lib/tmdb.ts` ile arama/detay fonksiyonları.

## Hedef
Kullanıcı bir filmi favoriye ekleyip/çıkarabilsin (toggle) ve 1–10 puan verebilsin (güncellenebilir).

## Yapı (lib/ disiplini — hepsi lib/ üzerinden)
`lib/db.ts` (ya da `lib/favorites.ts`, `lib/ratings.ts`):
```ts
// favori toggle
export async function favoriEkle(movieId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('giriş gerekli')
  return supabase.from('favorites').insert({ user_id: user.id, movie_id: movieId })
}
export async function favoriSil(movieId: number) { /* delete eq user_id,movie_id */ }

// puan (upsert — varsa güncelle, yoksa ekle)
export async function puanVer(movieId: number, score: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('giriş gerekli')
  return supabase.from('ratings').upsert(
    { user_id: user.id, movie_id: movieId, score, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,movie_id' }
  )
}
```
Bunları çağıran **server action**'lar (`app/kesfet/actions.ts` vb.), formdan/butondan tetiklenir.

## UI
- Keşfet sayfasında film kartları (TMDB'den) → her kartta kalp (favori toggle) + puan seçici (1–10).
- Girişsizse butonlar `/giris`'e yönlendirsin ya da pasif.

## Dikkat
- RLS: insert/upsert `with check (auth.uid() = user_id)` → `user_id` mutlaka giriş yapan kullanıcı olmalı (yukarıda öyle).
- `unique(user_id, movie_id)` → aynı film iki kez favori olamaz; favori eklerken `23505` yakala (zaten favoride) ya da önce kontrol et.

## Bitince
- `core/durum.md`: favori-puan [x] + film verisi kararını not et.
- commit + push.
