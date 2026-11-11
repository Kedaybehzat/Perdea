import * as Haptics from "expo-haptics";
import { Heart, Search, SearchX, Star, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import Afis from "@/components/Afis";
import PerdeBaslik from "@/components/Perde";
import { BosDurum, Dugme, Metin, Yukleniyor } from "@/components/temel";
import { useOturum } from "@/lib/oturum";
import { supabase } from "@/lib/supabase";
import { ara, posterUrl, trend, yapimiHatirla, type Yapim } from "@/lib/tmdb";
import { bosluk, kose, renk, yazi } from "@/tema";

type Tur = "hepsi" | "film" | "dizi";
const TURLER: [Tur, string][] = [
  ["hepsi", "Hepsi"],
  ["film", "Film"],
  ["dizi", "Dizi"],
];

const titre = () => {
  if (Platform.OS !== "web") void Haptics.selectionAsync();
};

export default function Kesfet() {
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [tur, setTur] = useState<Tur>("hepsi");
  const [sorgu, setSorgu] = useState("");
  const [aranan, setAranan] = useState("");
  const [liste, setListe] = useState<Yapim[] | null>(null);
  const [hata, setHata] = useState<string>();
  const [yenileniyor, setYenileniyor] = useState(false);
  const [favoriler, setFavoriler] = useState<Set<number>>(new Set());
  const [puanlar, setPuanlar] = useState<Map<number, number>>(new Map());
  const [secili, setSecili] = useState<Yapim | null>(null);
  const istekNo = useRef(0);

  const yukle = useCallback(async () => {
    const no = ++istekNo.current;
    setHata(undefined);
    try {
      const sonuc = aranan
        ? (await ara(aranan)).filter((y) => tur === "hepsi" || y.tur === tur)
        : await trend(tur);
      if (no !== istekNo.current) return;
      sonuc.forEach(yapimiHatirla);
      setListe(sonuc);
      if (benId && sonuc.length) {
        const idler = sonuc.map((y) => y.id);
        const [{ data: f }, { data: p }] = await Promise.all([
          supabase.from("favorites").select("movie_id").eq("user_id", benId).in("movie_id", idler),
          supabase.from("ratings").select("movie_id, score").eq("user_id", benId).in("movie_id", idler),
        ]);
        if (no !== istekNo.current) return;
        setFavoriler(new Set((f ?? []).map((r) => r.movie_id as number)));
        setPuanlar(new Map((p ?? []).map((r) => [r.movie_id as number, r.score as number])));
      }
    } catch {
      if (no !== istekNo.current) return;
      setListe([]);
      setHata("Film listesi alınamadı. Bağlantını kontrol edip aşağı çekerek yenile.");
    }
  }, [aranan, tur, benId]);

  useEffect(() => {
    setListe(null);
    void yukle();
  }, [yukle]);

  async function favoriDegistir(y: Yapim) {
    if (!benId) return;
    titre();
    const vardi = favoriler.has(y.id);
    const yeni = new Set(favoriler);
    if (vardi) yeni.delete(y.id);
    else yeni.add(y.id);
    setFavoriler(yeni);
    const { error } = vardi
      ? await supabase.from("favorites").delete().eq("user_id", benId).eq("movie_id", y.id)
      : await supabase.from("favorites").upsert({ user_id: benId, movie_id: y.id }, { onConflict: "user_id,movie_id", ignoreDuplicates: true });
    if (error) setFavoriler(favoriler); // geri al
  }

  async function puanVer(y: Yapim, puan: number | null) {
    if (!benId) return;
    titre();
    const onceki = puanlar;
    const yeni = new Map(puanlar);
    if (puan === null) yeni.delete(y.id);
    else yeni.set(y.id, puan);
    setPuanlar(yeni);
    setSecili(null);
    const { error } =
      puan === null
        ? await supabase.from("ratings").delete().eq("user_id", benId).eq("movie_id", y.id)
        : await supabase.from("ratings").upsert({ user_id: benId, movie_id: y.id, score: puan }, { onConflict: "user_id,movie_id" });
    if (error) setPuanlar(onceki);
  }

  return (
    <View style={{ flex: 1, backgroundColor: renk.krem }}>
      <FlatList
        data={liste ?? []}
        keyExtractor={(y) => `${y.tur}-${y.id}`}
        numColumns={3}
        columnWrapperStyle={{ gap: bosluk.m, paddingHorizontal: bosluk.l }}
        contentContainerStyle={{ gap: bosluk.l, paddingBottom: bosluk.xxl }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            tintColor={renk.zumrut}
            onRefresh={async () => {
              setYenileniyor(true);
              await yukle();
              setYenileniyor(false);
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: bosluk.l }}>
            <PerdeBaslik ustEtiket="Keşfet" baslik="Bu hafta" vurgu="ne izlenir?">
              <View style={s.arama}>
                <Search size={18} color={renk.yaziSoluk} />
                <TextInput
                  value={sorgu}
                  onChangeText={setSorgu}
                  onSubmitEditing={() => setAranan(sorgu.trim())}
                  placeholder="Film, dizi, anime ara"
                  placeholderTextColor={renk.yaziSoluk}
                  returnKeyType="search"
                  accessibilityLabel="Film, dizi, anime ara"
                  style={s.aramaGirdi}
                />
                {sorgu ? (
                  <Pressable
                    onPress={() => {
                      setSorgu("");
                      setAranan("");
                    }}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Aramayı temizle"
                  >
                    <X size={18} color={renk.yaziOrta} />
                  </Pressable>
                ) : null}
              </View>
            </PerdeBaslik>

            <View style={s.sekmeler} accessibilityRole="tablist">
              {TURLER.map(([t, etiket]) => (
                <Pressable
                  key={t}
                  onPress={() => setTur(t)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tur === t }}
                  style={[s.sekme, tur === t && s.sekmeAktif]}
                >
                  <Text style={[s.sekmeYazi, tur === t && { color: renk.zumrutKoyu }]}>{etiket}</Text>
                </Pressable>
              ))}
            </View>

            {aranan && liste ? (
              <Metin tur="kucuk" style={{ paddingHorizontal: bosluk.l }}>
                “{aranan}” için {liste.length} sonuç
              </Metin>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          liste === null ? (
            <Yukleniyor />
          ) : (
            <View style={{ paddingHorizontal: bosluk.l }}>
              <BosDurum
                ikon={SearchX}
                baslik={hata ? "Liste gelmedi" : "Bunu bulamadık"}
                aciklama={hata ?? `“${aranan}” için sonuç yok. Özgün adıyla ya da daha kısa yazarak dene.`}
              />
            </View>
          )
        }
        renderItem={({ item: y }) => {
          const favori = favoriler.has(y.id);
          const puan = puanlar.get(y.id);
          return (
            <Pressable
              style={{ flex: 1 / 3 }}
              onPress={() => setSecili(y)}
              accessibilityRole="button"
              accessibilityLabel={`${y.baslik}, puan ver`}
            >
              <View>
                <Afis url={posterUrl(y.posterYolu)} baslik={y.baslik} />
                <Pressable
                  onPress={() => favoriDegistir(y)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={favori ? "Favoriden çıkar" : "Favoriye ekle"}
                  accessibilityState={{ selected: favori }}
                  style={[s.kalp, favori && { backgroundColor: renk.gul }]}
                >
                  <Heart size={16} color="#fff" fill={favori ? "#fff" : "transparent"} />
                </Pressable>
                {puan ? (
                  <View style={s.puanRozet}>
                    <Text style={s.puanRozetYazi}>{puan}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={s.ad} numberOfLines={1}>
                {y.baslik}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Star size={11} color={renk.altin} fill={renk.altin} />
                <Text style={s.alt}>
                  {y.tmdbPuani ? y.tmdbPuani.toFixed(1) : "—"} · {y.yil ?? "—"}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Modal visible={secili !== null} transparent animationType="slide" onRequestClose={() => setSecili(null)}>
        <Pressable style={s.perdeArka} onPress={() => setSecili(null)} accessibilityLabel="Kapat" />
        {secili ? (
          <View style={s.cekmece}>
            <View style={{ flexDirection: "row", gap: bosluk.l }}>
              <Afis url={posterUrl(secili.posterYolu)} baslik={secili.baslik} style={{ width: 84 }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Metin tur="altBaslik">{secili.baslik}</Metin>
                <Metin tur="kucuk">
                  {secili.yil ?? "—"} · {secili.tur === "film" ? "Film" : "Dizi"}
                </Metin>
                {secili.ozet ? (
                  <Metin tur="kucuk" numberOfLines={4}>
                    {secili.ozet}
                  </Metin>
                ) : null}
              </View>
            </View>
            <Metin tur="etiket" style={{ marginTop: bosluk.l }}>
              Puanın
            </Metin>
            <View style={s.puanlar}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const aktif = puanlar.get(secili.id) === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => puanVer(secili, n)}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} puan`}
                    accessibilityState={{ selected: aktif }}
                    style={[s.puanKutu, aktif && { backgroundColor: renk.zumrut, borderColor: renk.zumrut }]}
                  >
                    <Text style={[s.puanYazi, aktif && { color: "#fff" }]}>{n}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", gap: bosluk.m, marginTop: bosluk.l }}>
              <Dugme
                tur={favoriler.has(secili.id) ? "cizgi" : "dolu"}
                ikon={Heart}
                onPress={() => favoriDegistir(secili)}
                style={{ flex: 1 }}
              >
                {favoriler.has(secili.id) ? "Favoriden çıkar" : "Favoriye ekle"}
              </Dugme>
              {puanlar.has(secili.id) ? (
                <Dugme tur="cizgi" onPress={() => puanVer(secili, null)}>
                  Puanı kaldır
                </Dugme>
              ) : null}
            </View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  arama: {
    flexDirection: "row",
    alignItems: "center",
    gap: bosluk.s,
    backgroundColor: "#fff",
    borderRadius: kose.m,
    paddingHorizontal: bosluk.m,
    minHeight: 48,
  },
  aramaGirdi: { flex: 1, fontFamily: yazi.govde, fontSize: 16, color: renk.yazi, paddingVertical: 10 },
  sekmeler: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginHorizontal: bosluk.l,
    padding: 4,
    borderRadius: kose.m,
    backgroundColor: "rgba(214,204,184,0.45)",
  },
  sekme: { paddingHorizontal: bosluk.l, paddingVertical: bosluk.s, borderRadius: kose.s },
  sekmeAktif: { backgroundColor: "#fff" },
  sekmeYazi: { fontFamily: yazi.yariKalin, fontSize: 14, color: renk.yaziOrta },
  kalp: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  puanRozet: {
    position: "absolute",
    top: 6,
    left: 6,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    backgroundColor: renk.altin,
    alignItems: "center",
    justifyContent: "center",
  },
  puanRozetYazi: { fontFamily: yazi.kalin, fontSize: 13, color: renk.perde950 },
  ad: { marginTop: 6, fontFamily: yazi.yariKalin, fontSize: 13, color: renk.yazi },
  alt: { fontFamily: yazi.govde, fontSize: 12, color: renk.yaziOrta },
  perdeArka: { flex: 1, backgroundColor: "rgba(3,39,32,0.55)" },
  cekmece: {
    backgroundColor: renk.krem,
    borderTopLeftRadius: kose.xl,
    borderTopRightRadius: kose.xl,
    padding: bosluk.xl,
    paddingBottom: bosluk.xxl + 8,
  },
  puanlar: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: bosluk.s },
  puanKutu: {
    width: "17.6%",
    minHeight: 46,
    borderRadius: kose.s,
    borderWidth: 1,
    borderColor: renk.cizgiKoyu,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  puanYazi: { fontFamily: yazi.kalin, fontSize: 16, color: renk.yazi },
});
