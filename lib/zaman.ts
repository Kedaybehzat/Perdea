// Tarih/saat gösterimi — her zaman Türkiye saatiyle (sunucu UTC'de çalışsa bile).
const TZ = "Europe/Istanbul";

export function tarihUzun(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

export function saat(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function tarihKisa(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TZ, day: "numeric", month: "short", year: "numeric",
  }).format(new Date(iso));
}

// Bilet koçanı için parçalar: { gun: "14", ay: "KAS", haftaGunu: "Cumartesi" }
export function tarihParcalari(iso: string): { gun: string; ay: string; haftaGunu: string } {
  const d = new Date(iso);
  const gun = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric" }).format(d);
  const ay = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, month: "short" })
    .format(d).replace(".", "").toLocaleUpperCase("tr-TR");
  const haftaGunu = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, weekday: "long" }).format(d);
  return { gun, ay, haftaGunu };
}

// "3 gün sonra", "2 saat önce"
export function goreceli(iso: string, simdi: Date = new Date()): string {
  const farkSn = Math.round((new Date(iso).getTime() - simdi.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
  const mutlak = Math.abs(farkSn);
  if (mutlak < 60) return rtf.format(Math.round(farkSn), "second");
  if (mutlak < 3600) return rtf.format(Math.round(farkSn / 60), "minute");
  if (mutlak < 86400) return rtf.format(Math.round(farkSn / 3600), "hour");
  if (mutlak < 86400 * 30) return rtf.format(Math.round(farkSn / 86400), "day");
  return rtf.format(Math.round(farkSn / (86400 * 30)), "month");
}

// <input type="datetime-local"> değeri ("2026-11-21T19:30") Türkiye saati kabul
// edilip ISO'ya çevrilir. Türkiye yıl boyu UTC+3.
export function yerelGirdidenIso(deger: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deger)) return null;
  const d = new Date(`${deger}:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Verilen an geçmişte mi?
export function gectiMi(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

// <input type="datetime-local" min=…> için: şu andan `saatSonra` saat sonrası,
// Türkiye saatiyle (UTC+3) "YYYY-MM-DDTHH:mm".
export function yerelGirdiEnErken(saatSonra = 1): string {
  return new Date(Date.now() + (saatSonra + 3) * 60 * 60 * 1000).toISOString().slice(0, 16);
}
