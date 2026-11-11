> **GEÇERSİZ (11 Kas 2026):** Bu özellik yapıldı; tablo ve dosya adları burada yazandan farklı. Güncel hali: `gorevler/sohbet-baslik-akis.md`. Aşağısı yalnızca tarihçe.

# Görev: Başlık sayfası (ekşi/twitter karışımı)

**Durum:** `/baslik` UI mockup var (`app/baslik/page.tsx`), backend hiç yok.
**Önce:** `core/durum.md`. DB'ye dokunacağın için `core/sema.md`.

## Hedef
Bir film/dizi/anime için "başlık" (ekşi tarzı) + altına kısa entry'ler (twitter tarzı). Kullanıcılar başlık açar, entry yazar, beğenir, takip eder.

## Şema (ek — `docs/schema.sql`'e ALTER veya yeni migration)

```sql
create table basliklar (
  id uuid primary key default gen_random_uuid(),
  olusturan_id uuid references users(id) on delete set null,
  baslik text not null,                      -- "korku perdesi s4 finali"
  slug text generated always as (
    lower(regexp_replace(baslik, '[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ ]+', '', 'g'))
  ) stored,
  movie_id integer,                          -- TMDB id (nullable; genel başlık da olabilir)
  created_at timestamptz default now()
);
create index on basliklar (movie_id);
create index on basliklar (created_at desc);

create table entryler (
  id uuid primary key default gen_random_uuid(),
  baslik_id uuid references basliklar(id) on delete cascade not null,
  yazar_id uuid references users(id) on delete cascade not null,
  metin text not null check (length(metin) between 1 and 1200),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on entryler (baslik_id, created_at);

create table entry_begeni (
  entry_id uuid references entryler(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (entry_id, user_id)
);

create table baslik_takip (
  baslik_id uuid references basliklar(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (baslik_id, user_id)
);
```

## RLS
- `basliklar` select: herkes · insert: auth kullanıcı · update/delete: yalnız sahibi
- `entryler` select: herkes · insert: auth · update/delete: yalnız yazar
- `entry_begeni` select: herkes · insert/delete: auth.uid = user_id
- `baslik_takip` select: herkes · insert/delete: auth.uid = user_id

## Yol
1. Şema + RLS canlıya.
2. `lib/baslik.ts`: `basliklariListele(sira: "gundem"|"son")`, `baslikGetir(slug)`, `entryEkle`, `entryBeğen`, `takipEt/Birak`.
3. Server actions `app/baslik/actions.ts`.
4. `/baslik` list — zaten mockup var, `basliklariListele`'ye bağla.
5. `/baslik/[slug]` detay sayfası — başlık + entry listesi + entry form.
6. "Yeni başlık" modalı/sayfası.

## UI notları
- Entry altında: beğen (lucide `Heart`), yorum sayısı yok (entry'ler zaten yorum), yazar, zaman.
- "Gündem" vs "Son hareket" sekmeleri: gündem = son 24 saatte entry toplamına göre, son hareket = `max(entry.created_at)`.
- Ekşi'den fark: bir başlık mümkünse bir TMDB yapımına bağlı (`movie_id`). "Genel" başlıklar da olabilir (`movie_id null`).

## Bitince
- `core/durum.md`'de [x].
- commit + push.
