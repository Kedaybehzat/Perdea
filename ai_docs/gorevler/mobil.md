# Mobil uygulama (`mobil/`)

**Durum:** 1. tur bitti (11 Kas 2026). Expo SDK 58 · React Native 0.88 · Expo Router (dosya tabanlı) · TypeScript.
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
| Kök düzen, yazı tipleri, oturum koruması | `src/app/_layout.tsx` |
| Karşılama / Giriş / Kayıt (KVKK onaylı) | `src/app/(giris)/` |
| Sekmeler | `src/app/(sekmeler)/_layout.tsx` |
| Keşfet (trend, arama, favori, puan) | `src/app/(sekmeler)/index.tsx` |
| Eşleş (aday kartı, Beğen/Geç, kutlama) | `src/app/(sekmeler)/eslesme.tsx` |
| Sohbet listesi / tek sohbet | `src/app/(sekmeler)/sohbet.tsx`, `src/app/sohbet/[id].tsx` |
| Akış | `src/app/(sekmeler)/akis.tsx` |
| Profil | `src/app/(sekmeler)/profil.tsx` |

## Doğrulama
- `cd mobil && npx tsc --noEmit`
- `npx expo export --platform ios` ve `--platform android` (paketleniyor mu)
- Görsel kontrol: `npx expo export --platform web` çıktısını statik sunup tarayıcıda 390 px genişlikte bakılabilir (1. tur böyle test edildi). **Gerçek cihazda henüz denenmedi.**

## Sıradaki tur
1. Sohbette fotoğraf (`expo-image-picker`) ve ses (`expo-audio`) gönderme + ses çalma.
2. Push bildirim (`expo-notifications`): cihaz belirteci tablosu + Supabase Edge Function ya da veritabanı webhook'u ile gönderim.
3. Salon puanları, Başlıklar, Ben Kimim?, Cosplay ekranları.
4. Profil düzenleme, avatar yükleme, hesap silme (şimdilik web'e yönlendiriyor).
5. EAS Build + mağaza gönderimi (`eas.json` henüz yok).
