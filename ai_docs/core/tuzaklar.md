# Tuzaklar — bir şey patlayınca buraya bak

## ⚠️ Supabase projesi inaktif → DNS bile çözülmez
Free tier proje haftalarca kullanılmazsa önce duraklatılır, uzun süre sonra silinir. Belirti: `getUser()` request'inde dev server sonsuza dek takılır, sayfa açılmaz; başka terminalde:
```bash
curl -I https://<proje_id>.supabase.co
# → curl: (6) Could not resolve host
```
Çözüm: Supabase dashboard'a gir → proje paused ise "Restore", silinmişse yeni proje aç + `docs/schema.sql`'i SQL Editor'de koştur + `.env.local`'daki URL/anon key'i yenile + `npm run dev`'i yeniden başlat. Bu çözülmeden `/` bile açılmaz çünkü `proxy.ts` her request'te `updateSession → getUser` çağırıyor.

## ⚠️ Desktop iCloud sync → "Slow filesystem detected" [KALICI ÇÖZÜLDÜ 2026-11-04]
**Proje artık `~/dev/perdea2`'de (iCloud'suz).** Eski `~/Desktop/projects/perdea2` hâlâ orada ama kullanma. Şu an dev sorunsuz, config temiz (`.next` default konumunda).

Bunu bir kez çekip bir de bakma, denediğimiz 3 yanlış çözüm (bir daha yapma):
- `distDir` absolute path: Next proje dışına izin vermiyor, `Users/ayberkalkan/.cache/...` diye nested klasör açıyor.
- `.next` → `~/.cache/perdea2-next-dev` symlink: Turbopack chunk'larda cache'in gerçek yolunu baked, Node modül çözümü oradan `~/node_modules/next` arayıp bulamadı → `Failed to load external module .../setup-node-env.external.js`.
- `.next` → `.next.nosync` (proje içi) symlink: iCloud'un `.nosync` uzantısını sync etmemesi kuralı; çalıştı ama projeyi taşımak daha temiz.

Eski Desktop klasörünü güvende hissedince sil:
```bash
rm -rf ~/Desktop/projects/perdea2
```

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
