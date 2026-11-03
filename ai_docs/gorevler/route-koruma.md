# Görev: Route koruma (giriş zorunlu sayfalar)

**Durum:** `/profil`, ileride `/eslesme` gibi sayfalar girişsiz de açılabiliyor. Korunmalı.
**Önce:** `core/durum.md`. `lib/supabase/middleware.ts` ve `proxy.ts`'e bakılacak.

## İki yöntem (ikisi de olur, 1 önerilir)

### Yöntem 1 — sayfa içinde (basit, net, önerilen başlangıç)
Her korumalı server component'in başında:
```ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/giris')
```
Profil sayfası zaten bunu yapıyor. Diğer korumalılara da ekle. Artı: açık, sayfa-bazlı.

### Yöntem 2 — merkezi (proxy/middleware)
`lib/supabase/middleware.ts` → `updateSession` içinde zaten `await supabase.auth.getUser()` var. Sonucuna göre yönlendir:
```ts
const { data: { user } } = await supabase.auth.getUser()
const korumali = ['/profil', '/eslesme']           // genişletilebilir
const path = request.nextUrl.pathname
if (!user && korumali.some(p => path.startsWith(p))) {
  const url = request.nextUrl.clone(); url.pathname = '/giris'
  return NextResponse.redirect(url)
}
```
Mevcut `supabaseResponse` return'ünü bozma — redirect'i getUser'dan SONRA, return'den önce ekle. Artı: tek yerden tüm korumalı yollar.

## Karar
Başta **Yöntem 1** (sayfa içi) yeterli ve net. Korunacak sayfa çoğalınca Yöntem 2'ye geç.

## Bitince
- `core/durum.md`: route koruma [x].
- commit + push.
