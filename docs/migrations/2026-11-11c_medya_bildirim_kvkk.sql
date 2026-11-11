-- ============================================================================
-- Perdea — Sohbette görsel/ses · Bildirimler · KVKK onayı · Hesap silme
-- Supabase SQL Editor'e yapıştırıp BİR KEZ çalıştır (tekrar çalıştırmak güvenli).
-- Önkoşul: 2026-11-11_salon_cosplay_oyun.sql ve 2026-11-11b_sohbet_baslik_akis.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) SOHBET MEDYASI — görsel ve sesli mesaj
--    Dosyalar Supabase Storage'da ÖZEL bir kovada durur. Yol biçimi:
--      <sohbet_id>/<gönderen_id>/<dosya>
--    Yalnızca o sohbetin iki tarafı okuyabilir; yalnızca kendi klasörüne yükler.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sohbet-medya', 'sohbet-medya', false, 6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Yolun ilk parçasındaki sohbetin tarafı mıyım?
create or replace function _sohbet_tarafi(p_yol text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ilk text := split_part(p_yol, '/', 1);
begin
  if v_ilk !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return exists (
    select 1 from sohbetler s
    where s.id = v_ilk::uuid and auth.uid() in (s.a_id, s.b_id)
  );
end $$;
revoke all on function _sohbet_tarafi(text) from public, anon;
grant execute on function _sohbet_tarafi(text) to authenticated;

drop policy if exists "sohbet medyasını taraflar okur" on storage.objects;
create policy "sohbet medyasını taraflar okur"
on storage.objects for select to authenticated
using (bucket_id = 'sohbet-medya' and public._sohbet_tarafi(name));

drop policy if exists "sohbet medyasını taraf yükler" on storage.objects;
create policy "sohbet medyasını taraf yükler"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'sohbet-medya'
  and public._sohbet_tarafi(name)
  and split_part(name, '/', 2) = auth.uid()::text
);

-- Mesaj türü + medya yolu
alter table mesajlar add column if not exists tur text not null default 'metin';
alter table mesajlar add column if not exists medya_yolu text;
alter table mesajlar add column if not exists sure_sn integer;

alter table mesajlar drop constraint if exists mesajlar_icerik_check;
alter table mesajlar drop constraint if exists mesajlar_tur_check;
alter table mesajlar add constraint mesajlar_tur_check check (
  (tur = 'metin' and medya_yolu is null and length(trim(icerik)) between 1 and 1000)
  or (tur in ('gorsel', 'ses') and medya_yolu is not null and length(icerik) <= 1000)
);
alter table mesajlar drop constraint if exists mesajlar_sure_check;
alter table mesajlar add constraint mesajlar_sure_check check (sure_sn is null or sure_sn between 1 and 180);

