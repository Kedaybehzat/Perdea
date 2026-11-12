import { router, useFocusEffect } from "expo-router";
import { Armchair, Plus, Star } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Kart } from "@/components/Kart";
import UstCubuk from "@/components/UstCubuk";
import { Alan, BosDurum, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { useOturum } from "@/lib/oturum";
import { sehirBul } from "@/lib/sehirler";
import { supabase } from "@/lib/supabase";
import { bosluk, renk, yazi } from "@/tema";

type Salon = { id: string; ad: string; sehir: string; ilce: string | null; puan_sayisi: number; genel: number | null };

export default function Salonlar() {
  const { oturum } = useOturum();
  const benId = oturum?.user.id;
  const [liste, setListe] = useState<Salon[] | null>(null);
  const [ara, setAra] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [ad, setAd] = useState("");
  const [sehir, setSehir] = useState("");
  const [ilce, setIlce] = useState("");
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);
  const [yenileniyor, setYenileniyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data, error } = await supabase
      .from("sinema_ozet")
      .select("id, ad, sehir, ilce, puan_sayisi, genel")
      .order("genel", { ascending: false, nullsFirst: false })
      .order("puan_sayisi", { ascending: false })
      .limit(200);
    if (error) setHata(hataMesaji(error));
    setListe((data ?? []) as Salon[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void yukle();
    }, [yukle])
  );

  async function ekle() {
    const temizAd = ad.trim().replace(/\s+/g, " ");
    const il = sehirBul(sehir);
    if (temizAd.length < 3 || temizAd.length > 80) return setHata("Salon adı 3–80 karakter olmalı.");
    if (!il) return setHata("Şehri il adıyla yaz (örn. İstanbul, Sakarya).");
    if (!benId) return;
    setBekliyor(true);
    setHata(undefined);
    const { data, error } = await supabase
      .from("sinemalar")
      .insert({ ad: temizAd, sehir: il, ilce: ilce.trim() || null, ekleyen_id: benId })
      .select("id")
      .single();
    setBekliyor(false);
    if (error) {
      return setHata(error.code === "23505" ? "Bu salon bu şehirde zaten kayıtlı. Listeden bulup puanlayabilirsin." : hataMesaji(error));
    }
    setAd("");
    setSehir("");
    setIlce("");
    setFormAcik(false);
    router.push({ pathname: "/salon/[id]", params: { id: data.id } });
  }

  const q = ara.trim().toLocaleLowerCase("tr-TR");
  const gorunen = (liste ?? []).filter(
    (x) => !q || x.ad.toLocaleLowerCase("tr-TR").includes(q) || x.sehir.toLocaleLowerCase("tr-TR").includes(q)
  );

  return (
    <View style={{ flex: 1, backgroundColor: renk.krem }}>
      <UstCubuk ustEtiket="Salon puanları" baslik="Film nerede izlenir?" />
      <FlatList
        data={gorunen}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ padding: bosluk.l, gap: bosluk.m }}
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
          <View style={{ gap: bosluk.m, marginBottom: bosluk.s }}>
            <Alan value={ara} onChangeText={setAra} placeholder="Salon ya da şehir ara" returnKeyType="search" />
            {formAcik ? (
              <Kart style={{ gap: bosluk.m }}>
                <Alan etiket="Salon adı" value={ad} onChangeText={setAd} maxLength={80} placeholder="örn. Kadıköy Rexx Sineması" />
                <Alan etiket="Şehir" value={sehir} onChangeText={setSehir} placeholder="örn. İstanbul" />
                <Alan etiket="İlçe (isteğe bağlı)" value={ilce} onChangeText={setIlce} maxLength={60} />
                <HataKutusu mesaj={hata} />
                <View style={{ flexDirection: "row", gap: bosluk.m }}>
                  <Dugme tur="cizgi" onPress={() => setFormAcik(false)} style={{ flex: 1 }}>
                    Vazgeç
                  </Dugme>
                  <Dugme onPress={ekle} bekliyor={bekliyor} style={{ flex: 1.4 }}>
                    Salonu ekle
                  </Dugme>
                </View>
              </Kart>
            ) : (
              <>
                <Dugme tur="cizgi" ikon={Plus} onPress={() => setFormAcik(true)}>
                  Listede yoksa salon ekle
                </Dugme>
                <HataKutusu mesaj={hata} />
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          liste === null ? (
            <Yukleniyor />
          ) : (
            <BosDurum
              ikon={Armchair}
              baslik={q ? "Bu salon listede yok" : "Henüz salon eklenmemiş"}
              aciklama={q ? "Yukarıdan ekleyip ilk puanı sen ver." : "İlk salonu sen ekle: en son film izlediğin yer neresiydi?"}
            />
          )
        }
        renderItem={({ item: x }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/salon/[id]", params: { id: x.id } })}
            accessibilityRole="button"
            accessibilityLabel={`${x.ad}, ${x.sehir}${x.genel ? `, ${x.genel.toFixed(1)} puan` : ""}`}
          >
            <Kart style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: yazi.baslik, fontSize: 19, color: renk.yazi }}>{x.ad}</Text>
                <Metin tur="kucuk">
                  {x.ilce ? `${x.ilce}, ` : ""}
                  {x.sehir} · {x.puan_sayisi} oy
                </Metin>
              </View>
              {x.genel ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: yazi.baslik, fontSize: 26, color: renk.yazi }}>{x.genel.toFixed(1)}</Text>
                  <Star size={14} color={renk.altin} fill={renk.altin} />
                </View>
              ) : (
                <Metin tur="kucuk">Puan yok</Metin>
              )}
            </Kart>
          </Pressable>
        )}
      />
    </View>
  );
}
