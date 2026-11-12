# Perdea — mobil uygulama (Expo)

iOS ve Android uygulaması. Web sitesiyle **aynı Supabase veritabanını** kullanır; film verisi web sitesindeki
`/api/mobil/tmdb` adresinden gelir (TMDB anahtarı uygulamaya gömülmez).

## İlk kurulum

```bash
cd mobil
npm install
cp .env.example .env.local   # sonra içini doldur
```

`.env.local`:
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` → web'deki `.env.local` ile aynı iki değer.
- `EXPO_PUBLIC_API_URL` → yayındaki sitenin adresi (Vercel). Yerelde denerken bilgisayarının ağ adresi
  (`http://192.168.x.x:3000`); telefonda `localhost` çalışmaz.

## Telefonda denemek

```bash
npx expo start
```

Telefona **Expo Go** uygulamasını kur, terminaldeki QR kodu okut (iPhone: Kamera; Android: Expo Go içinden).
Telefon ve bilgisayar aynı Wi-Fi'da olmalı.

> Expo Go her zaman en yeni SDK'yı destekler. "SDK uyumsuz" derse `npx expo install --fix` çalıştır.

## Telefona bildirim (push)

Bildirimleri veritabanı gönderir (`docs/migrations/2026-11-11d_mobil_push_avatar.sql`), ayrıca sunucu gerekmez.
Uygulama tarafında bir kerelik kurulum:

```bash
npx eas-cli@latest login
npx eas-cli@latest init          # app.json'a proje kimliğini (extra.eas.projectId) yazar
```

- **iPhone:** Expo Go ile de bildirim gelir.
- **Android:** Expo Go push desteklemiyor; geliştirme derlemesi gerekir:
  `npx eas-cli@latest build --profile development --platform android` → çıkan APK'yı telefona kur,
  sonra `npx expo start` ile aç.

## EAS'te ortam değişkenleri

`.env.local` buluta gönderilmez. Derlemeden önce aynı üç değeri EAS'e bir kez tanımla:

```bash
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxx.supabase.co" --visibility plaintext
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..." --visibility plaintext
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_API_URL --value "https://perdea.vercel.app" --visibility plaintext
```

(`development` ve `preview` ortamları için de aynısı.)

## Mağazaya çıkarmak (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android      # telefona kurulabilir APK (deneme)
npx eas-cli@latest build --profile production --platform android   # .aab (Google Play)
npx eas-cli@latest build --profile production --platform ios       # Apple Developer hesabı gerekir
npx eas-cli@latest submit --platform ios|android
```

`app.json` içindeki `ios.bundleIdentifier` / `android.package` şu an `app.perdea.mobil`; mağazaya ilk
gönderimden önce kendi alan adına göre değiştir (sonradan değişmez).

## Yapı

```
src/app/            ekranlar (Expo Router: dosya = ekran)
  (giris)/          karşılama, giriş, kayıt        → oturum yokken
  (sekmeler)/       Keşfet, Eşleş, Sohbet, Akış, Profil → oturum varken
  sohbet/[id].tsx   tek sohbet
src/components/     ortak parçalar (temel.tsx, Perde.tsx, Afis.tsx)
src/lib/            supabase, oturum, tmdb, eslesme, sohbet, hata, zaman
src/tema.ts         renkler, yazı tipleri, boşluklar (web'deki globals.css ile aynı değerler)
```

Kontrol: `npx tsc --noEmit` ve `npx expo export --platform ios` (paketlenebiliyor mu).

## Mağaza kuralları için hazır olanlar

Hesap silme (Profil → Profili düzenle), içerik bildirme (gönderi, entry, sohbet), kullanıcı engelleme (sohbet menüsü),
18+ ve KVKK onayı (kayıt), izin açıklamaları (fotoğraf, mikrofon). Mağaza sayfası için gizlilik politikası adresi:
`<site>/kvkk`.
