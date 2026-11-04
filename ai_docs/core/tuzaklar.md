# Tuzaklar — bir şey patlayınca buraya bak

## ⚠️ Supabase projesi inaktif → DNS bile çözülmez
Free tier proje haftalarca kullanılmazsa önce duraklatılır, uzun süre sonra silinir. Belirti: `getUser()` request'inde dev server sonsuza dek takılır, sayfa açılmaz; başka terminalde:
```bash
curl -I https://<proje_id>.supabase.co
# → curl: (6) Could not resolve host
```
Çözüm: Supabase dashboard'a gir → proje paused ise "Restore", silinmişse yeni proje aç + `docs/schema.sql`'i SQL Editor'de koştur + `.env.local`'daki URL/anon key'i yenile + `npm run dev`'i yeniden başlat. Bu çözülmeden `/` bile açılmaz çünkü `proxy.ts` her request'te `updateSession → getUser` çağırıyor.

## ⚠️ Desktop iCloud sync → "Slow filesystem detected"
Proje `~/Desktop/...` altında ve Desktop iCloud'a senkron. `.next/dev` her yazımda iCloud sync bekler → Next uyarır:
```
⚠ Slow filesystem detected. The benchmark took 32395ms.
```
**distDir denemedim yapma:** Next `distDir`'ın proje dışına çıkmasına izin vermiyor; absolute path verince klasörü proje içine kopyalayıp `Users/ayberkalkan/.cache/...` diye nested dizin açıyor.
**İlk deneme (yanlış — yapma):** `.next`'i `~/.cache/perdea2-next-dev`'e symlink'ledim. Turbopack chunk'larda absolute path baked, Node modül çözümü oradan `~/node_modules/next`'i aradı, bulamadı → `Failed to load external module next/dist/build/adapter/setup-node-env.external.js`.
**Çözüm (uygulandı):** iCloud'un `.nosync` uzantılı klasörleri sync etmediğinden yararlan — `.next`'i proje içindeki `.next.nosync`'e symlink. Proje içinde kaldığı için modül çözümü doğru node_modules'u bulur.
```bash
rm -rf .next
mkdir .next.nosync
ln -sfn .next.nosync .next
```
Her clone'dan sonra tekrar yapman gerekir (ikisi de gitignored). Kalıcı çözüm: projeyi `~/dev/perdea2` gibi iCloud'suz bir yere taşı.

## ⚠️ next/font/google Türkiye'den bazen takılır
`layout.tsx`'te `next/font/google` ile Geist çekilince, Türkiye'deki bazı ağlarda fonts.googleapis.com'a request yapılamıyor → ilk sayfa render'ı sonsuza kadar bekler. Çözüm (uygulandı): Geist kaldırıldı, sistem font stack'ine geçildi (globals.css). Geist'i geri istersen `next/font/local` + Geist'in ttf/woff dosyalarını `public/fonts/`'a koyma yoluna gidilebilir.

## ⚠️ EN KRİTİK: "Confirm email" şu an KAPALI
Supabase → Auth → Sign In/Providers → Email → "Confirm email" test için kapalı.
**Açılırsa 2 adımlı kayıt BOZULUR:** `signUp` sonrası kullanıcı onaylayana kadar session kurulmaz → `auth.uid()` null → `users` insert'i RLS'e takılır ("new row violates row-level security policy").
Canlıdan önce çözüm (birini seç): (a) email onayı sonrası profil oluştur, (b) DB trigger: `auth.users` insert → `public.users` otomatik satır, (c) server-side `service_role` ile insert (RLS bypass, dikkatli).

## service_role key
ASLA client'a / `NEXT_PUBLIC_` env'e / git'e koyma. RLS'i bypass eder. Sadece anon/publishable key kullanılıyor (RLS'e tabi, güvenli).

## .env.local
Gitignored (doğru). İçinde `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Değiştirince `npm run dev` YENİDEN BAŞLAT — env sadece başlangıçta okunur.
URL formatı tam olmalı: `https://qryjifkmxplsjenamnhp.supabase.co` (başta `https://`, sonda `.supabase.co`, fazla karakter yok).

## "Cannot find module '@/lib/...'"
Genelde dosya yanlış klasörde ya da boş/export'suz. `ls -la <klasör>` ile gerçek yeri doğrula (VS Code ağacı yanıltabilir). Dosya doluysa: `Cmd+Shift+P → TypeScript: Restart TS Server`.

## Hydration mismatch (`bis_skin_checked`)
Bitdefender tarayıcı eklentisinden, KODLA İLGİSİZ, zararsız. İstenirse `<body suppressHydrationWarning>`.

## Node.js 20 deprecated
Supabase 22+ istiyor. Çalışıyor ama uyarı veriyor. Canlı öncesi 22'ye çık.

## next dev port
3000 doluysa 3001'e geçer / "another dev server running" derse: eski PID'i `kill <pid>` et, tek instance çalıştır.

## Şema
Tek sefer basıldı. Tekrar `create table` → "already exists". Değişiklik `alter table` ile.
