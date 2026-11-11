# Sohbet medyası · Bildirimler · KVKK

**Durum:** BİTTİ (11 Kas 2026). Şema: `docs/migrations/2026-11-11c_medya_bildirim_kvkk.sql` (idempotent; a ve b'den sonra).

## Sohbet medyası (fotoğraf + ses)
- Dosyalar Supabase Storage'da **özel** kova `sohbet-medya`. Yol: `<sohbet_id>/<gönderen_id>/<rastgele>.<uzantı>`. Storage RLS: yalnızca sohbetin tarafları okur, kişi yalnızca kendi klasörüne yükler (`_sohbet_tarafi`).
- Akış: tarayıcı dosyayı doğrudan Storage'a yükler (`app/sohbet/[id]/medya.ts` → `medyaYukle`) → server action `medyaGonderAction` → RPC `medya_mesaji_gonder(sohbet, tur, yol, sure)` (yolu regex ile doğrular).
- Görüntüleme: `lib/sohbet.ts` → `mesajlariGetir` sunucuda 1 saatlik imzalı adres üretir (`medya_url`). Kova public DEĞİL; public yapma.
- Fotoğraf: tarayıcıda en çok 1600 px JPEG'e küçültülür (EXIF/konum da silinir). Ses: `MediaRecorder`, en çok 120 sn; Chrome/Firefox `audio/webm`, Safari `audio/mp4`.
- `mesajlar.tur`: `metin | gorsel | ses`. Yüklemeyi `ArrayBuffer` + `contentType` ile yap (Blob verince storage-js multipart'a sarıyor).
- Eksik: hesap/sohbet silinince Storage'daki dosyalar silinmiyor (yetim kalır); temizlik işi yazılmalı. Medya moderasyonu yok.

## Bildirimler
- Tablo `bildirimler`; satırları YALNIZCA tetikleyiciler yazar (`_bildir`): `eslesme`, `entry_begeni`, `gonderi_begeni`, `baslik_entry`, `bulusma_katilim`. Yeni tür eklerken: tablo check'i + tetikleyici + `lib/bildirim.ts` (`BildirimTuru`, `bildirimMetni`) + `app/bildirimler/page.tsx` (`simgeler`).
- Mesajlar bildirim satırı üretmez; okunmamış mesaj sayısı ayrı (`okunmamis_sayisi`). İkisi tek çağrıda: RPC `bildirim_ozeti()` → `{mesaj, bildirim}`.
- `components/CanliBildirim.tsx` (Header içinde, girişliyken): 25 sn'de bir yoklar, sekme başlığına `(n)` yazar, sayı değişince `router.refresh()`, izin varsa ve sekme arkadaysa tarayıcı `Notification` gösterir. İzin düğmesi: `app/bildirimler/IzinDugmesi.tsx`.
- **Site kapalıyken bildirim (push) YOK.** Web Push/servis işçisi kurulmadı; mobil uygulamayla birlikte ele alınacak.

## KVKK
- Sayfalar: `/kvkk` (aydınlatma metni), `/kosullar`. Ortak kabuk `components/YasalSayfa.tsx`, sabitler `lib/yasal.ts`.
- Kayıt: `onay` kutusu zorunlu (18+ beyanı + koşullar + yurt dışı aktarım açık rızası). Sunucuda da denetlenir (`app/kayit/actions.ts`); zaman `users.kvkk_onay_at`.
- Hesap silme: `/profil/duzenle#hesabi-sil` → `hesabiSil` action → RPC `hesabimi_sil()` (`users` + `auth.users` satırını siler, cascade ile her şey gider).
