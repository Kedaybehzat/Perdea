-- ============================================================================
-- Perdea — Migration 2026-11-11
-- Salon puanlama · Cosplay buluşmaları · Ben Kimim? oyun odaları · Şikayet
--
-- NASIL ÇALIŞTIRILIR: Supabase → SQL Editor → bu dosyanın TAMAMINI yapıştır → Run.
-- Tekrar çalıştırmak güvenli (if not exists / or replace / drop policy if exists).
-- Önkoşul: docs/schema.sql (users tablosu) daha önce çalıştırılmış olmalı.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) Ortak yardımcılar
-- ----------------------------------------------------------------------------

-- Karşılaştırma için metni sadeleştirir: Türkçe harfler → ASCII, küçük harf,
-- noktalama → boşluk. "Kadıköy  REXX!" → "kadikoy rexx"
create or replace function perdea_sade(t text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(
    lower(translate(coalesce(t, ''),
      'ıİşŞğĞüÜöÖçÇâÂîÎûÛ',
      'iIsSgGuUoOcCaAiIuU')),
    '[^a-z0-9]+', ' ', 'g'));
$$;

-- ----------------------------------------------------------------------------
-- 1) SALON PUANLAMA — sinema salonları ve 5 ölçütlü puanlar
-- ----------------------------------------------------------------------------

