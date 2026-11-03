# Mimari & Konvansiyonlar

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Supabase (Postgres+Auth) · Tailwind · lucide-react.
**Repo:** GitHub `Kedaybehzat/perdea2` · Lokal: `~/Desktop/perdea2`.

## Dosya yapısı
```
perdea2/
├─ .env.local            # GİZLİ, gitignored — NEXT_PUBLIC_SUPABASE_URL + _ANON_KEY
├─ proxy.ts              # kök — Next16'da middleware yerine proxy (codemod'lı). updateSession çağırır.
├─ app/
│  ├─ page.tsx           # anasayfa
│  ├─ layout.tsx         # RootLayout (Header+Footer, lang="tr")
│  ├─ kayit/{page.tsx, KayitFormu.tsx, actions.ts}   # page=server, Formu=client, actions=server
│  ├─ giris/{page.tsx, GirisFormu.tsx, actions.ts}
│  └─ auth/actions.ts    # cikisYap
├─ components/{Header.tsx(async, session okur), Footer.tsx, KarsilamaKarti.tsx}
├─ lib/
│  ├─ validation.ts      # saf doğrulama fonk. (Supabase'siz; string|null döndürür)
│  └─ supabase/{client.ts(browser), server.ts(server, cookie yazar), middleware.ts(updateSession)}
└─ docs/ (schema.sql, journal.md, perdea_el_kilavuzu.md, ai_docs/)
```

## Konvansiyonlar (yeni kod bunlara uysun)
- **Türkçe domain adları:** `kayitOl`, `girisYap`, `cikisYap`, `emailDogrula`... Fonksiyon küçük harf başlar; component büyük (`KayitFormu`, `Header`).
- **lib/ disiplini:** Supabase çağrıları/iş mantığı component'e dağıtılmaz, `lib/` üzerinden. Doğrulama `lib/validation.ts`'te.
- **Doğrulama zinciri:** `const hata = aDogrula() ?? bDogrula() ?? ...` (ilk hatayı yakalar; fonksiyonlar `string | null` döndürür).
- **Hata akışı:** action'da hata → `redirect('/<sayfa>?hata=' + encodeURIComponent(mesaj))`. Sayfa (server) `searchParams`'tan okur → client forma `hata` prop'u → kırmızı kutuda gösterir. **`?hata=`'daki `=` unutma.**
- **Form↔action köprüsü:** `<input name="x">` ↔ `formData.get('x')` birebir eşleşir.
- **Server vs Client:** veri okuyan/action çağıran sayfa = server component. Etkileşimli form (`useState`,`onClick`) = `'use client'`. Server component içindeki `<form action={serverAction}>` yine server action çağırabilir.
- **Supabase client seçimi:** server action/component → `lib/supabase/server.ts` `createClient()` (await'li). Client component → `lib/supabase/client.ts`.
- **Session okuma:** `const { data: { user } } = await supabase.auth.getUser()` → `user` null ise girişsiz.
- **Postgres hata kodu:** unique ihlali `23505` → kullanıcıya güzel mesaj.

## Tema (Tailwind)
Zümrüt + krem. Ana: `emerald-600/700`, zemin `stone-50/100`, kart `bg-white`/`stone-50`, metin `stone-900/600`, kenar `stone-200/300`. Hata kutusu: `bg-red-50 border-red-200 text-red-700`.
