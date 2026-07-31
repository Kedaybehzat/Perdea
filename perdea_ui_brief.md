# Perdea — UI Tasarım Brief'i

> Bu doküman, Perdea platformunun görsel arayüzünü (UI mockup) oluşturmak için hazırlanmıştır.
> ChatGPT veya benzeri bir görsel tasarım aracına verilerek marka kimliğine uygun ekran tasarımları üretmek için kullanılır.

---

## 1. Perdea Nedir? (Bağlam)

**Perdea**, film, dizi ve anime severler için tasarlanmış **Türkçe bir sosyal eşleşme + topluluk + katalog platformudur.**

**Slogan:** *Zevkini paylaş, ruh eşini bul.*

**Tek cümlelik vizyon:** Bir sinefil şu an 5 ayrı yerde vakit geçiriyor — Beyazperde (haber), Letterboxd (puanlama), Discord (sohbet), Reddit (tartışma), Ekşi Sözlük (Türk dizi). Perdea hepsini tek çatı altında toplar.

**Ayırt edici özellik:** Zevk temelli **eşleşme algoritması** — kullanıcıları film/dizi/anime beğenilerine göre eşleştirir. (Letterboxd'da bile yok.)

**Hedef kitle:** Türkiye'deki sinefiller — düzenli film/dizi/anime izleyen, bunun üzerine konuşmak ve benzer zevkte insanlarla tanışmak isteyen kullanıcılar.

---

## 2. Marka Kimliği — GÖRSEL YÖN (En Kritik Bölüm)

Bu, tasarımın ruhudur. Tüm ekranlar bu hisse sadık kalmalı.

**Genel his:** *"Eski sinema afişleri" estetiği* — nostaljik ama modern, sıcak, sakin, tutkulu. Soğuk/teknoloji-ağırlıklı bir SaaS görünümü DEĞİL. Bir sinema kültürü platformu havası.

**Renk paleti (kesin — bunlara sadık kal):**
- Ana zemin: krem / hafif sıcak beyaz (#fafaf9)
- Kartlar: beyaz (#ffffff)
- Vurgu rengi: mat zümrüt yeşili (#059669 civarı) — butonlar, linkler, logo
- Ana metin: çok koyu gri, saf siyah değil (#1c1917)
- İkincil metin: orta gri (#57534e)
- Kenarlıklar: açık gri (#e7e5e4)
- İnce gölgeler, yumuşak köşeler (rounded), bol beyaz alan

**Tipografi:** Modern, temiz, okunaklı bir sans-serif (Geist / Inter benzeri). Başlıklar iri ve kendinden emin, gövde metni rahat okunur.

**Ton:**
- Türkçe her yerde (buton metinleri, başlıklar, etiketler — hepsi Türkçe)
- "Sen" dili (samimi, resmi değil)
- Sade ama tutkulu
- Emoji sınırlı — sadece anlamlı yerlerde

---

## 3. Kapsanacak Ekranlar

Aşağıdaki ekranların her biri için mockup üretilmesi isteniyor. Hepsi aynı marka kimliğini paylaşmalı.

### 3.1 — Anasayfa (Landing)
Giriş yapmamış ziyaretçinin gördüğü ilk ekran. Amacı: ne olduğunu anlatmak + kayıt olmaya ikna etmek.
- **Header (sticky):** Solda "Perdea" logosu (zümrüt). Ortada nav: *Keşfet | Eşleş | Topluluk | Vizyon*. Sağda: *Giriş* linki + *Kayıt Ol* butonu (zümrüt dolgulu).
- **Hero bölümü:** İri başlık ("Zevkini paylaş, ruh eşini bul" — iki parça iki renkli olabilir), altında kısa açıklama, iki buton (*Hemen Başla* dolgulu + *Nasıl Çalışır* çizgili).
- **Özellikler grid'i:** 3 kart yan yana — Eşleşme / Topluluk / Keşif. Her kartın küçük bir ikonu, başlığı, kısa açıklaması.
- **"Nasıl çalışır" bölümü:** 1-2-3 numaralı adımlar (Kaydol → Zevkini göster → Eşleş).
- **Alt CTA:** Zümrüt zeminli bir şerit — "Sinefil topluluğuna katıl" daveti + buton.
- **Footer:** 4 sütun (Perdea açıklama / Keşfet / Topluluk / Linkler). Altta küçük "Film verileri TMDB tarafından sağlanır" atıf metni.

### 3.2 — Kayıt Ol Ekranı
- Ortalanmış, sade bir kart form.
- Alanlar: E-posta, Parola, Kullanıcı adı.
- Büyük zümrüt "Kayıt Ol" butonu.
- Altında "Zaten hesabın var mı? Giriş yap" linki.
- Arka plan krem, form kartı beyaz, ince gölge.

### 3.3 — Giriş Ekranı
- Kayıt ekranıyla aynı stilde, daha kısa.
- Alanlar: E-posta, Parola.
- "Giriş Yap" butonu + "Hesabın yok mu? Kayıt ol" linki.

### 3.4 — Profil Sayfası (giriş yapmış kullanıcı)
Kullanıcının kendi profili. Perdea'nın kalbi.
- Üstte: profil fotoğrafı (avatar), kullanıcı adı, kısa bio ("korku filmi bağımlısı" gibi).
- **Favori Vitrini:** Öne çıkan 4 film/dizi/anime posteri yan yana — kullanıcının "en sevdiklerim" seçkisi. Görsel olarak en dikkat çeken bölüm bu olmalı (afiş estetiği burada parlar).
- Puanladığı içerikler listesi/grid'i (poster + verdiği puan rozeti).
- "Profili Düzenle" butonu.

### 3.5 — Keşfet Sayfası
Film/dizi/anime kataloğu.
- Üstte arama çubuğu + filtre (tür, yıl, kategori: film/dizi/anime).
- Poster grid'i (kartlar: afiş + başlık + puan).
- Bir poster kartına tıklayınca detay görünümü (afiş, özet, puan verme, favoriye ekleme butonları).

### 3.6 — Eşleş Sayfası (Ayırt edici özellik)
Zevk temelli eşleşme ekranı.
- Karşına çıkan bir kullanıcı kartı: avatar, kullanıcı adı, favori 4 içeriği, ortak zevk yüzdesi ("%87 uyum" gibi bir rozet).
- Beğen / geç butonları.
- Eşleşme olunca bir bildirim/kutlama hissi.

### 3.7 — Topluluk Sayfası
- Sohbet / tartışma akışı (basit hali — kartlar halinde gönderiler).
- Bir gönderi kartı: yazan kişi, içerik, hangi film/dizi hakkında.

---

## 4. Öncelik Sırası (MVP)

En önemli ekranlar (bunlar lansmanda olacak, mockup önceliği bunlara):
1. **Anasayfa** — ilk izlenim
2. **Kayıt / Giriş** — kullanıcı girişi
3. **Profil + favori vitrini** — kimlik
4. **Keşfet** — içerik puanlama
5. **Eşleş** — ayırt edici özellik

Daha sonraki ekranlar: Topluluk (basit hali), birebir sohbet.

---

## 5. Tasarım Yaparken DİKKAT

- **Türkçe kullan.** Tüm metinler, buton etiketleri, placeholder'lar Türkçe.
- **Afiş/poster estetiğini öne çıkar.** Bu bir sinema platformu — film posterleri görsel kimliğin merkezinde.
- **Krem + zümrüt paletine sadık kal.** Mavi/mor gibi tipik "tech startup" renklerine KAÇMA.
- **Sıcak ve sakin.** Agresif, kalabalık, bildirim-yoğun bir arayüz değil.
- **Responsive düşün.** Mobilde de iyi görünmeli (nav menüsü daralır, grid'ler tek/çift sütuna iner).
- **Placeholder görseller** için gerçekçi film afişleri kullanılabilir (jenerik gri kutu yerine).

---

## 6. ChatGPT'ye Verilecek Komut (kopyala-yapıştır)

> Aşağıdaki brief'e göre "Perdea" adlı Türkçe bir sinefil sosyal platformu için modern, yüksek kaliteli UI mockup'ları tasarla. Marka hissi: "eski sinema afişleri" estetiği — nostaljik ama modern, sıcak, sakin. Renk paleti: krem zemin (#fafaf9), beyaz kartlar, mat zümrüt yeşili vurgu (#059669), koyu gri metin. Türkçe arayüz, "sen" dili, sade ve tutkulu ton. Temiz sans-serif tipografi, yumuşak köşeler, bol beyaz alan, ince gölgeler. Tipik mavi/mor "tech startup" renklerinden kaçın.
>
> Şu ekranları tasarla: (1) Anasayfa — sticky header, hero, 3'lü özellik grid'i, nasıl çalışır adımları, alt CTA, footer. (2) Kayıt ve Giriş ekranları — ortalanmış sade form kartları. (3) Profil sayfası — avatar, bio, öne çıkan 4 favori posteri vitrini, puanlanan içerikler. (4) Keşfet — arama + filtre + poster grid'i. (5) Eşleş — kullanıcı kartı, ortak zevk yüzdesi rozeti, beğen/geç butonları.
>
> [Buraya bu dosyanın tamamını yapıştır]

---

*Perdea — Zevkini paylaş, ruh eşini bul.*