create table if not exists sinemalar (
  id uuid primary key default gen_random_uuid(),
  ad text not null check (length(trim(ad)) between 2 and 80),
  sehir text not null check (length(trim(sehir)) between 2 and 40),
  ilce text check (ilce is null or length(ilce) <= 40),
  zincir text check (zincir is null or length(zincir) <= 40),
  adres text check (adres is null or length(adres) <= 200),
  ekleyen_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
-- Aynı şehirde aynı isimli salon iki kez eklenemesin (yazım farklarına dayanıklı).
create unique index if not exists sinemalar_ad_sehir_uniq
  on sinemalar (perdea_sade(ad), perdea_sade(sehir));
create index if not exists sinemalar_sehir_idx on sinemalar (perdea_sade(sehir));

create table if not exists sinema_puanlari (
  sinema_id uuid references sinemalar(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  goruntu smallint not null check (goruntu between 1 and 5),   -- perde / projeksiyon
  ses smallint not null check (ses between 1 and 5),
  koltuk smallint not null check (koltuk between 1 and 5),     -- konfor
  temizlik smallint not null check (temizlik between 1 and 5),
  fiyat smallint not null check (fiyat between 1 and 5),       -- fiyat / performans
  yorum text check (yorum is null or length(yorum) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (sinema_id, user_id)
);
create index if not exists sinema_puanlari_user_idx on sinema_puanlari (user_id);

alter table sinemalar enable row level security;
alter table sinema_puanlari enable row level security;

drop policy if exists "salonlar herkese açık okunur" on sinemalar;
create policy "salonlar herkese açık okunur"
on sinemalar for select using (true);

drop policy if exists "giriş yapan salon ekler" on sinemalar;
create policy "giriş yapan salon ekler"
on sinemalar for insert to authenticated
with check (auth.uid() = ekleyen_id);

drop policy if exists "ekleyen salonu düzeltir" on sinemalar;
create policy "ekleyen salonu düzeltir"
on sinemalar for update to authenticated
using (auth.uid() = ekleyen_id)
with check (auth.uid() = ekleyen_id);

drop policy if exists "salon puanları herkese açık okunur" on sinema_puanlari;
create policy "salon puanları herkese açık okunur"
on sinema_puanlari for select using (true);

drop policy if exists "kişi kendi salon puanını girer" on sinema_puanlari;
create policy "kişi kendi salon puanını girer"
on sinema_puanlari for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "kişi kendi salon puanını günceller" on sinema_puanlari;
create policy "kişi kendi salon puanını günceller"
on sinema_puanlari for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "kişi kendi salon puanını siler" on sinema_puanlari;
create policy "kişi kendi salon puanını siler"
on sinema_puanlari for delete to authenticated
using (auth.uid() = user_id);

-- Salon + ortalamalar. security_invoker: RLS çağıranın yetkisiyle uygulanır.
create or replace view sinema_ozet
with (security_invoker = true) as
select
  s.id, s.ad, s.sehir, s.ilce, s.zincir, s.adres, s.ekleyen_id, s.created_at,
  count(p.user_id)::int as puan_sayisi,
  round(avg(p.goruntu), 2)::float8 as goruntu,
  round(avg(p.ses), 2)::float8 as ses,
  round(avg(p.koltuk), 2)::float8 as koltuk,
  round(avg(p.temizlik), 2)::float8 as temizlik,
  round(avg(p.fiyat), 2)::float8 as fiyat,
  round(avg((p.goruntu + p.ses + p.koltuk + p.temizlik + p.fiyat) / 5.0), 2)::float8 as genel
from sinemalar s
left join sinema_puanlari p on p.sinema_id = s.id
group by s.id;

grant select on sinemalar, sinema_puanlari, sinema_ozet to anon, authenticated;
grant insert, update on sinemalar to authenticated;
grant insert, update, delete on sinema_puanlari to authenticated;

-- ----------------------------------------------------------------------------
-- 2) COSPLAY BULUŞMALARI
--    Gerçek hayatta buluşma içerdiği için ilanları yalnızca giriş yapanlar görür.
-- ----------------------------------------------------------------------------

create table if not exists bulusmalar (
  id uuid primary key default gen_random_uuid(),
  duzenleyen_id uuid references users(id) on delete cascade not null,
  baslik text not null check (length(trim(baslik)) between 4 and 90),
  aciklama text check (aciklama is null or length(aciklama) <= 1500),
  tema text check (tema is null or length(tema) <= 80),
  sehir text not null check (length(trim(sehir)) between 2 and 40),
  mekan text not null check (length(trim(mekan)) between 3 and 120),
  zaman timestamptz not null,
  kontenjan integer check (kontenjan is null or kontenjan between 2 and 500),
  durum text not null default 'acik' check (durum in ('acik', 'iptal')),
  created_at timestamptz not null default now()
);
create index if not exists bulusmalar_zaman_idx on bulusmalar (zaman);
create index if not exists bulusmalar_sehir_idx on bulusmalar (perdea_sade(sehir));

create table if not exists bulusma_katilimcilari (
  bulusma_id uuid references bulusmalar(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  karakter text check (karakter is null or length(karakter) <= 60),
  created_at timestamptz not null default now(),
  primary key (bulusma_id, user_id)
);
create index if not exists bulusma_katilimcilari_user_idx on bulusma_katilimcilari (user_id);

alter table bulusmalar enable row level security;
alter table bulusma_katilimcilari enable row level security;

drop policy if exists "buluşmaları giriş yapanlar görür" on bulusmalar;
create policy "buluşmaları giriş yapanlar görür"
on bulusmalar for select to authenticated using (true);

drop policy if exists "giriş yapan buluşma açar" on bulusmalar;
create policy "giriş yapan buluşma açar"
on bulusmalar for insert to authenticated
with check (auth.uid() = duzenleyen_id);

drop policy if exists "düzenleyen buluşmayı günceller" on bulusmalar;
create policy "düzenleyen buluşmayı günceller"
on bulusmalar for update to authenticated
using (auth.uid() = duzenleyen_id)
with check (auth.uid() = duzenleyen_id);

drop policy if exists "düzenleyen buluşmayı siler" on bulusmalar;
create policy "düzenleyen buluşmayı siler"
on bulusmalar for delete to authenticated
using (auth.uid() = duzenleyen_id);

drop policy if exists "katılımcıları giriş yapanlar görür" on bulusma_katilimcilari;
create policy "katılımcıları giriş yapanlar görür"
on bulusma_katilimcilari for select to authenticated using (true);

-- Katılma yalnızca bulusmaya_katil() ile (kontenjan kontrolü atomik olsun diye
-- doğrudan insert policy'si YOK). Ayrılma doğrudan delete ile.
drop policy if exists "kişi kendi katılımını siler" on bulusma_katilimcilari;
create policy "kişi kendi katılımını siler"
on bulusma_katilimcilari for delete to authenticated
using (auth.uid() = user_id);

create or replace view bulusma_ozet
with (security_invoker = true) as
select
  b.*,
  (select count(*) from bulusma_katilimcilari k where k.bulusma_id = b.id)::int as katilimci_sayisi
from bulusmalar b;

grant select, insert, update, delete on bulusmalar to authenticated;
grant select, delete on bulusma_katilimcilari to authenticated;
grant select on bulusma_ozet to authenticated;

-- Düzenleyen otomatik olarak ilk katılımcıdır.
create or replace function _bulusma_duzenleyeni_ekle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into bulusma_katilimcilari (bulusma_id, user_id)
  values (new.id, new.duzenleyen_id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists bulusma_duzenleyeni_ekle on bulusmalar;
create trigger bulusma_duzenleyeni_ekle
after insert on bulusmalar
for each row execute function _bulusma_duzenleyeni_ekle();

-- Katıl / karakterini güncelle. Kontenjan dolmuşsa, iptalse ya da geçmişse reddeder.
create or replace function bulusmaya_katil(p_bulusma uuid, p_karakter text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  b bulusmalar;
  sayi int;
  k text := nullif(trim(coalesce(p_karakter, '')), '');
begin
  if ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if k is not null and length(k) > 60 then raise exception 'PERDEA:METIN_UZUN'; end if;

  select * into b from bulusmalar where id = p_bulusma for update;
  if not found then raise exception 'PERDEA:BULUSMA_YOK'; end if;
  if b.durum <> 'acik' then raise exception 'PERDEA:BULUSMA_IPTAL'; end if;
  if b.zaman < now() then raise exception 'PERDEA:BULUSMA_GECMIS'; end if;

  if exists (select 1 from bulusma_katilimcilari where bulusma_id = b.id and user_id = ben) then
    update bulusma_katilimcilari set karakter = k where bulusma_id = b.id and user_id = ben;
    return;
  end if;

  select count(*) into sayi from bulusma_katilimcilari where bulusma_id = b.id;
  if b.kontenjan is not null and sayi >= b.kontenjan then
    raise exception 'PERDEA:KONTENJAN_DOLU';
  end if;

  insert into bulusma_katilimcilari (bulusma_id, user_id, karakter) values (b.id, ben, k);
end;
$$;

revoke all on function _bulusma_duzenleyeni_ekle() from public, anon, authenticated;
revoke all on function bulusmaya_katil(uuid, text) from public, anon;
grant execute on function bulusmaya_katil(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 3) BEN KİMİM? — oyun odaları
--    Kural: herkese gizli bir karakter atanır (başka bir oyuncu yazar). Kendi
--    karakterini göremezsin; sıran gelince evet/hayır sorusu sorar ya da tahmin
--    edersin. Tüm yazma işlemleri aşağıdaki fonksiyonlardan geçer; tablolara
--    istemciden doğrudan erişim yoktur (gizli karakter sızmasın diye).
-- ----------------------------------------------------------------------------

create table if not exists oyun_odalari (
  id uuid primary key default gen_random_uuid(),
  kod text not null unique,
  oyun_turu text not null default 'ben_kimim',
  ad text not null check (length(trim(ad)) between 2 and 50),
  tema text check (tema is null or length(tema) <= 60),
  kurucu_id uuid references users(id) on delete cascade not null,
  acik boolean not null default true,              -- lobi listesinde görünsün mü
  kapasite smallint not null default 6 check (kapasite between 2 and 8),
  durum text not null default 'lobi' check (durum in ('lobi', 'karakter', 'oyun', 'bitti')),
  tur integer not null default 1,
  sira_id uuid references users(id) on delete set null,
  aktif_soru_id uuid,
  guncellendi timestamptz not null default now(),  -- her değişimde tazelenir (canlı güncelleme)
  created_at timestamptz not null default now()
);
create index if not exists oyun_odalari_lobi_idx on oyun_odalari (durum, acik, guncellendi desc);

create table if not exists oda_oyunculari (
  oda_id uuid references oyun_odalari(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  sira_no smallint not null,
  durum text not null default 'oynuyor' check (durum in ('oynuyor', 'bildi', 'pes')),
  derece smallint,
  soru_sayisi smallint not null default 0,
  tahmin_sayisi smallint not null default 0,
  katildi timestamptz not null default now(),
  primary key (oda_id, user_id)
);
create index if not exists oda_oyunculari_user_idx on oda_oyunculari (user_id);

create table if not exists oda_karakterleri (
  oda_id uuid references oyun_odalari(id) on delete cascade not null,
  hedef_id uuid references users(id) on delete cascade not null,   -- karakter kimin alnında
  yazan_id uuid references users(id) on delete cascade not null,   -- kim belirledi
  karakter text check (karakter is null or length(karakter) between 1 and 60),
  eser text check (eser is null or length(eser) <= 60),            -- hangi yapımdan (diğerlerine ipucu)
  primary key (oda_id, hedef_id)
);

create table if not exists oda_hamleleri (
  id uuid primary key default gen_random_uuid(),
  oda_id uuid references oyun_odalari(id) on delete cascade not null,
  tur integer not null,
  user_id uuid references users(id) on delete cascade not null,
  tip text not null check (tip in ('soru', 'tahmin')),
  metin text not null check (length(metin) between 1 and 200),
  dogru boolean,
  created_at timestamptz not null default now()
);
create index if not exists oda_hamleleri_oda_idx on oda_hamleleri (oda_id, tur, created_at);

create table if not exists oda_cevaplari (
  hamle_id uuid references oda_hamleleri(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  cevap text not null check (cevap in ('evet', 'hayir', 'belki')),
  primary key (hamle_id, user_id)
);

alter table oyun_odalari enable row level security;
alter table oda_oyunculari enable row level security;
alter table oda_karakterleri enable row level security;
alter table oda_hamleleri enable row level security;
alter table oda_cevaplari enable row level security;

-- Üyelik kontrolü (policy içinde özyinelemeyi önlemek için security definer).
create or replace function oda_uyesi_mi(p_oda uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from oda_oyunculari where oda_id = p_oda and user_id = auth.uid()
  );
$$;

-- Yalnızca oda satırı üyelerce okunabilir (Realtime bildirimi için gerekli).
-- Diğer oda_* tablolarında bilerek HİÇ policy yok: yalnızca fonksiyonlar erişir.
drop policy if exists "üye kendi odasını görür" on oyun_odalari;
create policy "üye kendi odasını görür"
on oyun_odalari for select to authenticated
using (oda_uyesi_mi(id));

revoke all on oyun_odalari, oda_oyunculari, oda_karakterleri, oda_hamleleri, oda_cevaplari
  from anon, authenticated;
grant select on oyun_odalari to authenticated;

-- ---- iç yardımcılar ---------------------------------------------------------

create or replace function _oda_kod_uret()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  harfler constant text := 'ABCDEFGHJKLMNPRSTUVYZ23456789';  -- karışan I/O/0/1 yok
  k text;
begin
  loop
    select string_agg(substr(harfler, 1 + floor(random() * length(harfler))::int, 1), '')
      into k from generate_series(1, 5);
    exit when not exists (select 1 from oyun_odalari where kod = k);
  end loop;
  return k;
end;
$$;

create or replace function _oda_getir(p_kod text, p_kilitle boolean default true)
returns oyun_odalari
language plpgsql
security definer
set search_path = public
as $$
declare
  o oyun_odalari;
begin
  if auth.uid() is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if p_kilitle then
    select * into o from oyun_odalari where kod = upper(trim(p_kod)) for update;
  else
    select * into o from oyun_odalari where kod = upper(trim(p_kod));
  end if;
  if not found then raise exception 'PERDEA:ODA_YOK'; end if;
  return o;
end;
$$;

-- Sırayı bir sonraki "oynuyor" oyuncuya geçirir; kimse kalmadıysa oyunu bitirir.
create or replace function _oda_sira_ilerlet(p_oda uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o oyun_odalari;
  simdiki smallint;
  sonraki uuid;
begin
  select * into o from oyun_odalari where id = p_oda for update;

  if not exists (select 1 from oda_oyunculari where oda_id = p_oda and durum = 'oynuyor') then
    update oyun_odalari
      set durum = 'bitti', sira_id = null, aktif_soru_id = null, guncellendi = now()
      where id = p_oda;
    return;
  end if;

  select sira_no into simdiki from oda_oyunculari where oda_id = p_oda and user_id = o.sira_id;
  simdiki := coalesce(simdiki, 0);

  select user_id into sonraki
    from oda_oyunculari
    where oda_id = p_oda and durum = 'oynuyor'
    order by (sira_no > simdiki) desc, sira_no asc
    limit 1;

  update oyun_odalari
    set sira_id = sonraki, aktif_soru_id = null, guncellendi = now()
    where id = p_oda;
end;
$$;

-- Tahmin gizli karakterle örtüşüyor mu? Birebir, ya da biri diğerinin kelimelerini
-- tamamen içeriyorsa (ör. "naruto" ↔ "Naruto Uzumaki") doğru sayılır.
create or replace function _tahmin_tutuyor(p_gizli text, p_tahmin text)
returns boolean
language plpgsql
immutable
as $$
declare
  g text := perdea_sade(p_gizli);
  t text := perdea_sade(p_tahmin);
  gk text[];
  tk text[];
  kisa text[];
  onemsiz constant text[] := array['the','bir','ve','of','and','de','da','ile','bay','bayan','mr','dr'];
begin
  if g = '' or t = '' then return false; end if;
  if g = t then return true; end if;
  gk := string_to_array(g, ' ');
  tk := string_to_array(t, ' ');
  if tk <@ gk then kisa := tk;
  elsif gk <@ tk then kisa := gk;
  else return false;
  end if;
  return exists (
    select 1 from unnest(kisa) k where length(k) >= 3 and not (k = any(onemsiz))
  );
end;
$$;

-- Oyuncuyu "bildi" yapar ve derecesini verir.
create or replace function _oda_bildi_isaretle(p_oda uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update oda_oyunculari
    set durum = 'bildi',
        derece = 1 + (select count(*) from oda_oyunculari where oda_id = p_oda and durum = 'bildi')
    where oda_id = p_oda and user_id = p_user and durum = 'oynuyor';
end;
$$;

-- Sıra p_user'daysa ilerletir; değilse oyun bitti mi diye bakar ve odayı tazeler.
create or replace function _oda_sonrasi(p_oda uuid, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o oyun_odalari;
begin
  select * into o from oyun_odalari where id = p_oda for update;
  if o.sira_id = p_user
     or not exists (select 1 from oda_oyunculari where oda_id = p_oda and durum = 'oynuyor') then
    perform _oda_sira_ilerlet(p_oda);
  else
    update oyun_odalari set guncellendi = now() where id = p_oda;
  end if;
end;
$$;

-- ---- istemcinin çağırdığı fonksiyonlar ---------------------------------------

create or replace function oda_kur(
  p_ad text,
  p_tema text default null,
  p_acik boolean default true,
  p_kapasite int default 6
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  yeni_kod text;
  yeni_id uuid;
begin
  if ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if length(trim(coalesce(p_ad, ''))) not between 2 and 50 then raise exception 'PERDEA:AD_GECERSIZ'; end if;
  if p_kapasite is null or p_kapasite not between 2 and 8 then raise exception 'PERDEA:KAPASITE_GECERSIZ'; end if;

  -- Terk edilmiş odaları temizle.
  delete from oyun_odalari where guncellendi < now() - interval '12 hours';

  yeni_kod := _oda_kod_uret();
  insert into oyun_odalari (kod, ad, tema, kurucu_id, acik, kapasite)
  values (yeni_kod, trim(p_ad), nullif(trim(coalesce(p_tema, '')), ''), ben, coalesce(p_acik, true), p_kapasite)
  returning id into yeni_id;

  insert into oda_oyunculari (oda_id, user_id, sira_no) values (yeni_id, ben, 1);
  return yeni_kod;
end;
$$;

create or replace function odaya_katil(p_kod text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
  sayi int;
begin
  o := _oda_getir(p_kod);
  if exists (select 1 from oda_oyunculari where oda_id = o.id and user_id = ben) then
    return o.kod;
  end if;
  if o.durum <> 'lobi' then raise exception 'PERDEA:OYUN_BASLADI'; end if;
  select count(*) into sayi from oda_oyunculari where oda_id = o.id;
  if sayi >= o.kapasite then raise exception 'PERDEA:ODA_DOLU'; end if;

  insert into oda_oyunculari (oda_id, user_id, sira_no)
  values (o.id, ben, 1 + coalesce((select max(sira_no) from oda_oyunculari where oda_id = o.id), 0));
  update oyun_odalari set guncellendi = now() where id = o.id;
  return o.kod;
end;
$$;

create or replace function odadan_ayril(p_kod text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
begin
  o := _oda_getir(p_kod);
  if not exists (select 1 from oda_oyunculari where oda_id = o.id and user_id = ben) then return; end if;
  if o.durum in ('karakter', 'oyun') then raise exception 'PERDEA:OYUN_SURUYOR'; end if;

  delete from oda_oyunculari where oda_id = o.id and user_id = ben;
  delete from oda_karakterleri where oda_id = o.id and (hedef_id = ben or yazan_id = ben);

  if not exists (select 1 from oda_oyunculari where oda_id = o.id) then
    delete from oyun_odalari where id = o.id;
    return;
  end if;

  update oyun_odalari
    set kurucu_id = case when kurucu_id = ben
          then (select user_id from oda_oyunculari where oda_id = o.id order by sira_no limit 1)
          else kurucu_id end,
        guncellendi = now()
    where id = o.id;
end;
$$;

create or replace function oyuncu_cikar(p_kod text, p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
begin
  o := _oda_getir(p_kod);
  if o.kurucu_id <> ben then raise exception 'PERDEA:YETKI_YOK'; end if;
  if p_user = ben then raise exception 'PERDEA:YETKI_YOK'; end if;
  if o.durum in ('karakter', 'oyun') then raise exception 'PERDEA:OYUN_SURUYOR'; end if;
  delete from oda_oyunculari where oda_id = o.id and user_id = p_user;
  delete from oda_karakterleri where oda_id = o.id and (hedef_id = p_user or yazan_id = p_user);
  update oyun_odalari set guncellendi = now() where id = o.id;
end;
$$;

-- Lobiden ya da biten oyundan yeni tur başlatır: herkese kimin karakterini
-- yazacağı atanır (her turda atamalar kayar).
create or replace function oyunu_baslat(p_kod text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
  n int;
  ofset int;
  yeni_tur int;
begin
  o := _oda_getir(p_kod);
  if o.kurucu_id <> ben then raise exception 'PERDEA:YETKI_YOK'; end if;
  if o.durum not in ('lobi', 'bitti') then raise exception 'PERDEA:OYUN_SURUYOR'; end if;
  select count(*) into n from oda_oyunculari where oda_id = o.id;
  if n < 2 then raise exception 'PERDEA:AZ_OYUNCU'; end if;

  yeni_tur := case when o.durum = 'bitti' then o.tur + 1 else o.tur end;
  ofset := 1 + ((yeni_tur - 1) % (n - 1));

  delete from oda_karakterleri where oda_id = o.id;
  update oda_oyunculari
    set durum = 'oynuyor', derece = null, soru_sayisi = 0, tahmin_sayisi = 0
    where oda_id = o.id;

  with s as (
    select user_id, (row_number() over (order by sira_no))::int - 1 as i
    from oda_oyunculari where oda_id = o.id
  )
  insert into oda_karakterleri (oda_id, hedef_id, yazan_id)
  select o.id, h.user_id, y.user_id
  from s h join s y on y.i = (h.i + ofset) % n;

  update oyun_odalari
    set durum = 'karakter', tur = yeni_tur, sira_id = null, aktif_soru_id = null, guncellendi = now()
    where id = o.id;
end;
$$;

-- Kurucu her an lobiye döndürebilir (ör. biri karakter yazmadan kaybolduysa).
create or replace function lobiye_don(p_kod text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
begin
  o := _oda_getir(p_kod);
  if o.kurucu_id <> ben then raise exception 'PERDEA:YETKI_YOK'; end if;
  delete from oda_karakterleri where oda_id = o.id;
  update oda_oyunculari
    set durum = 'oynuyor', derece = null, soru_sayisi = 0, tahmin_sayisi = 0
    where oda_id = o.id;
  update oyun_odalari
    set durum = 'lobi', sira_id = null, aktif_soru_id = null, guncellendi = now()
    where id = o.id;
end;
$$;

create or replace function karakter_yaz(p_kod text, p_karakter text, p_eser text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
  k text := trim(coalesce(p_karakter, ''));
  e text := nullif(trim(coalesce(p_eser, '')), '');
begin
  o := _oda_getir(p_kod);
  if o.durum <> 'karakter' then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  if length(k) not between 1 and 60 then raise exception 'PERDEA:KARAKTER_GECERSIZ'; end if;
  if e is not null and length(e) > 60 then raise exception 'PERDEA:METIN_UZUN'; end if;

  update oda_karakterleri set karakter = k, eser = e where oda_id = o.id and yazan_id = ben;
  if not found then raise exception 'PERDEA:YETKI_YOK'; end if;

  if not exists (select 1 from oda_karakterleri where oda_id = o.id and karakter is null) then
    update oyun_odalari
      set durum = 'oyun',
          sira_id = (select user_id from oda_oyunculari where oda_id = o.id order by sira_no limit 1),
          aktif_soru_id = null,
          guncellendi = now()
      where id = o.id;
  else
    update oyun_odalari set guncellendi = now() where id = o.id;
  end if;
end;
$$;

create or replace function soru_sor(p_kod text, p_metin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
  m text := trim(coalesce(p_metin, ''));
  yeni uuid;
begin
  o := _oda_getir(p_kod);
  if o.durum <> 'oyun' then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  if o.sira_id is distinct from ben then raise exception 'PERDEA:SIRA_SENDE_DEGIL'; end if;
  if o.aktif_soru_id is not null then raise exception 'PERDEA:SORU_BEKLIYOR'; end if;
  if length(m) not between 1 and 200 then raise exception 'PERDEA:METIN_UZUN'; end if;

  insert into oda_hamleleri (oda_id, tur, user_id, tip, metin)
  values (o.id, o.tur, ben, 'soru', m) returning id into yeni;
  update oda_oyunculari set soru_sayisi = soru_sayisi + 1 where oda_id = o.id and user_id = ben;
  update oyun_odalari set aktif_soru_id = yeni, guncellendi = now() where id = o.id;
end;
$$;

create or replace function cevap_ver(p_hamle uuid, p_cevap text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  h oda_hamleleri;
  o oyun_odalari;
  verilen int;
  gereken int;
begin
  if ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  if p_cevap not in ('evet', 'hayir', 'belki') then raise exception 'PERDEA:CEVAP_GECERSIZ'; end if;
  select * into h from oda_hamleleri where id = p_hamle;
  if not found then raise exception 'PERDEA:SORU_YOK'; end if;
  select * into o from oyun_odalari where id = h.oda_id for update;
  if not exists (select 1 from oda_oyunculari where oda_id = o.id and user_id = ben) then
    raise exception 'PERDEA:YETKI_YOK';
  end if;
  if o.aktif_soru_id is distinct from h.id then raise exception 'PERDEA:SORU_KAPANDI'; end if;
  if h.user_id = ben then raise exception 'PERDEA:KENDI_SORUN'; end if;

  insert into oda_cevaplari (hamle_id, user_id, cevap) values (h.id, ben, p_cevap)
  on conflict (hamle_id, user_id) do update set cevap = excluded.cevap;

  select count(*) into verilen from oda_cevaplari where hamle_id = h.id;
  select count(*) - 1 into gereken from oda_oyunculari where oda_id = o.id;
  if verilen >= gereken then
    perform _oda_sira_ilerlet(o.id);   -- herkes cevapladı → sıra geçer
  else
    update oyun_odalari set guncellendi = now() where id = o.id;
  end if;
end;
$$;

-- Sırası gelen oyuncu sırayı devreder (sorusuna en az bir cevap geldiyse ya da
-- hiç sormadan pas geçiyorsa). Kurucu, takılan sırayı her zaman atlatabilir.
create or replace function sirayi_devret(p_kod text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
begin
  o := _oda_getir(p_kod);
  if o.durum <> 'oyun' then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  if o.kurucu_id = ben and o.sira_id is distinct from ben then
    null;  -- kurucu atlatıyor
  elsif o.sira_id is distinct from ben then
    raise exception 'PERDEA:SIRA_SENDE_DEGIL';
  elsif o.aktif_soru_id is not null
        and not exists (select 1 from oda_cevaplari where hamle_id = o.aktif_soru_id) then
    raise exception 'PERDEA:CEVAP_BEKLE';
  end if;
  perform _oda_sira_ilerlet(o.id);
end;
$$;

create or replace function tahmin_et(p_kod text, p_metin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
  m text := trim(coalesce(p_metin, ''));
  gizli text;
  tuttu boolean;
begin
  o := _oda_getir(p_kod);
  if o.durum <> 'oyun' then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  if o.sira_id is distinct from ben then raise exception 'PERDEA:SIRA_SENDE_DEGIL'; end if;
  if o.aktif_soru_id is not null then raise exception 'PERDEA:SORU_BEKLIYOR'; end if;
  if length(m) not between 1 and 200 then raise exception 'PERDEA:METIN_UZUN'; end if;

  select karakter into gizli from oda_karakterleri where oda_id = o.id and hedef_id = ben;
  tuttu := _tahmin_tutuyor(gizli, m);

  insert into oda_hamleleri (oda_id, tur, user_id, tip, metin, dogru)
  values (o.id, o.tur, ben, 'tahmin', m, tuttu);
  update oda_oyunculari set tahmin_sayisi = tahmin_sayisi + 1 where oda_id = o.id and user_id = ben;

  if tuttu then perform _oda_bildi_isaretle(o.id, ben); end if;
  perform _oda_sira_ilerlet(o.id);
  return tuttu;
end;
$$;

-- Yazım farkı yüzünden tutmayan tahmini, o karakteri yazan oyuncu "doğru" sayabilir.
create or replace function tahmini_onayla(p_hamle uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  h oda_hamleleri;
  o oyun_odalari;
begin
  if ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  select * into h from oda_hamleleri where id = p_hamle;
  if not found or h.tip <> 'tahmin' then raise exception 'PERDEA:SORU_YOK'; end if;
  select * into o from oyun_odalari where id = h.oda_id for update;
  if o.durum <> 'oyun' or h.tur <> o.tur then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  if not exists (
    select 1 from oda_karakterleri
    where oda_id = o.id and hedef_id = h.user_id and yazan_id = ben
  ) then raise exception 'PERDEA:YETKI_YOK'; end if;
  if not exists (
    select 1 from oda_oyunculari where oda_id = o.id and user_id = h.user_id and durum = 'oynuyor'
  ) then raise exception 'PERDEA:ASAMA_YANLIS'; end if;

  update oda_hamleleri set dogru = true where id = h.id;
  perform _oda_bildi_isaretle(o.id, h.user_id);
  perform _oda_sonrasi(o.id, h.user_id);
end;
$$;

create or replace function pes_et(p_kod text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
begin
  o := _oda_getir(p_kod);
  if o.durum <> 'oyun' then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  update oda_oyunculari set durum = 'pes'
    where oda_id = o.id and user_id = ben and durum = 'oynuyor';
  if not found then raise exception 'PERDEA:ASAMA_YANLIS'; end if;
  perform _oda_sonrasi(o.id, ben);
end;
$$;

-- Odanın, çağıran oyuncunun görmesine izin verilen tam durumu.
-- Kendi karakterin yalnızca bildiysen / pes ettiysen / oyun bittiyse görünür.
create or replace function oda_durumu(p_kod text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ben uuid := auth.uid();
  o oyun_odalari;
begin
  if ben is null then raise exception 'PERDEA:GIRIS_GEREKLI'; end if;
  select * into o from oyun_odalari where kod = upper(trim(p_kod));
  if not found then return null; end if;

  if not exists (select 1 from oda_oyunculari where oda_id = o.id and user_id = ben) then
    return jsonb_build_object(
      'uye', false,
      'oda', jsonb_build_object(
        'kod', o.kod, 'ad', o.ad, 'tema', o.tema, 'durum', o.durum, 'kapasite', o.kapasite,
        'oyuncu_sayisi', (select count(*) from oda_oyunculari where oda_id = o.id),
        'kurucu', (select username from users where id = o.kurucu_id)
      )
    );
  end if;

  return jsonb_build_object(
    'uye', true,
    'ben', ben,
    'oda', jsonb_build_object(
      'id', o.id, 'kod', o.kod, 'ad', o.ad, 'tema', o.tema, 'durum', o.durum, 'tur', o.tur,
      'kapasite', o.kapasite, 'acik', o.acik, 'kurucu_id', o.kurucu_id,
      'sira_id', o.sira_id, 'aktif_soru_id', o.aktif_soru_id, 'guncellendi', o.guncellendi
    ),
    'oyuncular', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'user_id', p.user_id,
        'username', u.username,
        'display_name', u.display_name,
        'avatar_url', u.avatar_url,
        'sira_no', p.sira_no,
        'durum', p.durum,
        'derece', p.derece,
        'soru_sayisi', p.soru_sayisi,
        'tahmin_sayisi', p.tahmin_sayisi,
        'karakter_hazir', (k.karakter is not null),
        'yazan_id', k.yazan_id,
        'karakter', case when o.durum = 'bitti' or p.user_id <> ben or p.durum in ('bildi', 'pes')
                         then k.karakter end,
        'eser', case when o.durum = 'bitti' or p.user_id <> ben or p.durum in ('bildi', 'pes')
                     then k.eser end
      ) order by p.sira_no), '[]'::jsonb)
      from oda_oyunculari p
      join users u on u.id = p.user_id
      left join oda_karakterleri k on k.oda_id = p.oda_id and k.hedef_id = p.user_id
      where p.oda_id = o.id
    ),
    'hamleler', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', h.id,
        'user_id', h.user_id,
        'tip', h.tip,
        'metin', h.metin,
        'dogru', h.dogru,
        'created_at', h.created_at,
        'cevaplar', (
          select coalesce(jsonb_agg(jsonb_build_object('user_id', c.user_id, 'cevap', c.cevap)), '[]'::jsonb)
          from oda_cevaplari c where c.hamle_id = h.id
        )
      ) order by h.created_at, h.id), '[]'::jsonb)
      from oda_hamleleri h
      where h.oda_id = o.id and h.tur = o.tur
    )
  );
end;
$$;

-- Lobi listesi: herkese açık, başlamamış, taze odalar.
create or replace function acik_odalar()
returns table (
  kod text, ad text, tema text, kurucu text, oyuncu_sayisi int, kapasite int, created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select o.kod, o.ad, o.tema, u.username,
         (select count(*) from oda_oyunculari p where p.oda_id = o.id)::int,
         o.kapasite::int, o.created_at
  from oyun_odalari o
  join users u on u.id = o.kurucu_id
  where auth.uid() is not null
    and o.durum = 'lobi' and o.acik
    and o.guncellendi > now() - interval '3 hours'
  order by o.created_at desc
  limit 30;
$$;

-- İçinde olduğum (hâlâ canlı) odalar.
create or replace function odalarim()
returns table (kod text, ad text, tema text, durum text, oyuncu_sayisi int, kapasite int, guncellendi timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select o.kod, o.ad, o.tema, o.durum,
         (select count(*) from oda_oyunculari p where p.oda_id = o.id)::int,
         o.kapasite::int, o.guncellendi
  from oyun_odalari o
  join oda_oyunculari ben on ben.oda_id = o.id and ben.user_id = auth.uid()
  where o.guncellendi > now() - interval '12 hours'
  order by o.guncellendi desc
  limit 10;
$$;

-- Yetkiler: iç yardımcılar kimseye açık değil; oyun fonksiyonları yalnızca giriş yapana.
revoke all on function _oda_kod_uret() from public, anon, authenticated;
revoke all on function _oda_getir(text, boolean) from public, anon, authenticated;
revoke all on function _oda_sira_ilerlet(uuid) from public, anon, authenticated;
revoke all on function _oda_bildi_isaretle(uuid, uuid) from public, anon, authenticated;
revoke all on function _oda_sonrasi(uuid, uuid) from public, anon, authenticated;

revoke all on function oda_uyesi_mi(uuid) from public, anon;
revoke all on function oda_kur(text, text, boolean, int) from public, anon;
revoke all on function odaya_katil(text) from public, anon;
revoke all on function odadan_ayril(text) from public, anon;
revoke all on function oyuncu_cikar(text, uuid) from public, anon;
revoke all on function oyunu_baslat(text) from public, anon;
revoke all on function lobiye_don(text) from public, anon;
revoke all on function karakter_yaz(text, text, text) from public, anon;
revoke all on function soru_sor(text, text) from public, anon;
revoke all on function cevap_ver(uuid, text) from public, anon;
revoke all on function sirayi_devret(text) from public, anon;
revoke all on function tahmin_et(text, text) from public, anon;
revoke all on function tahmini_onayla(uuid) from public, anon;
revoke all on function pes_et(text) from public, anon;
revoke all on function oda_durumu(text) from public, anon;
revoke all on function acik_odalar() from public, anon;
revoke all on function odalarim() from public, anon;

grant execute on function
  oda_uyesi_mi(uuid),
  oda_kur(text, text, boolean, int),
  odaya_katil(text),
  odadan_ayril(text),
  oyuncu_cikar(text, uuid),
  oyunu_baslat(text),
  lobiye_don(text),
  karakter_yaz(text, text, text),
  soru_sor(text, text),
  cevap_ver(uuid, text),
  sirayi_devret(text),
  tahmin_et(text, text),
  tahmini_onayla(uuid),
  pes_et(text),
  oda_durumu(text),
  acik_odalar(),
  odalarim()
to authenticated;

-- Canlı güncelleme: oda satırı değişince üyelere bildirim gitsin.
-- (Realtime yoksa uygulama zaten birkaç saniyede bir yoklayarak çalışır.)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'oyun_odalari'
     ) then
    alter publication supabase_realtime add table oyun_odalari;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 4) ŞİKAYET — kullanıcı içeriği için bildirim kutusu (yalnızca yazılır;
--    okumak için Supabase paneli / ileride moderasyon ekranı).
-- ----------------------------------------------------------------------------

create table if not exists sikayetler (
  id uuid primary key default gen_random_uuid(),
  bildiren_id uuid references users(id) on delete set null,
  hedef_tur text not null check (hedef_tur in ('bulusma', 'salon', 'salon_yorumu', 'oda', 'kullanici')),
  hedef_id text not null check (length(hedef_id) <= 80),
  sebep text not null check (length(trim(sebep)) between 5 and 500),
  created_at timestamptz not null default now()
);

alter table sikayetler enable row level security;

drop policy if exists "giriş yapan şikayet eder" on sikayetler;
create policy "giriş yapan şikayet eder"
on sikayetler for insert to authenticated
with check (auth.uid() = bildiren_id);

revoke all on sikayetler from anon, authenticated;
grant insert on sikayetler to authenticated;
