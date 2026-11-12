-- ============================================================================
-- Perdea — Mobil: telefona bildirim (push) · profil fotoğrafı yükleme
-- Supabase SQL Editor'e yapıştırıp BİR KEZ çalıştır (tekrar çalıştırmak güvenli).
-- Önkoşul: 2026-11-11_salon_cosplay_oyun, 11b ve 11c dosyaları (bu sırayla).
--
-- Push nasıl çalışıyor: uygulama telefonun Expo bildirim adresini (token)
-- "cihazlar" tablosuna kaydeder. Yeni bildirim ya da mesaj satırı eklenince
-- veritabanı tetikleyicisi pg_net ile Expo'nun push servisine istek atar.
-- Ek sunucu, Edge Function ya da gizli anahtar gerekmez.
-- ============================================================================

-- pg_net: veritabanından HTTP isteği atmak için (Supabase'de hazır gelir).
do $$
begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net kurulamadı (%). Push gönderimi kapalı kalır, uygulama çalışmaya devam eder.', sqlerrm;
end $$;

-- ----------------------------------------------------------------------------
-- 1) CİHAZLAR — kullanıcının telefonlarının push adresleri
-- ----------------------------------------------------------------------------

-- Eski taslak imzalar (varsa) — parametre adları değişti.
drop function if exists cihaz_kaydet(text, text);
drop function if exists cihaz_sil(text);
drop function if exists _push_gonder(uuid, text, text, text);

create table if not exists cihazlar (
  token text primary key check (token ~ '^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$'),
  user_id uuid not null references users(id) on delete cascade,
  platform text check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);
create index if not exists cihazlar_user_idx on cihazlar (user_id);

alter table cihazlar enable row level security;

drop policy if exists "kişi kendi cihazlarını görür" on cihazlar;
create policy "kişi kendi cihazlarını görür"
on cihazlar for select to authenticated
using (auth.uid() = user_id);

revoke all on cihazlar from anon, authenticated;
grant select on cihazlar to authenticated;

-- Cihazı bana kaydet. Aynı telefon başka hesaptan açılmışsa o hesaptan alınır
-- (bir telefona yalnızca son giriş yapan kişinin bildirimi gider).
create or replace function cihaz_kaydet(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  insert into cihazlar (token, user_id, platform, updated_at)
  values (p_token, auth.uid(), case when p_platform in ('ios', 'android') then p_platform end, now())
  on conflict (token) do update
  set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end $$;

-- Çıkış yaparken bu telefonu hesaptan düşür.
create or replace function cihaz_sil(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from cihazlar where token = p_token and user_id = auth.uid();
$$;

revoke all on function cihaz_kaydet(text, text), cihaz_sil(text) from public, anon;
grant execute on function cihaz_kaydet(text, text), cihaz_sil(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 2) GÖNDERİM — bir kişinin tüm cihazlarına Expo push isteği
-- ----------------------------------------------------------------------------

create or replace function _push_gonder(p_kime uuid, p_baslik text, p_govde text, p_veri jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mesajlar jsonb;
begin
  if p_kime is null or to_regnamespace('net') is null then return; end if;

  select jsonb_agg(jsonb_build_object(
    'to', c.token,
    'title', left(p_baslik, 80),
    'body', left(p_govde, 160),
    'data', coalesce(p_veri, '{}'::jsonb),
    'sound', 'default',
    'priority', 'high',
    'channelId', 'varsayilan'
  ))
  into v_mesajlar
  from cihazlar c
  where c.user_id = p_kime;

  if v_mesajlar is null then return; end if;

  -- Dinamik çağrı: pg_net yoksa bu fonksiyon yine de oluşturulabilsin.
  execute 'select net.http_post(url := $1, body := $2, headers := $3)'
  using 'https://exp.host/--/api/v2/push/send',
        v_mesajlar,
        '{"Content-Type": "application/json", "Accept": "application/json"}'::jsonb;
exception when others then
  -- Push hiçbir zaman asıl işlemi (mesaj, beğeni…) bozmasın.
  raise warning 'push gönderilemedi: %', sqlerrm;
end $$;
revoke all on function _push_gonder(uuid, text, text, jsonb) from public, anon, authenticated;

-- Bildirim satırı eklenince → push
create or replace function _bildirim_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ad text;
  v_metin text;
begin
  select coalesce(nullif(display_name, ''), username, 'Biri') into v_ad from users where id = new.aktor_id;
  v_ad := coalesce(v_ad, 'Biri');
  v_metin := case new.tur
    when 'eslesme' then v_ad || ' ile eşleştiniz. İlk mesajı sen yaz.'
    when 'entry_begeni' then v_ad || ' entry''ni beğendi.'
    when 'gonderi_begeni' then v_ad || ' gönderini beğendi.'
    when 'baslik_entry' then v_ad || ' açtığın başlığa yazdı.'
    when 'bulusma_katilim' then v_ad || ' buluşmana katılıyor.'
    else 'Yeni bir bildirimin var.'
  end;
  perform _push_gonder(
    new.user_id,
    case when new.tur = 'eslesme' then 'Yeni eşleşme' else 'Perdea' end,
    v_metin || coalesce(' · ' || new.ozet, ''),
    jsonb_build_object('yol', new.baglanti)
  );
  return new;
end $$;
drop trigger if exists bildirim_push on bildirimler;
create trigger bildirim_push after insert on bildirimler
for each row execute function _bildirim_push();

-- Yeni mesaj → karşı tarafa push
create or replace function _mesaj_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_s sohbetler;
  v_kime uuid;
  v_ad text;
begin
  select * into v_s from sohbetler where id = new.sohbet_id;
  if not found then return new; end if;
  v_kime := case when v_s.a_id = new.gonderen_id then v_s.b_id else v_s.a_id end;
  if _engel_var(new.gonderen_id, v_kime) then return new; end if;

  select coalesce(nullif(display_name, ''), username, 'Perdea') into v_ad from users where id = new.gonderen_id;
  perform _push_gonder(
    v_kime,
    coalesce(v_ad, 'Perdea'),
    case new.tur when 'gorsel' then 'Fotoğraf gönderdi' when 'ses' then 'Sesli mesaj gönderdi' else new.icerik end,
    jsonb_build_object('yol', '/sohbet/' || new.sohbet_id)
  );
  return new;
end $$;
drop trigger if exists mesaj_push on mesajlar;
create trigger mesaj_push after insert on mesajlar
for each row execute function _mesaj_push();

revoke all on function _bildirim_push(), _mesaj_push() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3) PROFİL FOTOĞRAFI — herkese açık kova, herkes yalnızca kendi klasörüne yazar
--    Yol: <user_id>/<dosya>.jpg
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatarlar', 'avatarlar', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar kendi klasörüne yüklenir" on storage.objects;
create policy "avatar kendi klasörüne yüklenir"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatarlar' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "avatar sahibi siler" on storage.objects;
create policy "avatar sahibi siler"
on storage.objects for delete to authenticated
using (bucket_id = 'avatarlar' and split_part(name, '/', 1) = auth.uid()::text);
