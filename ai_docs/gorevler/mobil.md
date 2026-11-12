# Mobil uygulama (`mobil/`)

**Durum:** Özellik olarak web ile eşit (12 Kas 2026). Gerçek cihazda henüz denenmedi. Expo SDK 58 · React Native 0.88 · Expo Router (dosya tabanlı) · TypeScript.
**Önce oku:** `mobil/README.md` (kurulum, çalıştırma, mağaza).

## Kurallar
- **Expo/React Native API'leri hızlı değişiyor.** Kod yazmadan önce `mobil/node_modules/<paket>/build/*.d.ts` dosyasına bak; ezberden yazma. (Bu sürümde: sekmeler `expo-router/js-tabs`, korumalı rotalar `Stack.Protected guard={...}`, şablon `src/app/` altında.)
- Yeni yerel (native) paket eklerken sürümü `mobil/node_modules/expo/bundledNativeModules.json`'dan al.
- Aynı Supabase veritabanı; yalnızca **anon** anahtar (`EXPO_PUBLIC_*`). Uygulamaya gizli anahtar gömme. Yetkiyi RLS/RPC belirler; web'deki RPC'lerin aynısı çağrılır (`sohbet_ac`, `mesaj_gonder`, `sohbetlerim`, ...).
- TMDB anahtarı uygulamada YOK → `EXPO_PUBLIC_API_URL` + `/api/mobil/tmdb` (web tarafı: `app/api/mobil/tmdb/route.ts`).
- Görsel dil web ile aynı: değerler `mobil/src/tema.ts`. Büyük harfli etiketlerde `textTransform` KULLANMA ("i" → "I" yapıyor); `buyuk()` yardımcı fonksiyonunu kullan.
- Kopya mantık: `mobil/src/lib/eslesme.ts` ↔ `lib/eslesme.ts`, `mobil/src/lib/hata.ts` ↔ `lib/hata.ts`. Birini değiştirince diğerini de güncelle.

## Dosya haritası
| Ekran | Dosya |
|---|---|
| Kök düzen, yazı tipleri, oturum koruması, push kaydı, bildirime dokununca yönlendirme | `src/app/_layout.tsx` |
| Karşılama / Giriş / Kayıt (KVKK onaylı) | `src/app/(giris)/` |
| Sekmeler (Keşfet, Eşleş, Sohbet, Topluluk, Profil) + rozetler | `src/app/(sekmeler)/` |
| Topluluk: Akış + Başlıklar listesi | `src/app/(sekmeler)/topluluk.tsx`, `src/components/topluluk/` |
| Başlık içi | `src/app/baslik/[slug].tsx` |
| Salon puanları | `src/app/salon/` |
| Cosplay buluşmaları | `src/app/cosplay/` |
| Ben Kimim? | `src/app/oyun/` (`[kod].tsx`: 3 sn yoklama, Realtime yok) |
| Tek sohbet (yazı, fotoğraf, ses, engelle, bildir) | `src/app/sohbet/[id].tsx` |
| Bildirimler | `src/app/bildirimler.tsx` |
| Profil düzenle (avatar yükleme, hesap silme) | `src/app/profil-duzenle.tsx` |
| Ortak | `src/components/` (temel, Perde, Afis, Kart, UstCubuk, BildirModal) |
| Yardımcılar | `src/lib/` (supabase, oturum, sayac, push, medya, tmdb, eslesme, sohbet, oyun, hata, zaman, sehirler) |

## Push
- Şema: `docs/migrations/2026-11-11d_mobil_push_avatar.sql` → `cihazlar` tablosu, `cihaz_kaydet/cihaz_sil` RPC, `bildirimler` ve `mesajlar` INSERT tetikleyicileri `pg_net` ile `https://exp.host/--/api/v2/push/send`'e istek atar. Push hatası asıl işlemi bozmaz.
- İstemci: `src/lib/push.ts`. Bildirim `data.yol` web yolu taşır; `yolaGit` uygulama ekranına çevirir (rotalar web yollarıyla aynı tutuldu: `/sohbet`, `/topluluk`, `/baslik/x`, `/cosplay/x`, `/bildirimler`).
- `extra.eas.projectId` yoksa (eas init yapılmadıysa) push sessizce kapalı kalır. Android'de Expo Go push desteklemez → development build.

## Medya
- Fotoğraf: `expo-image-picker` → `expo-image-manipulator` (1600 px JPEG, EXIF silinir) → `sohbet-medya` kovası → `medya_mesaji_gonder`.
- Ses: `expo-audio` `RecordingPresets.HIGH_QUALITY` (m4a / `audio/mp4`), en çok 120 sn. Web tarafı da artık önce `audio/mp4` kaydetmeye çalışıyor (iPhone webm çalamıyor).
- Avatar: `avatarlar` (herkese açık) kovası, yol `<user_id>/<dosya>.jpg`.

## Doğrulama
- `cd mobil && npx tsc --noEmit`
- `npx expo export --platform ios` ve `--platform android` (paketleniyor mu)
- Görsel kontrol: `npx expo export --platform web` çıktısını statik sunup tarayıcıda 390 px genişlikte bakılabilir (1. tur böyle test edildi). **Gerçek cihazda henüz denenmedi.**

## Sıradaki tur
1. Gerçek cihaz testi (iOS Expo Go + Android development build) ve çıkan düzeltmeler.
2. `eas init`, ikon/açılış görseli son hâli, mağaza ekran görüntüleri.
3. Silinen hesap/sohbetin Storage dosyalarını temizleyen iş (şu an yetim kalıyor).
