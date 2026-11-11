-- ============================================================================
-- Perdea — Sohbet · Başlık/Entry · Akış
-- Supabase SQL Editor'e yapıştırıp BİR KEZ çalıştır (tekrar çalıştırmak güvenli).
-- Önkoşul: docs/schema.sql (users) ve
--          2026-11-11_salon_cosplay_oyun.sql (perdea_sade, sikayetler).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0a) EŞLEŞME KARARLARI — Beğen/Geç (docs/schema.sql'deki "matches" bölümü).
--     Daha önce çalıştırılmadıysa burada kurulur; çalıştırıldıysa dokunulmaz.
-- ----------------------------------------------------------------------------

create table if not exists matches (
  user_id uuid references users(id) on delete cascade not null,
  aday_id uuid references users(id) on delete cascade not null,
  karar text not null check (karar in ('begen','gec')),
  created_at timestamptz default now(),
  primary key (user_id, aday_id),
  check (user_id <> aday_id)
);
create index if not exists matches_user_karar_idx on matches (user_id, karar);

alter table matches enable row level security;

drop policy if exists "kişi kendi kararlarını okur" on matches;
create policy "kişi kendi kararlarını okur"
on matches for select
using (auth.uid() = user_id);

drop policy if exists "kişi kendi kararını ekler" on matches;
create policy "kişi kendi kararını ekler"
on matches for insert
with check (auth.uid() = user_id);

drop policy if exists "kişi kendi kararını günceller" on matches;
create policy "kişi kendi kararını günceller"
on matches for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

-- ----------------------------------------------------------------------------
-- 0) ENGEL — bir kullanıcı diğerini engelleyebilir (mesajlaşmayı keser)
-- ----------------------------------------------------------------------------

create table if not exists engeller (
  engelleyen_id uuid not null references users(id) on delete cascade,
  engellenen_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (engelleyen_id, engellenen_id),
  check (engelleyen_id <> engellenen_id)
);

alter table engeller enable row level security;

drop policy if exists "kişi kendi engellerini görür" on engeller;
create policy "kişi kendi engellerini görür"
on engeller for select to authenticated
using (auth.uid() = engelleyen_id);

drop policy if exists "kişi engel ekler" on engeller;
create policy "kişi engel ekler"
on engeller for insert to authenticated
with check (auth.uid() = engelleyen_id);

drop policy if exists "kişi engelini kaldırır" on engeller;
create policy "kişi engelini kaldırır"
on engeller for delete to authenticated
using (auth.uid() = engelleyen_id);

revoke all on engeller from anon, authenticated;
grant select, insert, delete on engeller to authenticated;

-- İki kişi arasında (hangi yönde olursa olsun) engel var mı?
create or replace function _engel_var(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from engeller
    where (engelleyen_id = a and engellenen_id = b)
       or (engelleyen_id = b and engellenen_id = a)
  );
$$;
revoke all on function _engel_var(uuid, uuid) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 1) SOHBET — yalnızca karşılıklı eşleşenler arasında birebir mesajlaşma
--    Tablolara doğrudan yazılmaz; her şey aşağıdaki fonksiyonlarla.
-- ----------------------------------------------------------------------------

create table if not exists sohbetler (
  id uuid primary key default gen_random_uuid(),
  a_id uuid not null references users(id) on delete cascade,
  b_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  son_mesaj_at timestamptz,
  a_okudu timestamptz not null default now(),
  b_okudu timestamptz not null default now(),
  check (a_id < b_id),
  unique (a_id, b_id)
);
create index if not exists sohbetler_b_idx on sohbetler (b_id);

