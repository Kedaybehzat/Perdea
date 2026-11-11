const saatB = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" });
const gunB = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" });

export function saat(iso: string): string {
  return saatB.format(new Date(iso));
}

export function gun(iso: string): string {
  return gunB.format(new Date(iso));
}

// "3 dakika önce"
export function goreceli(iso: string): string {
  const sn = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sn < 45) return "şimdi";
  if (sn < 3600) return `${Math.round(sn / 60)} dk önce`;
  if (sn < 86400) return `${Math.round(sn / 3600)} sa önce`;
  if (sn < 86400 * 7) return `${Math.round(sn / 86400)} gün önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(iso));
}
