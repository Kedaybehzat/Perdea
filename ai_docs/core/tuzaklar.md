# Tuzaklar — bir şey patlayınca buraya bak

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
