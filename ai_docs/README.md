# Perdea — AI Ajan Yönlendirici (ÖNCE BUNU OKU)

Bu klasör, terminalden çalışan ajanlar (Claude Code / Codex) içindir.
**Token tasarrufu kuralı:** TÜM dosyaları okuma. Bu README'yi oku, sonra SADECE
yapacağın işe ait dosyayı oku. Her görev dosyası kendi kendine yeter.

## Her oturumda bu sırayla:
1. Bu README (buradasın).
2. `core/durum.md` — en güncel durum, ne bitti ne kaldı (KISA, hep oku).
3. Sonra SADECE yapacağın göreve ait dosyayı oku (aşağıdaki tablo).
4. Şema/RLS'e dokunacaksan `core/sema.md`. Takılırsan `core/tuzaklar.md`.

Çoğu görev için: README + `core/durum.md` + `gorevler/<görev>.md` yeter. Bu kadar.

## Klasör haritası
```
ai_docs/
├─ README.md            ← buradasın (yönlendirici)
├─ core/
│  ├─ durum.md          ← güncel durum + kalan iş listesi (HEP OKU)
│  ├─ mimari.md         ← stack, dosya yapısı, konvansiyonlar (yeni kod yazarken)
│  ├─ sema.md           ← DB şeması + RLS (DB'ye dokununca)
│  └─ tuzaklar.md       ← bilinen tuzaklar (bir şey patlayınca)
└─ gorevler/
   ├─ profil.md
   ├─ route-koruma.md
   ├─ nav-sayfalari.md
   ├─ favori-puan.md
   ├─ eslesme.md
   ├─ baslik.md          ← ekşi/twitter tarzı başlık + entry
   ├─ ozel-chat.md       ← birebir mesajlaşma (friendships + conversations + messages)
   └─ karakter-oyunu.md  ← "ben kimim?" oyunu (sohbetin üstüne biner)
```

## Hangi iş → hangi dosya
| Yapacağın iş | Oku |
|---|---|
| Profil sayfası | `core/durum.md` + `gorevler/profil.md` |
| Giriş zorunlu sayfa koruma | `core/durum.md` + `gorevler/route-koruma.md` |
| Boş nav sayfaları (keşfet/eşleş/topluluk/vizyon) | `core/durum.md` + `gorevler/nav-sayfalari.md` |
| Favori ekleme / puan verme | `core/durum.md` + `gorevler/favori-puan.md` + `core/sema.md` |
| Eşleşme algoritması | `core/durum.md` + `gorevler/eslesme.md` + `core/sema.md` |
| Başlık + entry (ekşi/twitter) | `core/durum.md` + `gorevler/baslik.md` + `core/sema.md` |
| Birebir sohbet | `core/durum.md` + `gorevler/ozel-chat.md` + `core/sema.md` |
| Karakter / "ben kimim?" oyunu | `core/durum.md` + `gorevler/karakter-oyunu.md` + `gorevler/ozel-chat.md` |
| Yeni kod / yapıyı öğrenme | `core/mimari.md` |
| Bir şey patladı / garip hata | `core/tuzaklar.md` |

## Çalışma kuralları (kısa)
- **Öğretici mod YOK.** Direkt yaz, bitir. Kullanıcı (Ayberk) test eder.
- **İki ajan dönüşümlü** (Claude + Codex), eş zamanlı değil.
- **El değiştirme:** bırakmadan `git add . && git commit && git push`; başlarken `git pull`.
- **İş bitince:** `core/durum.md`'deki kalan-iş listesini güncelle (biteni işaretle).
- Domain adları Türkçe (`kayitOl`, `girisYap`...). Detay: `core/mimari.md`.
