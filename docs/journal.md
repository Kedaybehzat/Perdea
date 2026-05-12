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