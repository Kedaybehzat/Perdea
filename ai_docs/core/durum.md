# Durum — ne bitti, ne kaldı

Son güncelleme: 2026-11-04 (gece). **İş bitince bu dosyayı güncelle.**

## 🚨 KRİTİK: Supabase projesi şu an ulaşılamaz
`qryjifkmxplsjenamnhp.supabase.co` DNS'te çözülmüyor. Free tier 2-3 ay inaktiften sonra proje silinmiş olabilir. Supabase bağlanana kadar `/kayit`, `/giris`, `/profil`, `/eslesme`, hatta `/` bile açılmaz (proxy her request'te `getUser` çağırıyor). Detaylı çözüm: `core/tuzaklar.md` ilk madde.

## Bitti ✅
### Modül 3 — Auth (eski, çalışıyordu)
- Supabase şeması + RLS canlıya alındı (`core/sema.md`).
- SSR auth: proxy + server/browser client (`lib/supabase/`).
- `/kayit`, `/giris`, çıkış, Header session'a göre dinamik.

### Modül 4 — UI ve TMDB entegrasyonu
- **Profil** (`app/profil/page.tsx` + `/duzenle`) — kapak+avatar, bio, favori vitrini, puanladıklarım, profil özeti sidebar; display_name/bio/avatar_url düzenleme.
- **Kamu profili** (`app/u/[username]/page.tsx`) — başkasının profili; eşleşme kartlarından link. Ortak favori rozeti otomatik hesaplanır.
- **Keşfet** (`app/kesfet/`) — TMDB trending + search, film/dizi filtresi, favori toggle + 1-10 puan picker (`YapimKart`, optimistic UI).
- **Eşleşme** (`app/eslesme/page.tsx`) — korumalı; `lib/eslesme.ts` ortak favori + puan yakınlığı skoru, ana aday + sıradaki adaylar + boş durum. Kartlar `/u/[username]`'a linkli.
- **Vizyon** (`app/vizyon/page.tsx`) — TMDB `now_playing` + `upcoming` TR bölgesi, poster grid.
- **Topluluk** (`app/topluluk/page.tsx`) — mockup feed + Gündemde + Popüler Etiketler sidebar.
- **Başlık** (`app/baslik/page.tsx`) — ekşi/twitter tarzı başlık listesi, her başlığın altında son entry. UI mockup; backend `gorevler/baslik.md`'de spec'li.
- **Sohbet** (`app/sohbet/page.tsx`) — birebir mesajlaşma UI mockup'ı. Spec: `gorevler/ozel-chat.md`.
- **Karakter Oyunu** (`app/oyun/page.tsx`) — "ben kimim?" 20-soru oyunu UI mockup'ı. Spec: `gorevler/karakter-oyunu.md`.
- **Hakkımızda / İletişim** (`app/hakkimizda`, `app/iletisim`) — emerald tema, kanal kartları.
- **Landing** (`app/page.tsx`) — hero'da placeholder yerine CSS'li eşleşme demo kartı.
- **Header** — responsive, mobil hamburger menü (`components/MobilMenu.tsx`), aktif sayfa vurgusu (`x-pathname` header'ı middleware'den gelir).
- **Loading states** — `/profil`, `/kesfet`, `/eslesme`, `/vizyon` için skeleton.
- **not-found.tsx** — özel 404.
- **Metadata** — her sayfanın tab başlığı; layout'ta Open Graph + Twitter kartları.
- **lib/** — `tmdb.ts`, `favori.ts`, `puan.ts`, `eslesme.ts`.
- **Font tuzakları** — `next/font/google` kaldırıldı, sistem font'a geçildi (Türkiye'den Google Fonts intermittent).
- **.next iCloud dışına symlink** — `~/.cache/perdea2-next-dev` → `.next` (distDir proje dışına izin vermiyor).
- **.gitignore** — `.next` sembolik link + `*.zip` eklendi.

## Kalan işler (sıralı)
### Önce Supabase'i canlı tut (blocker — bunlar çözülmeden hiçbiri çalışmaz)
1. [ ] **Supabase projeyi geri aç.** Dashboard → Restore (paused ise) ya da yeni proje + `docs/schema.sql` yeniden çalıştır + `.env.local`'daki URL/anon key'i yenile.
2. [ ] **(Opsiyonel) Node 22'ye geç** — Supabase 20'de uyarı veriyor.

### Backend bekleyen UI mockup'ları (spec'leri hazır)
3. [ ] **Başlık + entry** → `gorevler/baslik.md` — basliklar/entryler/entry_begeni/baslik_takip tabloları + RLS + lib + actions.
4. [ ] **Özel chat** → `gorevler/ozel-chat.md` — friendships/conversations/messages tabloları + RLS + Realtime subscribe + lib + actions.
5. [ ] **Karakter oyunu** → `gorevler/karakter-oyunu.md` — games/game_secrets/game_moves tabloları + RLS + lib + actions. Sohbet önkoşul.
6. [ ] **Beğen/Geç kalıcı hale getir** (`/eslesme`) — `matches` tablosu + RLS, aynı adayı tekrar gösterme, karşılıklı beğen = eşleşme bildirim.

### Küçük işler
7. [ ] **TMDB API key** — `.env.local`'da zaten var (`a95b...`). Vizyon/Keşfet çalışıyor.
8. [ ] **Topluluk gerçek içerik** (post tablosu + feed) — şu an mockup.
9. [ ] **Avatar yükleme** — Supabase Storage.
10. [ ] **Canlı öncesi:** "Confirm email"i aç, akışı uyarla → `core/tuzaklar.md`.

## Sonra
- Mobil versiyon (tüm web bitince).

## Notlar
- Repo canlıda `Kedaybehzat/Perdea.git` (perdea2 değil).
- `movie_id integer` TMDB id'si; favori/rating tabloları tek sütun tuttuğu için şimdilik film/dizi karışık.
- Mockup'lı sayfalarda (`/topluluk`, `/baslik`, `/sohbet`, `/oyun`) sarı "Önizleme" kutusu var — spec dosyasına link.
