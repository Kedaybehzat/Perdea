# Görev: Profil sayfası (`/profil`)

**Durum:** Header "Profil"e linkliyor ama sayfa yok → 404. Yapılacak.
**Önce:** `core/durum.md`. Gerekirse `core/mimari.md` (konvansiyonlar), `core/sema.md` (users sütunları).

## Hedef
Giriş yapmış kullanıcının profilini gösteren sayfa. Opsiyonel: düzenleme.

## Adımlar
1. `app/profil/page.tsx` oluştur — **server component** (`async`).
2. Session al:
   ```ts
   const supabase = await createClient()            // lib/supabase/server
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/giris')                    // girişsizse at
   ```
3. Profil satırını çek:
   ```ts
   const { data: profil } = await supabase
     .from('users').select('*').eq('id', user.id).single()
   ```
4. Göster: `username`, `display_name`, `bio`, `avatar_url` (yoksa placeholder), `created_at` ("üyelik tarihi").
5. Tema: `core/mimari.md`'deki zümrüt/krem. Kart içinde ortalanmış, `/kayit` sayfasına benzer kabuk.

## Opsiyonel — düzenleme formu
- `display_name` + `bio` düzenlenebilir (username'i şimdilik sabit tut, unique sorunları açar).
- Ayrı client form + server action: `app/profil/actions.ts` → `profilGuncelle`:
  ```ts
  await supabase.from('users').update({ display_name, bio }).eq('id', user.id)
  ```
- RLS hazır: `users` update policy `auth.uid() = id`. `avatar_url` için Supabase Storage ileride.

## Bitince
- `core/durum.md`: profil maddesini [x] yap.
- commit + push.
