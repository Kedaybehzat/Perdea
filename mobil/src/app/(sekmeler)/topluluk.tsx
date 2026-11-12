import { router } from "expo-router";
import { Armchair, PartyPopper, VenetianMask } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Secici } from "@/components/Kart";
import PerdeBaslik from "@/components/Perde";
import AkisBolumu from "@/components/topluluk/AkisBolumu";
import BaslikBolumu from "@/components/topluluk/BaslikBolumu";
import { bosluk, kose, renk, yazi } from "@/tema";

const kisayollar = [
  { yol: "/salon", ikon: Armchair, ad: "Salon puanları", alt: "Film nerede izlenir?" },
  { yol: "/oyun", ikon: VenetianMask, ad: "Ben Kimim?", alt: "Oda kur, oyna" },
  { yol: "/cosplay", ikon: PartyPopper, ad: "Cosplay", alt: "Buluşmalar" },
] as const;

const BOLUMLER = [
  ["akis", "Akış"],
  ["baslik", "Başlıklar"],
] as const;

export default function Topluluk() {
  const [bolum, setBolum] = useState<"akis" | "baslik">("akis");

  // Üst kısım her iki listenin de başlığı olarak kullanılır (liste ile birlikte kayar).
  const ust = (
    <View style={{ gap: bosluk.l }}>
      <PerdeBaslik ustEtiket="Topluluk" baslik="Salondan" vurgu="çıkınca konuşulanlar" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: bosluk.l, gap: bosluk.m }}>
        {kisayollar.map(({ yol, ikon: Ikon, ad, alt }) => (
          <Pressable
            key={yol}
            onPress={() => router.push(yol)}
            accessibilityRole="button"
            accessibilityLabel={ad}
            style={({ pressed }) => ({
              width: 150,
              padding: bosluk.m,
              borderRadius: kose.l,
              backgroundColor: renk.perde800,
              gap: 6,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Ikon size={22} color={renk.altin} />
            <Text style={{ fontFamily: yazi.baslik, fontSize: 17, color: "#fff" }}>{ad}</Text>
            <Text style={{ fontFamily: yazi.govde, fontSize: 12, color: "rgba(236,253,245,0.8)" }}>{alt}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Secici secenekler={BOLUMLER} deger={bolum} degistir={setBolum} style={{ marginHorizontal: bosluk.l }} />
    </View>
  );

  return bolum === "akis" ? <AkisBolumu ust={ust} /> : <BaslikBolumu ust={ust} />;
}
