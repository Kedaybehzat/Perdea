import { router, useFocusEffect } from "expo-router";
import { Bell, ChevronRight, Film, Heart, LogOut, Pencil, Star, type LucideIcon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Afis from "@/components/Afis";
import { PerdeZemin } from "@/components/Perde";
import { Avatar, BosDurum, Dugme, Metin } from "@/components/temel";
import { useOturum } from "@/lib/oturum";
import { pushSil } from "@/lib/push";
import { useSayilar } from "@/lib/sayac";
import { supabase } from "@/lib/supabase";
import { posterUrl, yapimlar, type Yapim } from "@/lib/tmdb";
import { bosluk, kose, renk, yazi } from "@/tema";


export default function Profil() {
  const { oturum, profil, profiliYenile } = useOturum();
  const benId = oturum?.user.id;
  const kenar = useSafeAreaInsets();
  const { bildirim } = useSayilar();
  const [favoriIdleri, setFavoriIdleri] = useState<number[]>([]);
  const [puanSayisi, setPuanSayisi] = useState(0);
  const [afisler, setAfisler] = useState<Map<number, Yapim>>(new Map());
  const [cikiyor, setCikiyor] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!benId) return;
      void profiliYenile();
      (async () => {
        const [{ data: f }, { count }] = await Promise.all([
          supabase.from("favorites").select("movie_id, created_at").eq("user_id", benId).order("created_at", { ascending: false }).limit(30),
          supabase.from("ratings").select("movie_id", { count: "exact", head: true }).eq("user_id", benId),
        ]);
        const idler = (f ?? []).map((r) => r.movie_id as number);
        setFavoriIdleri(idler);
        setPuanSayisi(count ?? 0);
        setAfisler(await yapimlar(idler));
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [benId])
  );

  const ad = profil?.display_name || profil?.username || "Perdea üyesi";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: renk.krem }} contentContainerStyle={{ paddingBottom: bosluk.xxl }}>
      <PerdeZemin style={{ paddingTop: kenar.top + bosluk.xl, paddingBottom: bosluk.xl, paddingHorizontal: bosluk.xl, alignItems: "center", gap: bosluk.m }}>
        <View style={{ padding: 4, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.15)" }}>
          <Avatar ad={ad} url={profil?.avatar_url} boyut={96} />
        </View>
        <Text style={{ fontFamily: yazi.baslik, fontSize: 30, color: "#fff", textAlign: "center" }} accessibilityRole="header">
          {ad}
        </Text>
        {profil?.username ? <Text style={{ fontFamily: yazi.govde, fontSize: 15, color: "rgba(236,253,245,0.8)" }}>@{profil.username}</Text> : null}
        {profil?.bio ? (
          <Text style={{ fontFamily: yazi.govde, fontSize: 15, lineHeight: 21, color: "rgba(236,253,245,0.92)", textAlign: "center" }}>
            {profil.bio}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", gap: bosluk.m, marginTop: bosluk.s }}>
          <Sayi ikon={Heart} deger={favoriIdleri.length} etiket="favori" />
          <Sayi ikon={Star} deger={puanSayisi} etiket="puan" />
        </View>
      </PerdeZemin>

      <View style={{ padding: bosluk.l, gap: bosluk.l }}>
        <Metin tur="altBaslik">Favorilerim</Metin>
        {favoriIdleri.length === 0 ? (
          <BosDurum ikon={Film} baslik="Henüz favorin yok" aciklama="Keşfet’te sevdiğin yapımları kalple işaretle; eşleşmelerin onlardan çıkıyor." />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: bosluk.m }}>
            {favoriIdleri.map((id) => {
              const y = afisler.get(id);
              return <Afis key={id} url={y ? posterUrl(y.posterYolu) : null} baslik={y?.baslik ?? "Yapım"} style={{ width: "30.6%" }} />;
            })}
          </View>
        )}

        <View style={s.kutu}>
          <Satir ikon={Bell} etiket="Bildirimler" sayi={bildirim} onPress={() => router.push("/bildirimler")} />
          <Satir ikon={Pencil} etiket="Profili düzenle" onPress={() => router.push("/profil-duzenle")} />
          <Dugme
            tur="cizgi"
            ikon={LogOut}
            bekliyor={cikiyor}
            onPress={async () => {
              setCikiyor(true);
              await pushSil();
              await supabase.auth.signOut();
            }}
          >
            Çıkış yap
          </Dugme>
        </View>
      </View>
    </ScrollView>
  );
}

function Satir({ ikon: Ikon, etiket, sayi, onPress }: { ikon: LucideIcon; etiket: string; sayi?: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={sayi ? `${etiket}, ${sayi} yeni` : etiket}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: bosluk.m, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}
    >
      <Ikon size={20} color={renk.zumrutKoyu} />
      <Text style={{ flex: 1, fontFamily: yazi.yariKalin, fontSize: 16, color: renk.yazi }}>{etiket}</Text>
      {sayi ? (
        <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: renk.gul, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: yazi.kalin, fontSize: 12, color: "#fff" }}>{sayi > 99 ? "99+" : sayi}</Text>
        </View>
      ) : null}
      <ChevronRight size={18} color={renk.yaziSoluk} />
    </Pressable>
  );
}

function Sayi({ ikon: Ikon, deger, etiket }: { ikon: typeof Heart; deger: number; etiket: string }) {
  return (
    <View style={s.sayi} accessible accessibilityLabel={`${deger} ${etiket}`}>
      <Ikon size={15} color={renk.altin} />
      <Text style={{ fontFamily: yazi.baslik, fontSize: 20, color: "#fff" }}>{deger}</Text>
      <Text style={{ fontFamily: yazi.orta, fontSize: 13, color: "rgba(236,253,245,0.8)" }}>{etiket}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  sayi: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  kutu: { backgroundColor: renk.kagit, borderRadius: kose.l, borderWidth: 1, borderColor: renk.cizgi, padding: bosluk.l, gap: bosluk.m },
});
