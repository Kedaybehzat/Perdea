# Görev: Nav sayfaları iskeleti

**Durum:** Header nav'ında `/kesfet`, `/eslesme`, `/topluluk`, `/vizyon` linkleri var ama sayfalar yok → 404.
**Önce:** `core/durum.md`. (Bu görev bağımsız — Codex'e uygun.)

## Hedef
Her biri için en az placeholder sayfa, 404 kalkar, site gezilebilir olur.

## Yapılacak
Her yol için `app/<yol>/page.tsx` (server component):
```tsx
export default function KesfetPage() {
  return (
    <main className="min-h-screen px-6 py-20 bg-stone-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-stone-900 mb-4">Keşfet</h1>
        <p className="text-stone-600">Yakında — film/dizi/anime kataloğu burada olacak.</p>
      </div>
    </main>
  )
}
```
Her sayfanın başlık + "yakında" metnini içeriğe göre uyarla:
- `/kesfet` — "film/dizi/anime kataloğu" (ileride favori-puan buraya bağlanır, görev `favori-puan.md`)
- `/eslesme` — "zevkine göre eşleşme" (ileride `eslesme.md`) — bu sayfa KORUMALI olmalı (`route-koruma.md`)
- `/topluluk` — "tartışma / topluluk"
- `/vizyon` — "vizyondaki filmler / proje vizyonu" (hangisi? Ayberk'e sor, el kılavuzunda "vizyon takibi" lansman sonrası)

Tema: zümrüt/krem (`core/mimari.md`).

## Not
Varsa mevcut `YakindaSayfasi.tsx` reusable component'i kullan (el kılavuzunda geçiyordu) — tekrar yazma, onu çağır.

## Bitince
- `core/durum.md`: nav sayfaları [x].
- commit + push.
