// Temel yapı taşları: yazı, düğme, giriş alanı, avatar, boş durum.
import { Image } from "expo-image";
import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { bosluk, buyuk, kose, renk, yazi } from "@/tema";

type Tur = "baslik" | "altBaslik" | "govde" | "kucuk" | "etiket";

// Etiketler Türkçe büyük harfle yazılır; "{ad} soruyor" gibi parçalı metinleri de birleştirir.
function etiketMetni(children: ReactNode): ReactNode {
  if (typeof children === "string") return buyuk(children);
  if (Array.isArray(children) && children.every((c) => typeof c === "string" || typeof c === "number")) {
    return buyuk(children.join(""));
  }
  return children;
}

export function Metin({
  tur = "govde",
  renk: r,
  style,
  children,
  ...kalan
}: TextProps & { tur?: Tur; renk?: string }) {
  return (
    <Text {...kalan} style={[s[tur], r ? { color: r } : null, style]}>
      {tur === "etiket" ? etiketMetni(children) : children}
    </Text>
  );
}

export function Dugme({
  children,
  onPress,
  tur = "dolu",
  bekliyor = false,
  devreDisi = false,
  ikon: Ikon,
  style,
  erisimEtiketi,
}: {
  children?: ReactNode;
  onPress?: () => void;
  tur?: "dolu" | "cizgi" | "altin" | "tehlike";
  bekliyor?: boolean;
  devreDisi?: boolean;
  ikon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  erisimEtiketi?: string;
}) {
  const kapali = devreDisi || bekliyor;
  const yaziRengi =
    tur === "cizgi" ? renk.yazi : tur === "altin" ? renk.perde950 : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={kapali}
      accessibilityRole="button"
      accessibilityLabel={erisimEtiketi}
      accessibilityState={{ disabled: kapali, busy: bekliyor }}
      style={({ pressed }) => [
        s.dugme,
        tur === "dolu" && { backgroundColor: renk.zumrut },
        tur === "altin" && { backgroundColor: renk.altin },
        tur === "tehlike" && { backgroundColor: renk.gul },
        tur === "cizgi" && { backgroundColor: renk.kagit, borderWidth: 1, borderColor: renk.cizgiKoyu },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        kapali && { opacity: 0.55 },
        style,
      ]}
    >
      {bekliyor ? (
        <ActivityIndicator color={yaziRengi} />
      ) : (
        <>
          {Ikon ? <Ikon size={18} color={yaziRengi} /> : null}
          {children ? <Text style={[s.dugmeYazi, { color: yaziRengi }]}>{children}</Text> : null}
        </>
      )}
    </Pressable>
  );
}

export function Alan({ etiket, ipucu, style, ...kalan }: TextInputProps & { etiket?: string; ipucu?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {etiket ? <Text style={s.alanEtiket}>{etiket}</Text> : null}
      <TextInput
        placeholderTextColor={renk.yaziSoluk}
        accessibilityLabel={etiket ?? kalan.placeholder}
        {...kalan}
        style={[s.alan, style as StyleProp<TextStyle>]}
      />
      {ipucu ? <Text style={s.ipucu}>{ipucu}</Text> : null}
    </View>
  );
}

const TONLAR = [
  ["#d1fae5", "#065f46"],
  ["#e0f2fe", "#075985"],
  ["#fef3c7", "#92400e"],
  ["#ffe4e6", "#9f1239"],
  ["#ede9fe", "#5b21b6"],
] as const;

export function Avatar({ ad, url, boyut = 44 }: { ad: string; url?: string | null; boyut?: number }) {
  let h = 0;
  for (const c of ad) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [zemin, harf] = TONLAR[h % TONLAR.length];
  const ortak = { width: boyut, height: boyut, borderRadius: boyut / 2 };
  if (url) {
    return <Image source={{ uri: url }} style={[ortak, { backgroundColor: renk.kum }]} contentFit="cover" />;
  }
  return (
    <View style={[ortak, { backgroundColor: zemin, alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ fontFamily: yazi.kalin, fontSize: boyut * 0.4, color: harf }}>
        {(ad.trim()[0] ?? "?").toLocaleUpperCase("tr-TR")}
      </Text>
    </View>
  );
}

export function BosDurum({
  ikon: Ikon,
  baslik,
  aciklama,
  children,
}: {
  ikon: LucideIcon;
  baslik: string;
  aciklama?: string;
  children?: ReactNode;
}) {
  return (
    <View style={s.bos}>
      <View style={s.bosIkon}>
        <Ikon size={26} color={renk.zumrutKoyu} />
      </View>
      <Metin tur="altBaslik" style={{ textAlign: "center" }}>
        {baslik}
      </Metin>
      {aciklama ? (
        <Metin renk={renk.yaziOrta} style={{ textAlign: "center" }}>
          {aciklama}
        </Metin>
      ) : null}
      {children}
    </View>
  );
}

export function Yukleniyor() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: bosluk.xxl }}>
      <ActivityIndicator color={renk.zumrut} size="large" />
    </View>
  );
}

export function HataKutusu({ mesaj }: { mesaj?: string | null }) {
  if (!mesaj) return null;
  return (
    <View accessibilityRole="alert" style={s.hata}>
      <Text style={{ fontFamily: yazi.orta, color: "#9f1239", fontSize: 14, lineHeight: 20 }}>{mesaj}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  baslik: { fontFamily: yazi.baslik, fontSize: 34, lineHeight: 38, color: renk.yazi, letterSpacing: -0.5 },
  altBaslik: { fontFamily: yazi.baslik, fontSize: 22, lineHeight: 27, color: renk.yazi, letterSpacing: -0.2 },
  govde: { fontFamily: yazi.govde, fontSize: 16, lineHeight: 23, color: renk.yazi },
  kucuk: { fontFamily: yazi.govde, fontSize: 13, lineHeight: 18, color: renk.yaziOrta },
  etiket: {
    fontFamily: yazi.kalin,
    fontSize: 11,
    letterSpacing: 2,
    color: renk.zumrutKoyu,
  },
  dugme: {
    minHeight: 50,
    paddingHorizontal: bosluk.xl,
    borderRadius: kose.m,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: bosluk.s,
  },
  dugmeYazi: { fontFamily: yazi.yariKalin, fontSize: 16 },
  alanEtiket: { fontFamily: yazi.orta, fontSize: 14, color: renk.yazi },
  alan: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: renk.cizgiKoyu,
    borderRadius: kose.m,
    backgroundColor: renk.kagit,
    paddingHorizontal: bosluk.l,
    paddingVertical: bosluk.m,
    fontFamily: yazi.govde,
    fontSize: 16,
    color: renk.yazi,
  },
  ipucu: { fontFamily: yazi.govde, fontSize: 12, color: renk.yaziSoluk },
  bos: {
    alignItems: "center",
    gap: bosluk.m,
    paddingVertical: bosluk.xxl,
    paddingHorizontal: bosluk.xl,
    backgroundColor: renk.kagit,
    borderRadius: kose.xl,
    borderWidth: 1,
    borderColor: renk.cizgi,
  },
  bosIkon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: renk.zumrutSoluk,
    alignItems: "center",
    justifyContent: "center",
  },
  hata: {
    backgroundColor: renk.gulSoluk,
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: kose.m,
    padding: bosluk.m,
  },
});
