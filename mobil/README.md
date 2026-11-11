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

## Mağazaya çıkarmak (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android   # .aab üretir (Google Play)
npx eas-cli@latest build --platform ios       # Apple Developer hesabı gerekir
npx eas-cli@latest submit
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

## Henüz yok (sıradaki tur)

Salon puanları, Ben Kimim? odaları, cosplay buluşmaları, başlıklar, bildirimler (push), sohbette fotoğraf/ses
gönderme, profil düzenleme. Bunlar şimdilik web'de.
