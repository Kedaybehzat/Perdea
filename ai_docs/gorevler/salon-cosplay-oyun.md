# Salon puanları · Cosplay buluşmaları · Ben Kimim? odaları

**Durum:** BİTTİ (11 Kas 2026). Şema tek dosyada: `docs/migrations/2026-11-11_salon_cosplay_oyun.sql` (idempotent, tekrar çalıştırılabilir).
**Kural:** Şemayı değiştireceksen o dosyayı düzenleme; yeni tarihli bir migration ekle.

## Dosya haritası
| Özellik | Sayfa | lib | Tablolar / RPC |
|---|---|---|---|
| Salon | `app/salonlar/` (`page`, `[id]/page`, `actions.ts`) | `lib/sinema.ts`, tipler `lib/sinema-tipleri.ts` | `sinemalar`, `sinema_puanlari`, view `sinema_ozet` |
| Cosplay | `app/cosplay/` (`page`, `yeni/`, `[id]/`) | `lib/bulusma.ts` | `bulusmalar`, `bulusma_katilimcilari`, view `bulusma_ozet`, RPC `bulusmaya_katil` |
| Oyun | `app/oyun/` (`page`, `[kod]/page`, `[kod]/OdaCanli.tsx`, `[kod]/kancalar.ts`) | `lib/oyun.ts`, tipler `lib/oyun-tipleri.ts` | `oyun_odalari`, `oda_oyunculari`, `oda_karakterleri`, `oda_hamleleri`, `oda_cevaplari` + RPC'ler |
| Şikâyet | `components/ui/BildirFormu.tsx` | `lib/bulusma.ts` → `sikayetEt` | `sikayetler` (yalnızca insert) |

Client bileşeni server lib'i import edemez → tipler/sabitler `*-tipleri.ts` dosyalarında.

## Salon
- 5 ölçüt, 1–5: goruntu, ses, koltuk, temizlik, fiyat (`OLCUTLER`). Kişi başı salon başına tek puan (PK sinema_id+user_id), güncellenebilir/silinebilir.
- Mükerrer salon engeli: `perdea_sade(ad)+perdea_sade(sehir)` unique index. Şehir listesi `lib/sehirler.ts` (81 il).

## Cosplay
- Liste ve katılımcılar yalnızca girişli kullanıcıya açık. Katılım yalnızca `bulusmaya_katil(p_bulusma, p_karakter)` RPC'siyle (kontenjan + tarih kontrolü orada). Düzenleyen trigger ile otomatik katılımcı.
- Güvenlik metni `app/cosplay/GuvenlikKarti.tsx`. Canlı öncesi 18+ / KVKK onayı eklenmeli.

## Ben Kimim?
- Akış: `lobi → karakter → oyun → bitti`. 2–8 kişi, 5 haneli kod, açık/gizli oda.
- Herkes sıradaki oyuncunun karakterini yazar; kimse kendi karakterini göremez.
- **Güvenlik modeli:** `oda_*` tablolarında policy YOK; her şey security definer RPC ile. Client tek çağrıyla durumu alır: `oda_durumu(kod)` → jsonb (kendi karakteri gizlenmiş). Tabloları doğrudan `select` etmeye çalışma.
- RPC'ler: `oda_kur, odaya_katil, odadan_ayril, oyuncu_cikar, oyunu_baslat, karakter_yaz, soru_sor, cevap_ver, sirayi_devret, tahmin_et, tahmini_onayla, pes_et, lobiye_don, acik_odalar, odalarim`.
- Hatalar `PERDEA:KOD` olarak raise edilir; Türkçe metne `lib/hata.ts` → `hataMesaji` çevirir. Yeni hata kodu eklersen oraya da ekle.
- Canlılık: `useOdaCanli` Realtime (`oyun_odalari.guncellendi`) dinler + 3 sn'de bir `router.refresh()` yedeği. Realtime kapalı olsa da çalışır.

## Tasarım dili (yeni sayfa yaparken)
- Başlıklar Fraunces (h1/h2 otomatik), gövde Figtree. Zemin `bg-stone-50` (krem), vurgu emerald, yıldız/tarih `altin`.
- Sayfa üst bandı: `perde-zemin` (koyu yeşil perde) + beyaz serif başlık; vurgu kelimesi italik `text-emerald-300`.
- Kartlar: `bg-white border border-stone-200 rounded-3xl`; bilet görünümü için `components/ui/Bilet.tsx`.
- Form: `className="alan"`, birincil düğme `dugme`, ikincil `dugme-cizgi`. Mesajlar `FormMesaji`, boş durum `BosDurum`, avatar `Avatar`.
- Sayfa üst bandı için hazır bileşen: `components/ui/PerdeBandi.tsx`. Poster kutusu: `className="afis aspect-[2/3]"`, poster yoksa `AfisYok`.
- Hareket: liste/ızgara girişinde `sirali`, kaydırınca gelen blokta `goster`, tıklanabilir kartta `kalkar`, seçim/başarı anında `animate-zipla`. Yeni keyframe yazmadan önce `globals.css` "Hareket" bölümüne bak. Hepsi reduced-motion'da kapanır; süs için sürekli dönen/zıplayan şey ekleme.
- Mor gradyan, emoji ikon, gölgeli "cam" kart kullanma; ikonlar lucide-react.

## Test notu
`next dev`'i tarayıcıda `localhost:3000` ile aç; `127.0.0.1` ile açınca Next dev hydrate etmiyor (butonlar ölü görünür).
