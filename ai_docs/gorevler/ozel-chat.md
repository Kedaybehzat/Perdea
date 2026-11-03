# Görev: Özel chat (eşleşen kullanıcılarla birebir)

**Durum:** `/sohbet` UI mockup var (`app/sohbet/page.tsx`), backend yok.
**Önce:** `core/durum.md` + `core/sema.md`. "Matches" ön koşul (ya eşleşme tablosu ya da arkadaş ekleme — aşağıda bakın).

## Hedef
İki kullanıcı birbirleriyle birebir mesajlaşır. Eşleşme sonrası aktif olur.

## Şema (ek)

```sql
-- Arkadaşlık / eşleşme kabulü — sohbet açma iznini belirler.
create table friendships (
  requester_id uuid references users(id) on delete cascade not null,
  addressee_id uuid references users(id) on delete cascade not null,
  status text not null check (status in ('pending','accepted','blocked')),
  created_at timestamptz default now(),
  accepted_at timestamptz,
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
create index on friendships (addressee_id, status);

-- Tek sohbet odası iki kişilik (grup ileride).
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references users(id) on delete cascade not null,
  user_b uuid references users(id) on delete cascade not null,
  created_at timestamptz default now(),
  last_message_at timestamptz default now(),
  check (user_a < user_b),       -- kanonik sıra; aynı çifte iki oda açılmasın
  unique (user_a, user_b)
);
create index on conversations (last_message_at desc);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz default now(),
  read_at timestamptz
);
create index on messages (conversation_id, created_at);
```

## RLS
- `friendships` select/insert/update/delete: `auth.uid()` in (requester_id, addressee_id). Başkası göremez.
- `conversations` select/insert: `auth.uid()` in (user_a, user_b). Delete yok.
- `messages`:
  - select: kullanıcı kendi `conversation_id`'sine bakıyorsa (subquery ile `conversations` üzerinden kontrol)
  - insert: `auth.uid() = sender_id` + aynı conversation üyeleri olmalı
  - update: sadece `read_at` (sender_id değil, karşı taraf okuduğunda)
- `last_message_at` için `messages` insert trigger'ı: `update conversations set last_message_at = now() where id = new.conversation_id`.

## Realtime
Supabase Realtime'ı `messages` tablosu için aç. Client `conversation_id` filter'ıyla subscribe olur:
```ts
supabase
  .channel(`c:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {/* yeni mesajı state'e ekle */})
  .subscribe()
```

## UI akışı
- `/sohbet` — sol: sohbet listesi (`conversations` kullanıcıya ait), sağ: aktif sohbet mesaj akışı.
- Sohbet başlatma: `/eslesme`'de "Mesaj at" butonu → `conversations` upsert (`user_a=min(id), user_b=max(id)`), `/sohbet?aktif={id}`'e yönlendir.
- Mesaj gönderme: server action `mesajGonder(convId, body)` → `messages` insert + revalidate.
- Okundu işareti: pasif, client subscribe bildirimi gelince `update read_at = now()` (sadece karşı tarafın mesajı için).

## İleri (MVP sonrası)
- Grup sohbetleri (`conversation_participants` tablosuna geçiş).
- Medya (poster paylaşımı — TMDB id attach + render).
- Yazıyor göstergesi (Broadcast channel).
- Oyun entegrasyonu — `gorevler/karakter-oyunu.md`'ye bak.

## Bitince
- `core/durum.md`'de [x] + friendships / messages tablolarını not et.
- commit + push.