create table if not exists mesajlar (
  id bigint generated always as identity primary key,
  sohbet_id uuid not null references sohbetler(id) on delete cascade,
  gonderen_id uuid not null references users(id) on delete cascade,
  icerik text not null check (length(trim(icerik)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists mesajlar_sohbet_idx on mesajlar (sohbet_id, id desc);
create index if not exists mesajlar_gonderen_idx on mesajlar (gonderen_id, created_at desc);

alter table sohbetler enable row level security;
alter table mesajlar enable row level security;

drop policy if exists "taraflar sohbeti görür" on sohbetler;
create policy "taraflar sohbeti görür"
on sohbetler for select to authenticated
using (auth.uid() in (a_id, b_id));

drop policy if exists "taraflar mesajları görür" on mesajlar;
create policy "taraflar mesajları görür"
on mesajlar for select to authenticated
using (
  exists (
    select 1 from sohbetler s
    where s.id = mesajlar.sohbet_id and auth.uid() in (s.a_id, s.b_id)
  )
);

revoke all on sohbetler, mesajlar from anon, authenticated;
grant select on sohbetler, mesajlar to authenticated;

-- Karşılıklı beğeni var mı?
create or replace function _karsilikli(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from matches where user_id = a and aday_id = b and karar = 'begen')
     and exists (select 1 from matches where user_id = b and aday_id = a and karar = 'begen');
$$;
revoke all on function _karsilikli(uuid, uuid) from public, anon, authenticated;

-- Sohbeti aç (varsa onu döndürür). Yalnızca karşılıklı eşleşenler.
create or replace function sohbet_ac(p_diger uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ben uuid := auth.uid();
  v_a uuid;
  v_b uuid;
  v_id uuid;
begin
  if v_ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if p_diger is null or p_diger = v_ben then raise exception 'PERDEA:YETKI_YOK'; end if;
  if not _karsilikli(v_ben, p_diger) then raise exception 'PERDEA:ESLESME_YOK'; end if;
  if _engel_var(v_ben, p_diger) then raise exception 'PERDEA:ENGELLI'; end if;

  v_a := least(v_ben, p_diger);
  v_b := greatest(v_ben, p_diger);

  insert into sohbetler (a_id, b_id) values (v_a, v_b)
  on conflict (a_id, b_id) do nothing;

  select id into v_id from sohbetler where a_id = v_a and b_id = v_b;
  return v_id;
end $$;

-- Mesaj gönder.
create or replace function mesaj_gonder(p_sohbet uuid, p_icerik text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ben uuid := auth.uid();
  v_s sohbetler;
  v_diger uuid;
  v_metin text := trim(coalesce(p_icerik, ''));
  v_id bigint;
begin
  if v_ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if length(v_metin) < 1 or length(v_metin) > 1000 then raise exception 'PERDEA:METIN_UZUN'; end if;

  select * into v_s from sohbetler where id = p_sohbet;
  if not found or v_ben not in (v_s.a_id, v_s.b_id) then raise exception 'PERDEA:SOHBET_YOK'; end if;

  v_diger := case when v_s.a_id = v_ben then v_s.b_id else v_s.a_id end;
  if _engel_var(v_ben, v_diger) then raise exception 'PERDEA:ENGELLI'; end if;

  -- Basit hız sınırı: dakikada en çok 30 mesaj.
  if (select count(*) from mesajlar
      where gonderen_id = v_ben and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'PERDEA:COK_HIZLI';
  end if;

  insert into mesajlar (sohbet_id, gonderen_id, icerik)
  values (p_sohbet, v_ben, v_metin)
  returning id into v_id;

  update sohbetler
  set son_mesaj_at = now(),
      a_okudu = case when a_id = v_ben then now() else a_okudu end,
      b_okudu = case when b_id = v_ben then now() else b_okudu end
  where id = p_sohbet;

  return v_id;
end $$;

-- Sohbeti okundu say.
create or replace function sohbet_okundu(p_sohbet uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ben uuid := auth.uid();
begin
  if v_ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  update sohbetler
  set a_okudu = case when a_id = v_ben then now() else a_okudu end,
      b_okudu = case when b_id = v_ben then now() else b_okudu end
  where id = p_sohbet and v_ben in (a_id, b_id);
end $$;

-- Sohbet listem: karşı taraf, son mesaj, okunmamış sayısı.
create or replace function sohbetlerim()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(x order by x.sira desc), '[]'::jsonb)
  from (
    select
      s.id,
      coalesce(s.son_mesaj_at, s.created_at) as sira,
      jsonb_build_object(
        'id', u.id, 'username', u.username,
        'display_name', u.display_name, 'avatar_url', u.avatar_url
      ) as diger,
      (select jsonb_build_object('icerik', m.icerik, 'benden', m.gonderen_id = auth.uid(), 'created_at', m.created_at)
         from mesajlar m where m.sohbet_id = s.id order by m.id desc limit 1) as son_mesaj,
      (select count(*) from mesajlar m
        where m.sohbet_id = s.id
          and m.gonderen_id <> auth.uid()
          and m.created_at > case when s.a_id = auth.uid() then s.a_okudu else s.b_okudu end
      ) as okunmamis,
      _engel_var(s.a_id, s.b_id) as engelli
    from sohbetler s
    join users u on u.id = case when s.a_id = auth.uid() then s.b_id else s.a_id end
    where auth.uid() in (s.a_id, s.b_id)
  ) x;
$$;

-- Toplam okunmamış mesaj (üst menüdeki rozet için).
create or replace function okunmamis_sayisi()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*), 0)::integer
  from mesajlar m
  join sohbetler s on s.id = m.sohbet_id
  where auth.uid() in (s.a_id, s.b_id)
    and m.gonderen_id <> auth.uid()
    and m.created_at > case when s.a_id = auth.uid() then s.a_okudu else s.b_okudu end;
$$;

-- Karşılıklı eşleştiğim ama henüz sohbet açmadığım kişiler.
create or replace function eslesmelerim()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id, 'username', u.username,
    'display_name', u.display_name, 'avatar_url', u.avatar_url
  ) order by m1.created_at desc), '[]'::jsonb)
  from matches m1
  join matches m2 on m2.user_id = m1.aday_id and m2.aday_id = m1.user_id and m2.karar = 'begen'
  join users u on u.id = m1.aday_id
  where m1.user_id = auth.uid()
    and m1.karar = 'begen'
    and not _engel_var(m1.user_id, m1.aday_id)
    and not exists (
      select 1 from sohbetler s
      where s.a_id = least(m1.user_id, m1.aday_id) and s.b_id = greatest(m1.user_id, m1.aday_id)
    );
$$;

revoke all on function sohbet_ac(uuid), mesaj_gonder(uuid, text), sohbet_okundu(uuid),
  sohbetlerim(), okunmamis_sayisi(), eslesmelerim() from public, anon;
grant execute on function sohbet_ac(uuid), mesaj_gonder(uuid, text), sohbet_okundu(uuid),
  sohbetlerim(), okunmamis_sayisi(), eslesmelerim() to authenticated;

-- Canlı mesaj için Realtime (yoksa uygulama yoklayarak çalışır).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mesajlar'
     ) then
    alter publication supabase_realtime add table mesajlar;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2) BAŞLIK + ENTRY — bir konu, altına herkesin yazdığı kısa yazılar
