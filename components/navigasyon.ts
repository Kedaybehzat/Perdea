// Tek kaynak: header, mobil menü ve footer aynı listeyi kullanır.
export type NavLinki = { href: string; etiket: string; aciklama?: string };

export const anaNav: NavLinki[] = [
  { href: "/kesfet", etiket: "Keşfet" },
  { href: "/vizyon", etiket: "Vizyon" },
  { href: "/salonlar", etiket: "Salonlar" },
  { href: "/eslesme", etiket: "Eşleş" },
  { href: "/oyun", etiket: "Oyun" },
  { href: "/cosplay", etiket: "Cosplay" },
];

export const toplulukNav: NavLinki[] = [
  { href: "/topluluk", etiket: "Akış", aciklama: "Topluluktan son paylaşımlar" },
  { href: "/baslik", etiket: "Başlıklar", aciklama: "Bir yapım, bir başlık, altı entry" },
  { href: "/sohbet", etiket: "Sohbetler", aciklama: "Eşleştiklerinle birebir" },
];

export function aktifMi(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
