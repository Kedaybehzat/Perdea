# Perdea — Geliştirme Günlüğü

## Modül 0 — Hazırlık (12 Mayıs 2026)

### Ne yaptım?
- Proje klasörünü oluşturdum (`perdea2`)
- Git init ile repository başlattım
- README.md yazdım
- İlk commit'i yaptım
- Git kimliğimi global olarak ayarladım (Ayberk Alkan + Gmail)
- GitHub'da `Kedaybehzat/Perdea` repo'sunu açtım
- Yerel projeyi remote'a bağladım (`git remote add origin ...`)
- İlk push'u yaptım
- .gitignore dosyası oluşturup commit ettim

### Ne öğrendim?
- Git'te commit'ler **değişmez**, "amend" aslında yeni commit yapar
- `staging area` (sahne alanı) `git add` ile dosyaları takibe alıp commit'e hazırlar
- `origin` uzak depoya verilen konvansiyonel isim
- `git push -u` upstream'i kalıcı olarak ayarlar, sonraki push'lar sade olur
- `.gitignore` sadece henüz takip edilmeyen dosyalar için işe yarar — zaten commit edilmişse `git rm --cached` lazım
- TR ISS'leri bazen Git HTTPS push'unu sıfırlıyor → `http.postBuffer` büyüt + HTTP/1.1'e geç çözüm

### Takıldığım yerler
- `git push` ilk denemede "Connection reset by peer" hatası verdi, ikinci denemede geçti
- Daha sonra ikinci kez aynı hata geldi, HTTP buffer + HTTP/1.1 ayarlarıyla çözdüm

### Sonraki adım
Modül 1 — Next.js Temelleri: React'in mantığını öğrenme, ilk Next.js projesini oluşturma

## Modül 1 — Next.js Temelleri (20 Temmuz 2026)

### Ne yaptım?
- Next.js 16 projesi kurdum (`create-next-app` ile, TypeScript + Tailwind + App Router + Turbopack)
- Proje yapısını inceledim: `app/`, `components/`, `public/`, `package.json`
- Dev sunucusunu çalıştırdım (`npm run dev` → `localhost:3000`)
- Hot reload'u gördüm — kodu değiştir, tarayıcı otomatik yenilenir
- Metadata'yı ve `lang="tr"` bilgisini Türkçeleştirdim
- Dosya tabanlı routing ile `/hakkimizda` ve `/iletisim` sayfaları ekledim
- İlk component'imi yazdım: `<KarsilamaKarti>` (props ile veri geçtim)
- İlk stateful component'imi yazdım: `<Sayac>` (useState ile durum yönettim)

### Ne öğrendim?
- Next.js App Router'da **klasör yapısı = URL yapısı** (page.tsx sihirli isim)
- Component = JSX döndüren, `export default` olan bir fonksiyon
- Props ile component'e dışarıdan veri geçirilir, TypeScript tipini `type` ile tanımlarız
- **Server Component vs Client Component** ayrımı:
  - Varsayılan: Server Component (hızlı, SEO'ya iyi, ama state yok)
  - `"use client"` yazınca: Client Component (state, event var, tarayıcıda çalışır)
- `useState(başlangıç_değeri)` state oluşturur, `[değer, setterFonksiyon]` şeklinde ayırırız
- `useState` her tür değeri tutabilir: sayı, string, boolean, dizi, obje
- Event handler'da fonksiyon geçilir: `onClick={() => setSayi(sayi + 1)}`
- Direkt `onClick={setSayi(sayi + 1)}` yazmak = sonsuz döngü hatası
- Component'ler PascalCase adlandırılır (`KarsilamaKarti.tsx`)
- `@/` = projenin kök klasörü (import alias, `tsconfig.json`'da tanımlı)

### Takıldığım yerler
- Dosya uzantısını `.txs` olarak yanlış yazdım, TypeScript modülü bulamadı → `.tsx`'e düzelttik
- İki farklı klasörde iki `page.tsx` olması ilk başta karıştırıcı geldi, sonra kural netleşti
- Uzun bir aradan sonra döndüğümde `npm run dev` sessizce takıldı → `rm -rf node_modules .next` sonra `npm install` ile çözdüm
- `useState`'in mantığını "sayaç" örneğinde soyut buldum, "beğeni butonu" gibi Perdea'ya yakın örneklerle daha iyi oturdu

## Modül 2 — Tailwind ve UI Tasarımı (20 Temmuz 2026 — devam ediyor)

### Şimdiye kadar yapıldı
- Marka kimliği kararı: zümrüt yeşili + krem tonu ("eski sinema afişleri" hissi)
- `app/globals.css` CSS değişkenleriyle tema kuruldu
- `page.tsx`, `KarsilamaKarti.tsx`, `Sayac.tsx` yeni temaya uydu
- Kartlar beyaza döndü, gölge + hover efektleri eklendi
- Zümrüt vurgu rengi butonlar ve başlıklarda

## Modül 2 — Tailwind ve UI Tasarımı (22 Temmuz 2026)

### Ne yaptım?
- Marka kimliği kararı: zümrüt yeşili + krem tonu ("eski sinema afişleri" hissi)
- CSS değişkenleriyle merkezi tema kurdum (app/globals.css)
- Header component'i: logo + navigasyon (Keşfet, Eşleş, Topluluk, Vizyon) + Giriş/Kayıt butonları, sticky yaptım
- Footer component'i: 4 sütunlu, telif + TMDB atıf
- YakindaSayfasi reusable component'i yazdım — 4 farklı placeholder sayfayı besliyor
- 4 placeholder sayfa açtım (/kesfet, /eslesme, /topluluk, /vizyon)
- Anasayfayı tamamen yeniden tasarladım: hero + özellikler grid + nasıl çalışır + alt CTA
- Öğrenme örneklerini (Sayac) ana sayfadan kaldırdım

### Ne öğrendim?
- Next.js layout.tsx'i her sayfada otomatik saran iskelet — Header/Footer buraya konur
- Tailwind grid sistemi (grid-cols-2 md:grid-cols-4) responsive tasarımı çok kolaylaştırıyor
- `flex-1` ve `mt-auto` Flexbox trickleri — footer'ı sayfa altına yapıştırma
- Bir component farklı props ile 4-5 sayfada kullanılabilir (YakindaSayfasi)
- CSS değişkenleriyle merkezi renk yönetimi — bir yerden değiştir, her yer güncellenir
- İyi bir "coming soon" sayfası e-posta toplamaz, hesap açma yönlendirir

### Ürün kararları
- Kimlik: Beyazperde + Letterboxd + Discord birleşimi (üç rakibi tek çatı)
- Header linkleri Faz 1-3'ü temsil ediyor (Keşfet=katalog, Eşleş=eşleşme, Topluluk=grup/forum, Vizyon=takvim/haber)
- Placeholder sayfalar e-posta toplamaz, sadelik + kayıt yönlendirmesi

### Takıldığım yerler
- Dosya adını .txs yazdım (geçmişteki hata tekrarı) → .tsx düzelttik
- Terminal 404 hatasını yanlış anladım (aslında sadece test tıklaması) — hata mesajlarını okumaya alışacağım
- Uzun aradan sonra sunucu takıldı → node_modules + .next silip npm install ile çözdüm

### Sonraki adım
Modül 3 — Supabase ve Veritabanı: Kayıt/giriş sistemi, kullanıcı tablosu, ilk gerçek veri