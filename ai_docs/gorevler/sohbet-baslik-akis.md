# Sohbet · Başlık/Entry · Akış

**Durum:** BİTTİ (11 Kas 2026). Şema: `docs/migrations/2026-11-11b_sohbet_baslik_akis.sql` (idempotent; `2026-11-11_salon_cosplay_oyun.sql`'den SONRA çalışır — `perdea_sade` ve `sikayetler`'e bağlı).
**Kural:** Şema değişecekse yeni tarihli migration ekle; mevcut dosyayı düzenleme.

## Dosya haritası
| Özellik | Sayfa | lib | Tablolar / RPC |
|---|---|---|---|
| Sohbet | `app/sohbet/` (`page`, `SohbetListesi`, `[id]/page`, `[id]/MesajAlani` client, `actions`) | `lib/sohbet.ts`, tipler `lib/sohbet-tipleri.ts` | `sohbetler`, `mesajlar`, `engeller` + RPC `sohbet_ac, mesaj_gonder, sohbet_okundu, sohbetlerim, eslesmelerim, okunmamis_sayisi` |
| Başlık | `app/baslik/` (`page`, `Formlar` client, `[slug]/page`, `actions`) | `lib/baslik.ts` | `basliklar`, `entryler`, `entry_begeni`, view `baslik_ozet`, `entry_ozet`, RPC `baslik_ac` |
| Akış | `app/topluluk/` (`page`, `GonderiFormu` client, `actions`) | `lib/akis.ts` | `gonderiler`, `gonderi_begeni`, view `gonderi_ozet` |
| Ortak | `components/ui/BegenDugmesi.tsx` (iyimser beğeni; `degistir` = bound server action) | | |

## Sohbet kuralları (hepsi veritabanında zorlanır)
- Yalnızca **karşılıklı beğenenler** (`matches` iki yönde `begen`) sohbet açabilir → `sohbet_ac(p_diger)`. Çift başına tek sohbet (`a_id < b_id`, unique).
- `sohbetler` ve `mesajlar`'a doğrudan yazma yetkisi YOK; yalnızca RPC. Okuma RLS ile taraflara açık.
- Engel (`engeller`): iki yönde de mesajı keser. Kullanıcı yalnızca kendi koyduğu engeli görür (karşı tarafın engeli sızmaz); arayüz "mesajlaşma kapalı" der.
- Hız sınırı: dakikada 30 mesaj; entry saatte 30; gönderi saatte 20 → `PERDEA:COK_HIZLI`.
- Okundu: `a_okudu/b_okudu` zaman damgası; `[id]/page` her render'da `sohbet_okundu` çağırır. Üst menü rozeti `okunmamis_sayisi()` (Header'da).
- Canlılık: `MesajAlani` Realtime `mesajlar` INSERT dinler; bağlanamazsa 4 sn'de bir `router.refresh()`. Mesaj gönderimi iyimser (bekleyen balon + "Yeniden dene").

## Başlık kuralları
- Başlık küçük harfe çevrilip `perdea_slug` ile slug'lanır; aynı slug varsa yeni başlık açılmaz, entry mevcut başlığa eklenir (`baslik_ac` slug döndürür).
- Başlık tek başına açılamaz, ilk entry zorunlu. Entry 2–2000 karakter; yalnızca sahibi siler. Düzenleme yok (bilerek).
- Okuma herkese açık (anon dahil); yazma/beğeni girişli.

## Eksikler / sonraki adımlar
- Moderasyon ekranı yok: `sikayetler` yalnızca Supabase panelinden okunur (hedef_tur: entry, gonderi, sohbet eklendi).
- Sohbette sayfalama yok (son 200 mesaj). Görsel/dosya gönderimi yok.
- Akışta takip/algoritma yok; herkesin gönderisi tarih sırasıyla.
- Bildirim (push/e-posta) yok.
