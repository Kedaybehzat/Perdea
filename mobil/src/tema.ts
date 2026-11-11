// Perdea'nın görsel dili (web'deki app/globals.css ile aynı değerler).
export const renk = {
  krem: "#faf7f0",
  kagit: "#ffffff",
  kum: "#f1ece1",
  cizgi: "#e7e0d2",
  cizgiKoyu: "#d6ccb8",
  yazi: "#1c1917",
  yaziOrta: "#57534e",
  yaziSoluk: "#8a8279",
  zumrut: "#059669",
  zumrutKoyu: "#047857",
  zumrutAcik: "#d1fae5",
  zumrutSoluk: "#ecfdf5",
  nane: "#6ee7b7",
  perde700: "#0a5c48",
  perde800: "#064e3b",
  perde900: "#053c30",
  perde950: "#032720",
  altin: "#d9a441",
  altinKoyu: "#a16207",
  gul: "#e11d48",
  gulSoluk: "#fff1f2",
} as const;

export const yazi = {
  baslik: "Fraunces_700Bold",
  baslikEgik: "Fraunces_700Bold_Italic",
  govde: "Figtree_400Regular",
  orta: "Figtree_500Medium",
  yariKalin: "Figtree_600SemiBold",
  kalin: "Figtree_700Bold",
} as const;

export const bosluk = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;
export const kose = { s: 10, m: 14, l: 20, xl: 28 } as const;

export const golge = {
  shadowColor: "#032720",
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
} as const;

// Türkçe büyük harf ("için" → "İÇİN"). React Native'in textTransform'u bunu yanlış yapıyor.
export const buyuk = (metin: string) => metin.toLocaleUpperCase("tr-TR");
