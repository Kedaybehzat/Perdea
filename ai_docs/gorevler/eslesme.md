# Görev: Eşleşme algoritması (Perdea'nın kalbi)

**Durum:** Henüz yok. Projenin ASIL fark yaratan özelliği. Favori+puan bitmeden başlanamaz (veri lazım).
**Önce:** `core/durum.md` + `core/sema.md` + `gorevler/favori-puan.md` (veri oradan gelir).
**ÖN KOŞUL:** `favori-puan.md` bitmiş, kullanıcıların `favorites`/`ratings` verisi dolmuş olmalı.

## Fikir
Kullanıcıları film/dizi/anime zevkine göre eşleştir. "Zevki uyuşan kişiyi bul."

## Tasarım kararları (başlamadan Ayberk ile netleştir)
1. **Benzerlik neyden hesaplanır?**
   - Ortak favoriler (basit: kaç ortak `movie_id`)
   - Puan korelasyonu (ileri: ortak filmlere verdikleri puanların benzerliği — cosine similarity / Pearson)
   - Başlangıç için **ortak favori sayısı + ortak puan yakınlığı** yeterli.
2. **Nerede hesaplanır?**
   - Basit: Supabase sorgusu / server action içinde JS ile (az kullanıcıda yeterli).
   - Ölçeklenince: Postgres fonksiyonu (SQL) ya da periyodik hesap (materialized view).
   - **Başlangıç: server-side JS.** Erken optimizasyon yapma.
3. **Nasıl sunulur?** `/eslesme` sayfasında (KORUMALI) — "sana en uygun kişiler" listesi, benzerlik skoru + ortak filmler.

## Başlangıç yaklaşımı (önerilen MVP)
```
1. Giriş yapan kullanıcının favori movie_id'lerini çek.
2. Aynı filmleri favorileyen DİĞER kullanıcıları bul (favorites tablosu, select herkese açık — RLS izin verir).
3. Her aday için: ortak favori sayısı hesapla.
4. (Varsa) ortak filmlere verilen puan farklarının ortalamasını ekle.
5. Skora göre sırala, en yüksek N kullanıcıyı göster.
```
Not: `select` policy'leri `using(true)` olduğu için başkalarının favori/puanını OKUMAK serbest — eşleşme motoru tam bunun için böyle tasarlandı.

## Sonraki adımlar (MVP sonrası)
- Cosine similarity ile daha isabetli skor.
- Anime/dizi/film ayrı ağırlık.
- Eşleşen kişiyle sohbet (el kılavuzunda Modül 8).

## Bitince
- `core/durum.md`: eşleşme [x] + seçilen benzerlik metriğini not et.
- commit + push.
