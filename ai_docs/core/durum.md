# Durum — ne bitti, ne kaldı

Son güncelleme: 2026-11-04. **İş bitince bu dosyayı güncelle.**

## Bitti ✅ (Modül 3 — Auth, tamamen çalışıyor, push'lu)
- Supabase kurulu: Frankfurt `eu-central-1`, Free, proje id `qryjifkmxplsjenamnhp`.
- Şema + RLS canlıda (3 tablo, 10 policy) → `core/sema.md`.
- SSR auth: browser client + server client + proxy (`lib/supabase/`, `proxy.ts`).
- `/kayit` — 2 adımlı (auth.signUp + `users` insert), doğrulama, şifre tekrar, hata kutusu, username çakışma mesajı.
- `/giris` — `signInWithPassword`, doğrulama, hata kutusu.
- Çıkış — `app/auth/actions.ts` → `cikisYap` (signOut).
- `Header` — session'a göre dinamik (girişli: Profil+Çıkış / değil: Giriş+Kayıt).

## Bitti ✅ (Modül 4 — Profil, eşleşme, keşfet, favori/puan — push'lu)
- **Profil** (`app/profil/page.tsx`) — kapak + avatar + bio + chip, favori vitrini (ilk 4), puanladıklarım grid, sağda profil özeti (favori sayısı / puan sayısı / ortalama). Girişsizse `/giris`'e redirect.
- **Profili Düzenle** (`app/profil/duzenle/`) — ayrı sayfa + client form (`DuzenleFormu.tsx`) + `app/profil/actions.ts::profilGuncelle`. `display_name`, `bio`, `avatar_url` güncellenebilir; username sabit. Hata `?hata=` ile forma döner.
- **Keşfet** (`app/kesfet/page.tsx`) — TMDB `trending/week` + `search/multi` (dil `tr-TR`), film/dizi/hepsi filtresi, arama. `YapimKart.tsx` (client) içinden favori toggle + 1–10 puan picker, `useTransition` + optimistic UI. TMDB key yoksa güzel "kurulum gerekiyor" ekranı.
- **Eşleşme** (`app/eslesme/page.tsx`) — korumalı. MVP algoritması `lib/eslesme.ts::enUygunEslesmeler`: ortak favori sayısı + ortak filmlerde puan farkı yakınlığı. Ana aday kartı + "Sıradaki olası eşleşmeler" row + boş durum (favori yok / aday yok) ekranları. Beğen/Geç butonları şimdilik stateless (ileride `matches` tablosu).
- **lib/** — `tmdb.ts` (trend/arama/detay/id-batch + hazırMı), `favori.ts` (durum/ekle/sil/toggle + id listesi), `puan.ts` (upsert/sil + liste), `eslesme.ts` (algoritma).
- **Server actions** — `app/kesfet/actions.ts`: `favoriDegistir`, `puanKaydet`, `puanTemizle` (hepsi `revalidatePath` çağrıyor).
- **Route koruma** — `/profil`, `/profil/duzenle`, `/eslesme` sayfa içi `getUser` + `redirect('/giris')`. Yöntem 1 (sayfa-bazlı), ileride çoğalınca merkezi'ye geçilebilir.
- **Nav sayfaları** — `/topluluk`, `/vizyon` hâlâ `YakindaSayfasi` ile. `/kesfet` ve `/eslesme` yukarıdaki gibi dolu.

## Kalan işler
1. [ ] **TMDB API key** — `.env.local`'a `TMDB_API_KEY=...` ekle (Keşfet ve poster vitrinleri bunsuz "yakında" düşer).
2. [ ] **Beğen/Geç kalıcı hale getir** — `matches` tablosu + RLS, `/eslesme`'de aksiyon kaydet, aynı adayı tekrar gösterme.
3. [ ] **Topluluk** gerçek içerik (post tablosu + feed). UI mockup var (`UI_IMG/topluluk.png`).
4. [ ] **Vizyon** — "vizyondaki filmler" (TMDB `now_playing`) mi, "proje vizyonu" sayfası mı? Karar.
5. [ ] **Canlı öncesi:** "Confirm email"i aç + akışı uyarla, Node 22'ye çık → `core/tuzaklar.md`.
6. [ ] (Opsiyonel) Avatar yükleme için Supabase Storage.

## Sonra
- Mobil versiyon (tüm web bitince).

## Notlar
- Repo canlıda `Kedaybehzat/Perdea.git` (perdea2 değil) — remote adı; klasör adı `perdea2` kaldı.
- `movie_id integer` TMDB id'si. Dizi/film ayrımı şu an `media_type` ile çekiliyor; favori/rating tabloları tek sütun (`movie_id`) tuttuğu için şimdilik "TMDB id" olarak kabul ediliyor. Dizileri ayrı tablo/kolonla ayırmak isteyecek olursak `sema.md` güncellenir.