-- ----------------------------------------------------------------------------

create or replace function perdea_slug(t text)
returns text
language sql
immutable
as $$
  select left(replace(perdea_sade(t), ' ', '-'), 80);
$$;

create table if not exists basliklar (
  id uuid primary key default gen_random_uuid(),
  baslik text not null check (length(trim(baslik)) between 3 and 80),
  slug text not null unique check (length(slug) between 1 and 80),
  olusturan_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  son_entry_at timestamptz not null default now()
);
create index if not exists basliklar_son_idx on basliklar (son_entry_at desc);

create table if not exists entryler (
  id uuid primary key default gen_random_uuid(),
  baslik_id uuid not null references basliklar(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  icerik text not null check (length(trim(icerik)) between 2 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists entryler_baslik_idx on entryler (baslik_id, created_at);
create index if not exists entryler_user_idx on entryler (user_id, created_at desc);

create table if not exists entry_begeni (
  entry_id uuid not null references entryler(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

alter table basliklar enable row level security;
alter table entryler enable row level security;
alter table entry_begeni enable row level security;

drop policy if exists "başlıklar herkese açık" on basliklar;
create policy "başlıklar herkese açık" on basliklar for select using (true);

drop policy if exists "entryler herkese açık" on entryler;
create policy "entryler herkese açık" on entryler for select using (true);

drop policy if exists "kişi kendi adına entry yazar" on entryler;
create policy "kişi kendi adına entry yazar"
on entryler for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kişi kendi entrysini siler" on entryler;
create policy "kişi kendi entrysini siler"
on entryler for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "beğeniler herkese açık" on entry_begeni;
create policy "beğeniler herkese açık" on entry_begeni for select using (true);

drop policy if exists "kişi kendi adına beğenir" on entry_begeni;
create policy "kişi kendi adına beğenir"
on entry_begeni for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kişi beğenisini geri alır" on entry_begeni;
create policy "kişi beğenisini geri alır"
on entry_begeni for delete to authenticated
using (auth.uid() = user_id);

revoke all on basliklar, entryler, entry_begeni from anon, authenticated;
grant select on basliklar, entryler, entry_begeni to anon, authenticated;
grant insert, delete on entryler, entry_begeni to authenticated;

-- Entry yazılınca: hız sınırı + başlığın "son entry" zamanını güncelle.
create or replace function _entry_eklendi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from entryler
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'PERDEA:COK_HIZLI';
  end if;
  update basliklar set son_entry_at = now() where id = new.baslik_id;
  return new;
end $$;

drop trigger if exists entry_eklendi on entryler;
create trigger entry_eklendi
before insert on entryler
for each row execute function _entry_eklendi();

-- Başlık aç + ilk entry'yi yaz. Aynı başlık zaten varsa entry oraya eklenir.
create or replace function baslik_ac(p_baslik text, p_entry text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ben uuid := auth.uid();
  v_ad text := regexp_replace(trim(coalesce(p_baslik, '')), '\s+', ' ', 'g');
  v_metin text := trim(coalesce(p_entry, ''));
  v_slug text;
  v_id uuid;
begin
  if v_ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if length(v_ad) < 3 or length(v_ad) > 80 then raise exception 'PERDEA:BASLIK_GECERSIZ'; end if;
  if length(v_metin) < 2 or length(v_metin) > 2000 then raise exception 'PERDEA:METIN_UZUN'; end if;

  v_slug := perdea_slug(v_ad);
  if length(v_slug) < 1 then raise exception 'PERDEA:BASLIK_GECERSIZ'; end if;

  insert into basliklar (baslik, slug, olusturan_id)
  values (lower(v_ad), v_slug, v_ben)
  on conflict (slug) do nothing;

  select id into v_id from basliklar where slug = v_slug;

  insert into entryler (baslik_id, user_id, icerik) values (v_id, v_ben, v_metin);
  return v_slug;
end $$;

revoke all on function baslik_ac(text, text) from public, anon;
grant execute on function baslik_ac(text, text) to authenticated;
revoke all on function _entry_eklendi() from public, anon, authenticated;

drop view if exists baslik_ozet;
create view baslik_ozet
with (security_invoker = true) as
select
  b.id, b.baslik, b.slug, b.created_at, b.son_entry_at,
  (select count(*) from entryler e where e.baslik_id = b.id)::integer as entry_sayisi,
  (select count(*) from entryler e
    where e.baslik_id = b.id and e.created_at > now() - interval '24 hours')::integer as bugun
from basliklar b;

drop view if exists entry_ozet;
create view entry_ozet
with (security_invoker = true) as
select
  e.id, e.baslik_id, e.user_id, e.icerik, e.created_at,
  u.username, u.display_name, u.avatar_url,
  b.baslik, b.slug,
  (select count(*) from entry_begeni g where g.entry_id = e.id)::integer as begeni_sayisi
from entryler e
join users u on u.id = e.user_id
join basliklar b on b.id = e.baslik_id;

grant select on baslik_ozet, entry_ozet to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3) AKIŞ — kısa gönderiler
-- ----------------------------------------------------------------------------

create table if not exists gonderiler (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  icerik text not null check (length(trim(icerik)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists gonderiler_zaman_idx on gonderiler (created_at desc);
create index if not exists gonderiler_user_idx on gonderiler (user_id, created_at desc);

create table if not exists gonderi_begeni (
  gonderi_id uuid not null references gonderiler(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (gonderi_id, user_id)
);

alter table gonderiler enable row level security;
alter table gonderi_begeni enable row level security;

drop policy if exists "gönderiler herkese açık" on gonderiler;
create policy "gönderiler herkese açık" on gonderiler for select using (true);

drop policy if exists "kişi kendi adına gönderi yazar" on gonderiler;
create policy "kişi kendi adına gönderi yazar"
on gonderiler for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kişi kendi gönderisini siler" on gonderiler;
create policy "kişi kendi gönderisini siler"
on gonderiler for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "gönderi beğenileri herkese açık" on gonderi_begeni;
create policy "gönderi beğenileri herkese açık" on gonderi_begeni for select using (true);

drop policy if exists "kişi kendi adına gönderi beğenir" on gonderi_begeni;
create policy "kişi kendi adına gönderi beğenir"
on gonderi_begeni for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kişi gönderi beğenisini geri alır" on gonderi_begeni;
create policy "kişi gönderi beğenisini geri alır"
on gonderi_begeni for delete to authenticated
using (auth.uid() = user_id);

revoke all on gonderiler, gonderi_begeni from anon, authenticated;
grant select on gonderiler, gonderi_begeni to anon, authenticated;
grant insert, delete on gonderiler, gonderi_begeni to authenticated;

create or replace function _gonderi_eklendi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from gonderiler
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'PERDEA:COK_HIZLI';
  end if;
  return new;
end $$;

drop trigger if exists gonderi_eklendi on gonderiler;
create trigger gonderi_eklendi
before insert on gonderiler
for each row execute function _gonderi_eklendi();
revoke all on function _gonderi_eklendi() from public, anon, authenticated;

drop view if exists gonderi_ozet;
create view gonderi_ozet
with (security_invoker = true) as
select
  g.id, g.user_id, g.icerik, g.created_at,
  u.username, u.display_name, u.avatar_url,
  (select count(*) from gonderi_begeni b where b.gonderi_id = g.id)::integer as begeni_sayisi
from gonderiler g
join users u on u.id = g.user_id;

grant select on gonderi_ozet to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4) ŞİKAYET — yeni içerik türleri
-- ----------------------------------------------------------------------------

alter table sikayetler drop constraint if exists sikayetler_hedef_tur_check;
alter table sikayetler add constraint sikayetler_hedef_tur_check
  check (hedef_tur in ('bulusma', 'salon', 'salon_yorumu', 'oda', 'kullanici', 'entry', 'gonderi', 'sohbet'));