-- Görsel ya da sesli mesaj gönder (dosya önce Storage'a yüklenmiş olmalı).
create or replace function medya_mesaji_gonder(p_sohbet uuid, p_tur text, p_yol text, p_sure integer default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ben uuid := auth.uid();
  v_s sohbetler;
  v_diger uuid;
  v_id bigint;
begin
  if v_ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if p_tur not in ('gorsel', 'ses') then raise exception 'PERDEA:MEDYA_GECERSIZ'; end if;

  select * into v_s from sohbetler where id = p_sohbet;
  if not found or v_ben not in (v_s.a_id, v_s.b_id) then raise exception 'PERDEA:SOHBET_YOK'; end if;

  -- Yol bu sohbetin ve bu kullanıcının klasöründe olmalı; "../" gibi oyunlar yok.
  if p_yol is null
     or length(p_yol) > 200
     or p_yol !~ ('^' || p_sohbet::text || '/' || v_ben::text || '/[A-Za-z0-9_-]+\.[a-z0-9]{2,5}$') then
    raise exception 'PERDEA:MEDYA_GECERSIZ';
  end if;

  v_diger := case when v_s.a_id = v_ben then v_s.b_id else v_s.a_id end;
  if _engel_var(v_ben, v_diger) then raise exception 'PERDEA:ENGELLI'; end if;

  if (select count(*) from mesajlar
      where gonderen_id = v_ben and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'PERDEA:COK_HIZLI';
  end if;

  insert into mesajlar (sohbet_id, gonderen_id, icerik, tur, medya_yolu, sure_sn)
  values (p_sohbet, v_ben, '', p_tur, p_yol,
          case when p_tur = 'ses' then least(greatest(coalesce(p_sure, 1), 1), 180) end)
  returning id into v_id;

  update sohbetler
  set son_mesaj_at = now(),
      a_okudu = case when a_id = v_ben then now() else a_okudu end,
      b_okudu = case when b_id = v_ben then now() else b_okudu end
  where id = p_sohbet;

  return v_id;
end $$;

revoke all on function medya_mesaji_gonder(uuid, text, text, integer) from public, anon;
grant execute on function medya_mesaji_gonder(uuid, text, text, integer) to authenticated;

-- Sohbet listesi: son mesajın türü de gelsin ("Fotoğraf", "Sesli mesaj" yazabilmek için).
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
      (select jsonb_build_object('icerik', m.icerik, 'tur', m.tur, 'benden', m.gonderen_id = auth.uid(), 'created_at', m.created_at)
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

-- ----------------------------------------------------------------------------
-- 2) BİLDİRİMLER — eşleşme, beğeni, başlığına yazılan entry, buluşmana katılan
--    Satırları yalnızca veritabanı tetikleyicileri yazar.
-- ----------------------------------------------------------------------------

create table if not exists bildirimler (
  id bigint generated always as identity primary key,
  user_id uuid not null references users(id) on delete cascade,
  tur text not null check (tur in ('eslesme', 'entry_begeni', 'gonderi_begeni', 'baslik_entry', 'bulusma_katilim')),
  aktor_id uuid references users(id) on delete cascade,
  baglanti text not null check (length(baglanti) <= 200),
  ozet text check (ozet is null or length(ozet) <= 160),
  okundu boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists bildirimler_user_idx on bildirimler (user_id, id desc);

alter table bildirimler enable row level security;

drop policy if exists "kişi kendi bildirimlerini görür" on bildirimler;
create policy "kişi kendi bildirimlerini görür"
on bildirimler for select to authenticated
using (auth.uid() = user_id);

revoke all on bildirimler from anon, authenticated;
grant select on bildirimler to authenticated;

create or replace function _bildir(p_kime uuid, p_tur text, p_aktor uuid, p_baglanti text, p_ozet text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kime is null or p_kime = p_aktor then return; end if;
  -- Aynı kişi aynı şeyi 1 saat içinde tekrar ederse (beğen-geri al-beğen) yeniden bildirme.
  if exists (
    select 1 from bildirimler
    where user_id = p_kime and tur = p_tur and aktor_id is not distinct from p_aktor
      and baglanti = p_baglanti and created_at > now() - interval '1 hour'
  ) then return; end if;
  insert into bildirimler (user_id, tur, aktor_id, baglanti, ozet)
  values (p_kime, p_tur, p_aktor, p_baglanti, left(p_ozet, 160));
  -- Kişi başına son 200 bildirim kalsın.
  delete from bildirimler
  where user_id = p_kime
    and id < (select min(id) from (select id from bildirimler where user_id = p_kime order by id desc limit 200) t);
end $$;
revoke all on function _bildir(uuid, text, uuid, text, text) from public, anon, authenticated;

-- Karşılıklı eşleşme → iki tarafa da
create or replace function _matches_bildir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.karar = 'begen'
     and (tg_op = 'INSERT' or old.karar is distinct from 'begen')
     and exists (select 1 from matches where user_id = new.aday_id and aday_id = new.user_id and karar = 'begen') then
    perform _bildir(new.aday_id, 'eslesme', new.user_id, '/sohbet', null);
    perform _bildir(new.user_id, 'eslesme', new.aday_id, '/sohbet', null);
  end if;
  return new;
end $$;
drop trigger if exists matches_bildir on matches;
create trigger matches_bildir after insert or update on matches
for each row execute function _matches_bildir();

create or replace function _entry_begeni_bildir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v record;
begin
  select e.user_id, b.slug, b.baslik into v
  from entryler e join basliklar b on b.id = e.baslik_id where e.id = new.entry_id;
  if found then
    perform _bildir(v.user_id, 'entry_begeni', new.user_id, '/baslik/' || v.slug || '#e-' || new.entry_id, v.baslik);
  end if;
  return new;
end $$;
drop trigger if exists entry_begeni_bildir on entry_begeni;
create trigger entry_begeni_bildir after insert on entry_begeni
for each row execute function _entry_begeni_bildir();

create or replace function _gonderi_begeni_bildir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v record;
begin
  select g.user_id, g.icerik into v from gonderiler g where g.id = new.gonderi_id;
  if found then
    perform _bildir(v.user_id, 'gonderi_begeni', new.user_id, '/topluluk', v.icerik);
  end if;
  return new;
end $$;
drop trigger if exists gonderi_begeni_bildir on gonderi_begeni;
create trigger gonderi_begeni_bildir after insert on gonderi_begeni
for each row execute function _gonderi_begeni_bildir();

create or replace function _baslik_entry_bildir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v record;
begin
  select b.olusturan_id, b.slug, b.baslik into v from basliklar b where b.id = new.baslik_id;
  if found then
    perform _bildir(v.olusturan_id, 'baslik_entry', new.user_id, '/baslik/' || v.slug || '#e-' || new.id, v.baslik);
  end if;
  return new;
end $$;
drop trigger if exists baslik_entry_bildir on entryler;
create trigger baslik_entry_bildir after insert on entryler
for each row execute function _baslik_entry_bildir();

create or replace function _bulusma_katilim_bildir()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v record;
begin
  select b.duzenleyen_id, b.baslik into v from bulusmalar b where b.id = new.bulusma_id;
  if found then
    perform _bildir(v.duzenleyen_id, 'bulusma_katilim', new.user_id, '/cosplay/' || new.bulusma_id, v.baslik);
  end if;
  return new;
end $$;
drop trigger if exists bulusma_katilim_bildir on bulusma_katilimcilari;
create trigger bulusma_katilim_bildir after insert on bulusma_katilimcilari
for each row execute function _bulusma_katilim_bildir();

revoke all on function _matches_bildir(), _entry_begeni_bildir(), _gonderi_begeni_bildir(),
  _baslik_entry_bildir(), _bulusma_katilim_bildir() from public, anon, authenticated;

-- Üst menü için tek çağrı: okunmamış mesaj + okunmamış bildirim.
create or replace function bildirim_ozeti()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'mesaj', okunmamis_sayisi(),
    'bildirim', (select count(*) from bildirimler where user_id = auth.uid() and not okundu)
  );
$$;

-- Bildirim listesi (aktörün adıyla birlikte).
create or replace function bildirimlerim(p_limit integer default 50)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(x order by x.id desc), '[]'::jsonb)
  from (
    select b.id, b.tur, b.baglanti, b.ozet, b.okundu, b.created_at,
           case when u.id is null then null else jsonb_build_object(
             'username', u.username, 'display_name', u.display_name, 'avatar_url', u.avatar_url
           ) end as aktor
    from bildirimler b
    left join users u on u.id = b.aktor_id
    where b.user_id = auth.uid()
    order by b.id desc
    limit least(greatest(p_limit, 1), 100)
  ) x;
$$;

create or replace function bildirimleri_okundu_say()
returns void
language sql
security definer
set search_path = public
as $$
  update bildirimler set okundu = true where user_id = auth.uid() and not okundu;
$$;

revoke all on function bildirim_ozeti(), bildirimlerim(integer), bildirimleri_okundu_say() from public, anon;
grant execute on function bildirim_ozeti(), bildirimlerim(integer), bildirimleri_okundu_say() to authenticated;

-- ----------------------------------------------------------------------------
-- 3) KVKK — kayıt sırasındaki onayın zamanı + hesabını silme hakkı
-- ----------------------------------------------------------------------------

alter table users add column if not exists kvkk_onay_at timestamptz;

-- Hesabımı ve bana ait her şeyi sil. auth.users satırı silinince users ve ona
-- bağlı tüm tablolar (on delete cascade) birlikte gider.
create or replace function hesabimi_sil()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ben uuid := auth.uid();
begin
  if v_ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  delete from public.users where id = v_ben;
  delete from auth.users where id = v_ben;
end $$;

revoke all on function hesabimi_sil() from public, anon;
grant execute on function hesabimi_sil() to authenticated;
