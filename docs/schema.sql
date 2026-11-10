-- Perdea şeması — Modül 3
-- İnternet gelince Supabase SQL editörüne yapıştırılacak.
-- NOT: users.id, Supabase'de auth.users'a bağlanacak (yarın rötuş).

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  movie_id integer not null,
  created_at timestamptz default now(),
  unique (user_id, movie_id)
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  movie_id integer not null,
  score integer not null check (score >= 1 and score <= 10),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, movie_id)
);

alter table users enable row level security;
alter table favorites enable row level security;
alter table ratings enable row level security;

/*Kullanıcılar*/
create policy "kullanıcılar herkese açık okunur"
on users for select
using (true);

create policy "kullanıcılar kendi profillerini oluşturur"
on users for insert
with check (auth.uid() = id);

create policy "kişi kendi profilini günceller"
on users for update
using (auth.uid() = id)
with check (auth.uid() = id);


/*favoriler*/
create policy "favoriler herkese açık okunur"
on favorites for select
using (true);


create policy "kişi kendi adına favori ekler"
on favorites for insert
with check (auth.uid() = user_id);


create policy "kişi kendi favorisini siler"
on favorites for delete
using (auth.uid() = user_id);

/*ratingler*/
create policy "ratingler herkese açık okunur"
on ratings for select
using (true);

create policy "kişi kendi ratingini girer"
on ratings for insert
with check (auth.uid() = user_id);

create policy "kişi kendi ratingini günceller"
on ratings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "kişi kendi ratingini siler"
on ratings for delete
using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- Modül 4+ ek: matches — Beğen/Geç kararları, karşılıklı eşleşme
-- ------------------------------------------------------------
create table matches (
  user_id uuid references users(id) on delete cascade not null,
  aday_id uuid references users(id) on delete cascade not null,
  karar text not null check (karar in ('begen','gec')),
  created_at timestamptz default now(),
  primary key (user_id, aday_id),
  check (user_id <> aday_id)
);
create index on matches (user_id, karar);

alter table matches enable row level security;

create policy "kişi kendi kararlarını okur"
on matches for select
using (auth.uid() = user_id);

create policy "kişi kendi kararını ekler"
on matches for insert
with check (auth.uid() = user_id);

create policy "kişi kendi kararını günceller"
on matches for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Karşılıklı eşleşme kontrolü. Security definer — tek yönlü karar
-- okumayı önler, sadece "karşıdaki beni beğendi mi?" sorusunu boolean cevaplar.
create or replace function karsilikli_eslesme(aday uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from matches
    where user_id = aday
      and aday_id = auth.uid()
      and karar = 'begen'
  );
$$;

revoke all on function karsilikli_eslesme(uuid) from public;
grant execute on function karsilikli_eslesme(uuid) to authenticated;