> **GEÇERSİZ (11 Kas 2026):** Oyun, sohbetten bağımsız çok oyunculu odalar olarak yapıldı. Güncel hali: `gorevler/salon-cosplay-oyun.md`. Aşağısı yalnızca tarihçe.

# Görev: Karakter oyunu ("Ben kimim?" — 20 soru)

**Durum:** `/oyun` UI mockup var (`app/oyun/page.tsx`), backend yok. Sohbet'in üstüne oturan bir mini-oyun.
**Önce:** `core/durum.md` + `core/sema.md` + `gorevler/ozel-chat.md` (mesajlaşma altyapısı önkoşul).
**Fikir:** 2 kullanıcı ortak bir film/dizi/anime favorisini seçer. Biri karakter belirler, diğeri 20 evet/hayır sorusu + 3 tahmin hakkıyla bulmaya çalışır.

## Oyun akışı
1. **Başlatma:** Sohbet içinde "Oyun oyna" → iki kullanıcının `favorites` kesişiminden (ortak `movie_id`'ler) seçim.
2. **Yapım seçimi:** İki kullanıcı seçimi onaylar (basit: başlatan seçer, diğeri onaylar).
3. **Karakter seçimi:** Rol kura/seçim — "bilen" (oracle) karakteri gizli yazar.
4. **Soru-cevap turu:** Soran yazar, oracle `evet / hayır / belki` butonlarından birini basar. 20 soru hakkı.
5. **Tahmin:** 3 tahmin hakkı. İlk tutturan kazanır. Bulamazsa oracle kazanır.
6. **Rol değişimi:** Taraflar yer değiştirir, yeni round.

## Şema

```sql
create table games (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  movie_id integer not null,                     -- ortak favoriden seçilen
  oracle_id uuid references users(id) on delete cascade not null, -- karakteri bilen
  guesser_id uuid references users(id) on delete cascade not null, -- bulmaya çalışan
  secret_character text not null,                -- oracle yazar; görünmez (RLS ile)
  status text not null default 'active'
    check (status in ('active','won','lost','abandoned')),
  questions_left integer not null default 20,
  guesses_left integer not null default 3,
  created_at timestamptz default now(),
  ended_at timestamptz,
  check (oracle_id <> guesser_id)
);
create index on games (conversation_id);

create table game_moves (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  mover_id uuid references users(id) on delete cascade not null,
  move_type text not null check (move_type in ('question','answer','guess','reveal')),
  content text not null,                         -- soru metni / tahmin / cevap ('evet'|'hayır'|'belki')
  created_at timestamptz default now()
);
create index on game_moves (game_id, created_at);
```

## RLS
- `games`:
  - select: `auth.uid()` in (oracle_id, guesser_id)
  - insert: `auth.uid() = oracle_id` (oracle oyunu başlatır — ilk hamle karakter seçimi)
  - update: ikisinden biri, ama sadece `status`, `questions_left`, `guesses_left`, `ended_at`
  - **secret_character gizliliği:** politika yetmez — select'te column-level koruma zor. Çözüm: `secret_character`'ı view'den çıkar. `games_public` adında bir view (kolonsuz veya hashli), client sadece ona bakar. Oracle kendi `games` tam satırını okuyabilir, guesser `secret_character`'ı DÖNDÜRMEYEN view'i okur.
    - Daha basit alternatif: `secret_character`'ı ayrı `game_secrets` tablosuna koy, RLS `user_id = oracle_id` → guesser görmez. Oyun bitince reveal: `update games set status='won/lost', ended_at=now()`, `game_secrets`'tan secret_character okunup `game_moves`'a `reveal` hamlesi olarak yazılır.
  - **Önerilen:** `game_secrets` ayrı tablo yaklaşımı — RLS temiz.
- `game_moves` select/insert: oyunun iki oyuncusundan biri. Update/delete yok.

## Server mantığı (`lib/oyun.ts`)
- `oyunBaslat(convId, movieId, secretCharacter)` → `games` + `game_secrets` insert.
- `soruYaz(gameId, soru)` → check `guesser_id = auth.uid()` + `questions_left > 0`, decrement.
- `soruyuCevapla(moveId, cevap)` → check oracle + sorunun cevapsız olduğunu.
- `tahminEt(gameId, tahmin)` → check guesser + `guesses_left > 0`. Doğruysa (metin yakınlık / exact) → `status='won'`. Yanlışsa decrement.
- `oyunuKapat(gameId)` → `status='abandoned'`.

## UI etkileşimi
- Sohbet başlığında "Oyun" butonu → `/oyun?conv={id}`.
- Aktif oyun ekranı: soru listesi (renkli: yeşil=evet, kırmızı=hayır, sarı=belki), soru input (guesser), evet/hayır/belki butonları (oracle, sadece son cevapsız soru için).
- Rol değişim turu için "yeni round" butonu.

## İleri
- AI oracle modu — tek kişi, bot oynatır (character bilgisi TMDB credits'ten).
- Zaman sınırı (her sorunun 30 saniyesi).
- Kazanma istatistikleri → profil "oyun" sekmesi.

## Bitince
- `core/durum.md`'de [x].
- commit + push.
