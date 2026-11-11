# Durum — ne bitti, ne kaldı

Son güncelleme: 2026-11-04 (sabah). **İş bitince bu dosyayı güncelle.**

## ✅ Proje artık `~/dev/perdea2`'de
Eski `~/Desktop/projects/perdea2` iCloud sync tuzağı yüzünden taşındı (`tuzaklar.md`). Yeni Supabase projesiyle (`yownpangnyenjsozrguw.supabase.co`) aktif, dev sorunsuz, tüm sayfalar (`/`, `/kesfet`, `/vizyon`, `/baslik`, `/sohbet`, `/oyun`, `/profil`, `/eslesme`) 200 dönüyor. Eski Desktop klasörü dokunulmadan duruyor — yeni konum çalışırken sil.

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

## 11 Kas 2026 — tasarım sistemi + 3 yeni özellik (Claude)
- **Tasarım sistemi** yenilendi: `app/globals.css` (Fraunces + Figtree, `public/fonts/` içinde self-host; perde-* yeşilleri, altin, `bilet`/`perde-zemin`/`ampuller`/`alan`/`dugme` utility'leri). Ortak parçalar `components/ui/`. Header/Footer/MobilMenu/landing/giriş/kayıt yeniden yazıldı. Nav tek yerden: `components/navigasyon.ts`.
- **Salon puanları** `/salonlar`, **Cosplay buluşmaları** `/cosplay`, **Ben Kimim? odaları** `/oyun` — full-stack. Ayrıntı: `gorevler/salon-cosplay-oyun.md`.
- **DB:** `docs/migrations/2026-11-11_salon_cosplay_oyun.sql` Supabase SQL Editor'de BİR KEZ çalıştırılmalı (idempotent). Çalışmadıysa sayfalar "kurulum eksik" notu gösterir (`lib/hata.ts` → `kurulumEksikMi`).
- **2. tur (aynı gün):** kesfet, vizyon, eslesme, profil, u/[username] yeni tasarıma geçti; hareket katmanı eklendi (`globals.css` → "Hareket" bölümü: `goster`, `sirali`, `kalkar`, `afis`, `iskelet`, `perde-acilis`, `konfeti`, `halka-dol`; sayfa geçişi `app/template.tsx`). Yeni parçalar: `PerdeBandi`, `AfisYok`, `UyumHalkasi`, `Konfeti`.
- **3. tur (aynı gün):** Sohbet (`/sohbet`), Başlıklar (`/baslik`), Akış (`/topluluk`) full-stack bitti → `gorevler/sohbet-baslik-akis.md`. **DB:** `docs/migrations/2026-11-11b_sohbet_baslik_akis.sql` de çalıştırılmalı (ilkinden SONRA). Mockup sayfa kalmadı.
- **4. tur (aynı gün):** sohbette fotoğraf + sesli mesaj, bildirimler (`/bildirimler`, üst menü zili, sekme başlığı sayacı, tarayıcı bildirimi), KVKK (`/kvkk`, `/kosullar`, kayıtta zorunlu onay kutusu, hesap silme) → `gorevler/medya-bildirim-kvkk.md`. **DB:** `docs/migrations/2026-11-11c_medya_bildirim_kvkk.sql` (üçüncü ve son dosya; sırayla a → b → c). `2026-11-11b` artık `matches` tablosunu da kuruyor (canlı DB'de yoktu).
- **5. tur — MOBİL başladı:** `mobil/` (Expo SDK 58, Expo Router, React Native). İlk tur ekranları: karşılama, giriş, kayıt, Keşfet, Eşleş, Sohbet (yazı), Akış, Profil → `gorevler/mobil.md`. Web'e `app/api/mobil/tmdb/route.ts` eklendi (uygulama film verisini buradan alır). `mobil/` web'in tsconfig ve eslint'inden hariç tutuldu.
- **Yayın öncesi doldurulacak:** `lib/yasal.ts` (veri sorumlusu adı + adres). Metinler hukukçu kontrolünden geçmedi.
- Kullanılmayan eski bileşenler (silinebilir): `components/KarsilamaKarti.tsx`, `Sayac.tsx`, `YakindaSayfasi.tsx`.

## Kalan işler (sıralı)
### Önce Supabase'i canlı tut (blocker — bunlar çözülmeden hiçbiri çalışmaz)
1. [ ] **Supabase projeyi geri aç.** Dashboard → Restore (paused ise) ya da yeni proje + `docs/schema.sql` yeniden çalıştır + `.env.local`'daki URL/anon key'i yenile.
2. [ ] **(Opsiyonel) Node 22'ye geç** — Supabase 20'de uyarı veriyor.

### Backend bekleyen UI mockup'ları (spec'leri hazır)
3. [x] **Başlık + entry** — BİTTİ → `gorevler/sohbet-baslik-akis.md` (eski spec: `gorevler/baslik.md`) — basliklar/entryler/entry_begeni/baslik_takip tabloları + RLS + lib + actions.
4. [x] **Özel chat** — BİTTİ → `gorevler/sohbet-baslik-akis.md` (eski spec: `gorevler/ozel-chat.md`) — friendships/conversations/messages tabloları + RLS + Realtime subscribe + lib + actions.
5. [x] **Ben Kimim? oyun odaları** — BİTTİ (11 Kas 2026) → `gorevler/salon-cosplay-oyun.md`. Eski `karakter-oyunu.md` spec'i geçersiz.
6. [x] **Beğen/Geç kalıcı hale getir** (Codex yaptı, commit 7c1bd6a) (`/eslesme`) — `matches` tablosu + RLS, aynı adayı tekrar gösterme, karşılıklı beğen = eşleşme bildirim.

### Küçük işler
7. [ ] **TMDB API key** — `.env.local`'da zaten var (`a95b...`). Vizyon/Keşfet çalışıyor.
8. [x] **Topluluk gerçek içerik** — BİTTİ (gonderiler + beğeni).
9. [ ] **Avatar yükleme** — Supabase Storage.
10. [ ] **Canlı öncesi:** "Confirm email"i aç, akışı uyarla → `core/tuzaklar.md`.

## Sonra
- Mobil versiyon (tüm web bitince).

## Notlar
- Repo canlıda `Kedaybehzat/Perdea.git` (perdea2 değil).
- `movie_id integer` TMDB id'si; favori/rating tabloları tek sütun tuttuğu için şimdilik film/dizi karışık.
