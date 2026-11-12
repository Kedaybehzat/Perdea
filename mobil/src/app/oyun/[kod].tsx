import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Copy, Crown, Trophy } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Kart, Secici } from "@/components/Kart";
import { PerdeZemin } from "@/components/Perde";
import UstCubuk from "@/components/UstCubuk";
import { Alan, Avatar, Dugme, HataKutusu, Metin, Yukleniyor } from "@/components/temel";
import { hataMesaji } from "@/lib/hata";
import { oyuncuAdi, type Cevap, type Hamle, type OdaDurumu, type OdaOnizleme, type Oyuncu } from "@/lib/oyun";
import { supabase } from "@/lib/supabase";
import { bosluk, kose, renk, yazi } from "@/tema";

const CEVAPLAR: [Cevap, string][] = [
  ["evet", "Evet"],
  ["hayir", "Hayır"],
  ["belki", "Bilmiyorum"],
];
const CEVAP_ETIKET: Record<Cevap, string> = { evet: "Evet", hayir: "Hayır", belki: "Bilmiyorum" };

export default function OdaEkrani() {
  const { kod } = useLocalSearchParams<{ kod: string }>();
  const [durum, setDurum] = useState<OdaDurumu | OdaOnizleme | null | undefined>(undefined);
  const [hata, setHata] = useState<string>();
  const [bekliyor, setBekliyor] = useState(false);

  const yukle = useCallback(async () => {
    const { data, error } = await supabase.rpc("oda_durumu", { p_kod: kod });
    if (error) {
      setHata(hataMesaji(error));
      setDurum((d) => d ?? null);
      return;
    }
    setDurum((data as OdaDurumu | OdaOnizleme | null) ?? null);
  }, [kod]);

  // Oda canlı: her 3 saniyede bir tazele (Realtime'a gerek kalmadan çalışır).
  useEffect(() => {
    void yukle();
    const z = setInterval(yukle, 3000);
    return () => clearInterval(z);
  }, [yukle]);

  // Tek yerden RPC çağır: hata göster, sonra durumu tazele.
  const calistir = useCallback(
    async (fonksiyon: string, parametreler: Record<string, unknown>): Promise<unknown> => {
      setBekliyor(true);
      setHata(undefined);
      const { data, error } = await supabase.rpc(fonksiyon, parametreler);
      setBekliyor(false);
      if (error) setHata(hataMesaji(error));
      await yukle();
      return error ? undefined : data;
    },
    [yukle]
  );

  if (durum === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Oda" />
        <Yukleniyor />
      </View>
    );
  }
  if (durum === null) {
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk baslik="Oda" />
        <View style={{ padding: bosluk.xl }}>
          <HataKutusu mesaj={hata ?? "Böyle bir oda yok. Kodu kontrol et."} />
        </View>
      </View>
    );
  }

  if (!durum.uye) {
    const o = durum.oda;
    return (
      <View style={{ flex: 1, backgroundColor: renk.krem }}>
        <UstCubuk ustEtiket="Davet" baslik={o.ad} />
        <View style={{ padding: bosluk.l, gap: bosluk.l }}>
          <Kart style={{ gap: bosluk.m }}>
            <Metin tur="altBaslik">{o.kurucu ? `${o.kurucu} seni çağırıyor` : "Bu odaya katıl"}</Metin>
            <Metin renk={renk.yaziOrta}>
              {o.oyuncu_sayisi}/{o.kapasite} oyuncu{o.tema ? ` · ${o.tema}` : ""}
            </Metin>
            <HataKutusu mesaj={hata} />
            <Dugme bekliyor={bekliyor} onPress={() => calistir("odaya_katil", { p_kod: o.kod })}>
              Odaya katıl
            </Dugme>
          </Kart>
        </View>
      </View>
    );
  }

  const { oda, oyuncular, hamleler, ben } = durum;
  const kurucuyum = oda.kurucu_id === ben;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.krem }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <UstCubuk ustEtiket={`Oda ${oda.kod} · ${oda.tur}. tur`} baslik={oda.ad} />
      <ScrollView contentContainerStyle={{ padding: bosluk.l, gap: bosluk.l }} keyboardShouldPersistTaps="handled">
        <HataKutusu mesaj={hata} />

        {oda.durum === "lobi" ? <Lobi durum={durum} bekliyor={bekliyor} calistir={calistir} /> : null}
        {oda.durum === "karakter" ? <KarakterAsamasi durum={durum} bekliyor={bekliyor} calistir={calistir} /> : null}
        {oda.durum === "oyun" ? <OyunAsamasi durum={durum} bekliyor={bekliyor} calistir={calistir} /> : null}
        {oda.durum === "bitti" ? <Bitis durum={durum} bekliyor={bekliyor} calistir={calistir} /> : null}

        <Metin tur="altBaslik">Oyuncular</Metin>
        {oyuncular.map((o) => (
          <View key={o.user_id} style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
            <Avatar ad={oyuncuAdi(o)} url={o.avatar_url} boyut={40} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: yazi.yariKalin, fontSize: 15, color: renk.yazi }}>
                  {oyuncuAdi(o)}
                  {o.user_id === ben ? " (sen)" : ""}
                </Text>
                {o.user_id === oda.kurucu_id ? <Crown size={14} color={renk.altinKoyu} /> : null}
              </View>
              {oda.durum === "oyun" || oda.durum === "bitti" ? (
                <Metin tur="kucuk">
                  {o.user_id === ben && o.durum === "oynuyor" && oda.durum === "oyun"
                    ? "Karakterin gizli"
                    : `${o.karakter ?? "?"}${o.eser ? ` (${o.eser})` : ""}`}
                  {o.durum === "bildi" ? ` · ${o.derece}. bildi` : o.durum === "pes" ? " · pes etti" : ""}
                </Metin>
              ) : null}
            </View>
            {oda.sira_id === o.user_id && oda.durum === "oyun" ? (
              <Text style={{ fontFamily: yazi.kalin, fontSize: 11, letterSpacing: 1, color: renk.zumrutKoyu }}>SIRADA</Text>
            ) : null}
            {kurucuyum && o.user_id !== ben && oda.durum === "lobi" ? (
              <Dugme tur="cizgi" onPress={() => calistir("oyuncu_cikar", { p_kod: oda.kod, p_user: o.user_id })} style={{ minHeight: 36, paddingHorizontal: 12 }}>
                Çıkar
              </Dugme>
            ) : null}
          </View>
        ))}

        <OdaIslemleri durum={durum} bekliyor={bekliyor} calistir={calistir} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function OdaIslemleri({ durum, bekliyor, calistir }: AsamaProps) {
  const { oda, oyuncular, ben } = durum;
  const [onay, setOnay] = useState<"pes" | "iptal" | null>(null);
  const benOyuncu = oyuncular.find((o) => o.user_id === ben);
  const oyunda = oda.durum === "karakter" || oda.durum === "oyun";
  const kurucuyum = oda.kurucu_id === ben;

  if (onay) {
    return (
      <Kart style={{ gap: bosluk.m, backgroundColor: renk.gulSoluk, borderColor: "#fecdd3" }}>
        <Metin>{onay === "pes" ? "Pes edersen karakterin açılır ve bu turda tahmin edemezsin." : "Tur iptal edilir, herkes lobiye döner."}</Metin>
        <View style={{ flexDirection: "row", gap: bosluk.m }}>
          <Dugme tur="cizgi" onPress={() => setOnay(null)} style={{ flex: 1 }}>
            Vazgeç
          </Dugme>
          <Dugme
            tur="tehlike"
            bekliyor={bekliyor}
            onPress={async () => {
              await calistir(onay === "pes" ? "pes_et" : "lobiye_don", { p_kod: oda.kod });
              setOnay(null);
            }}
            style={{ flex: 1 }}
          >
            {onay === "pes" ? "Pes et" : "İptal et"}
          </Dugme>
        </View>
      </Kart>
    );
  }

  return (
    <View style={{ gap: bosluk.s }}>
      {oda.durum === "oyun" && benOyuncu?.durum === "oynuyor" ? (
        <Dugme tur="cizgi" onPress={() => setOnay("pes")}>
          Pes et, karakterimi göster
        </Dugme>
      ) : null}
      {kurucuyum && oyunda ? (
        <Dugme tur="cizgi" onPress={() => setOnay("iptal")}>
          Turu iptal et, lobiye dön
        </Dugme>
      ) : null}
      {kurucuyum && oda.durum === "bitti" ? (
        <Dugme tur="cizgi" devreDisi={bekliyor} onPress={() => calistir("lobiye_don", { p_kod: oda.kod })}>
          Lobiye dön (yeni oyuncu al)
        </Dugme>
      ) : null}
      {!oyunda ? (
        <Dugme
          tur="cizgi"
          devreDisi={bekliyor}
          onPress={async () => {
            const sonuc = await calistir("odadan_ayril", { p_kod: oda.kod });
            if (sonuc !== undefined) router.back();
          }}
        >
          Odadan ayrıl
        </Dugme>
      ) : null}
    </View>
  );
}

type AsamaProps = {
  durum: OdaDurumu;
  bekliyor: boolean;
  calistir: (fonksiyon: string, parametreler: Record<string, unknown>) => Promise<unknown>;
};

function Lobi({ durum, bekliyor, calistir }: AsamaProps) {
  const { oda, oyuncular, ben } = durum;
  const [kopyalandi, setKopyalandi] = useState(false);
  return (
    <PerdeZemin style={{ borderRadius: kose.xl, padding: bosluk.xl, gap: bosluk.m, alignItems: "center" }}>
      <Text style={{ fontFamily: yazi.kalin, fontSize: 11, letterSpacing: 2.4, color: renk.altin }}>ODA KODU</Text>
      <Text style={{ fontFamily: yazi.baslik, fontSize: 48, letterSpacing: 8, color: "#fff" }} selectable accessibilityLabel={`Oda kodu ${oda.kod.split("").join(" ")}`}>
        {oda.kod}
      </Text>
      <Dugme
        tur="cizgi"
        ikon={kopyalandi ? Check : Copy}
        onPress={async () => {
          await Clipboard.setStringAsync(oda.kod);
          setKopyalandi(true);
          setTimeout(() => setKopyalandi(false), 1800);
        }}
        style={{ alignSelf: "stretch" }}
      >
        {kopyalandi ? "Kopyalandı" : "Kodu kopyala"}
      </Dugme>
      <Text style={{ fontFamily: yazi.govde, fontSize: 14, color: "rgba(236,253,245,0.85)", textAlign: "center" }}>
        {oyuncular.length}/{oda.kapasite} oyuncu. Kodu arkadaşlarına gönder; herkes gelince başlatın.
      </Text>
      {oda.kurucu_id === ben ? (
        <Dugme tur="altin" bekliyor={bekliyor} devreDisi={oyuncular.length < 2} onPress={() => calistir("oyunu_baslat", { p_kod: oda.kod })} style={{ alignSelf: "stretch" }}>
          {oyuncular.length < 2 ? "En az 2 oyuncu gerekli" : "Oyunu başlat"}
        </Dugme>
      ) : (
        <Text style={{ fontFamily: yazi.orta, fontSize: 14, color: "#fff" }}>Kurucunun başlatması bekleniyor…</Text>
      )}
    </PerdeZemin>
  );
}

function KarakterAsamasi({ durum, bekliyor, calistir }: AsamaProps) {
  const { oda, oyuncular, ben } = durum;
  const hedef = oyuncular.find((o) => o.yazan_id === ben);
  const hazir = oyuncular.filter((o) => o.karakter_hazir).length;
  const [karakter, setKarakter] = useState("");
  const [eser, setEser] = useState("");
  const [duzenle, setDuzenle] = useState(false);

  return (
    <Kart style={{ gap: bosluk.m }}>
      <Metin tur="etiket">
        Karakterler yazılıyor · {hazir}/{oyuncular.length}
      </Metin>
      {!hedef ? (
        <Metin renk={renk.yaziOrta}>Bu turda yazacağın biri yok; diğerleri bekleniyor.</Metin>
      ) : hedef.karakter_hazir && !duzenle ? (
        <>
          <Metin tur="altBaslik">
            {oyuncuAdi(hedef)} için yazdın: {hedef.karakter}
          </Metin>
          <Metin renk={renk.yaziOrta}>Herkes yazınca oyun başlar.</Metin>
          <Dugme tur="cizgi" onPress={() => setDuzenle(true)}>
            Değiştir
          </Dugme>
        </>
      ) : (
        <>
          <Metin tur="altBaslik">{oyuncuAdi(hedef)} kim olsun?</Metin>
          <Metin renk={renk.yaziOrta}>O göremeyecek; diğer herkes görecek.</Metin>
          <Alan etiket="Karakter" value={karakter} onChangeText={setKarakter} maxLength={60} placeholder="örn. Totoro" />
          <Alan etiket="Hangi yapımdan? (isteğe bağlı)" value={eser} onChangeText={setEser} maxLength={80} placeholder="örn. Komşum Totoro" />
          <Dugme
            bekliyor={bekliyor}
            devreDisi={!karakter.trim()}
            onPress={async () => {
              await calistir("karakter_yaz", { p_kod: oda.kod, p_karakter: karakter.trim(), p_eser: eser.trim() || null });
              setDuzenle(false);
            }}
          >
            Karakteri kaydet
          </Dugme>
        </>
      )}
    </Kart>
  );
}

function OyunAsamasi({ durum, bekliyor, calistir }: AsamaProps) {
  const { oda, oyuncular, hamleler, ben } = durum;
  const benOyuncu = oyuncular.find((o) => o.user_id === ben);
  const siradaki = oyuncular.find((o) => o.user_id === oda.sira_id);
  const aktifSoru = hamleler.find((h) => h.id === oda.aktif_soru_id);
  const siraBende = oda.sira_id === ben;
  const gecmis = hamleler.filter((h) => h.id !== oda.aktif_soru_id).slice().reverse();
  const kisi = (id: string) => oyuncular.find((o) => o.user_id === id);
  const [mod, setMod] = useState<"soru" | "tahmin">("soru");
  const [metin, setMetin] = useState("");
  const [sonuc, setSonuc] = useState<string>();
  const benimCevabim = aktifSoru?.cevaplar.find((c) => c.user_id === ben)?.cevap;

  return (
    <View style={{ gap: bosluk.l }}>
      {benOyuncu && benOyuncu.durum !== "oynuyor" ? (
        <Kart style={{ backgroundColor: benOyuncu.durum === "bildi" ? renk.zumrutSoluk : renk.kum }}>
          <Text style={{ fontFamily: yazi.yariKalin, fontSize: 16, color: renk.yazi }}>
            {benOyuncu.durum === "bildi" ? `Buldun! ${benOyuncu.derece}. sırada bildin.` : "Pes ettin."} Karakterin: {benOyuncu.karakter}
            {benOyuncu.eser ? ` (${benOyuncu.eser})` : ""}
          </Text>
          <Metin tur="kucuk">Diğerlerinin sorularını cevaplamaya devam edebilirsin.</Metin>
        </Kart>
      ) : null}

      <Kart style={{ gap: bosluk.m }}>
        {siraBende ? (
          aktifSoru ? (
            <>
              <Metin tur="etiket">Sorun cevaplanıyor</Metin>
              <Metin tur="altBaslik">“{aktifSoru.metin}”</Metin>
              <Cevaplar hamle={aktifSoru} kisi={kisi} />
              <Dugme bekliyor={bekliyor} devreDisi={aktifSoru.cevaplar.length < 1} onPress={() => calistir("sirayi_devret", { p_kod: oda.kod })}>
                {aktifSoru.cevaplar.length < 1 ? "En az bir cevap bekle" : "Tamam, sırayı devret"}
              </Dugme>
            </>
          ) : (
            <>
              <Metin tur="etiket">Sıra sende</Metin>
              <Secici
                secenekler={[
                  ["soru", "Soru sor"],
                  ["tahmin", "Tahmin et"],
                ] as const}
                deger={mod}
                degistir={(m) => {
                  setMod(m);
                  setSonuc(undefined);
                }}
              />
              <Alan
                value={metin}
                onChangeText={setMetin}
                maxLength={mod === "soru" ? 200 : 60}
                placeholder={mod === "soru" ? "Evet/hayır sorusu: “İnsan mıyım?”" : "Kim olduğunu yaz"}
                accessibilityLabel={mod === "soru" ? "Sorun" : "Tahminin"}
              />
              {sonuc ? <Metin renk={renk.altinKoyu}>{sonuc}</Metin> : null}
              <Dugme
                bekliyor={bekliyor}
                devreDisi={!metin.trim()}
                onPress={async () => {
                  const t = metin.trim();
                  setSonuc(undefined);
                  if (mod === "soru") {
                    await calistir("soru_sor", { p_kod: oda.kod, p_metin: t });
                  } else {
                    const tuttu = await calistir("tahmin_et", { p_kod: oda.kod, p_metin: t });
                    if (tuttu === false) setSonuc(`“${t}” tutmadı. Sıra geçti.`);
                  }
                  setMetin("");
                }}
              >
                {mod === "soru" ? "Sor" : "Tahmin et"}
              </Dugme>
              <Text
                onPress={() => (bekliyor ? undefined : calistir("sirayi_devret", { p_kod: oda.kod }))}
                accessibilityRole="button"
                style={{ fontFamily: yazi.yariKalin, fontSize: 14, color: renk.yaziOrta, textDecorationLine: "underline", alignSelf: "flex-start" }}
              >
                Pas geç
              </Text>
            </>
          )
        ) : aktifSoru && siradaki ? (
          <>
            <Metin tur="etiket">{oyuncuAdi(siradaki)} soruyor</Metin>
            <Metin tur="altBaslik">“{aktifSoru.metin}”</Metin>
            <Metin tur="kucuk">
              Onun karakteri: {siradaki.karakter}
              {siradaki.eser ? ` (${siradaki.eser})` : ""}
            </Metin>
            <View style={{ flexDirection: "row", gap: bosluk.s }}>
              {CEVAPLAR.map(([c, etiket]) => (
                <Dugme
                  key={c}
                  tur={benimCevabim === c ? "dolu" : "cizgi"}
                  devreDisi={bekliyor}
                  onPress={() => calistir("cevap_ver", { p_hamle: aktifSoru.id, p_cevap: c })}
                  style={{ flex: 1, paddingHorizontal: 6 }}
                >
                  {etiket}
                </Dugme>
              ))}
            </View>
          </>
        ) : (
          <>
            <Metin tur="etiket">Sırada</Metin>
            <Metin tur="altBaslik">{siradaki ? `${oyuncuAdi(siradaki)} düşünüyor…` : "Sıra bekleniyor…"}</Metin>
            {oda.kurucu_id === ben ? (
              <Text
                onPress={() => (bekliyor ? undefined : calistir("sirayi_devret", { p_kod: oda.kod }))}
                accessibilityRole="button"
                style={{ fontFamily: yazi.orta, fontSize: 13, color: renk.yaziOrta, textDecorationLine: "underline" }}
              >
                Oyuncu yanıt vermiyor mu? Sırayı atla
              </Text>
            ) : null}
            {siradaki?.karakter ? (
              <Metin tur="kucuk">
                Karakteri: {siradaki.karakter}
                {siradaki.eser ? ` (${siradaki.eser})` : ""}
              </Metin>
            ) : null}
          </>
        )}
      </Kart>

      {gecmis.length ? <Metin tur="altBaslik">Günlük</Metin> : null}
      {gecmis.map((h) => {
        const yapan = kisi(h.user_id);
        const onaylayabilirim = h.tip === "tahmin" && h.dogru === false && yapan?.yazan_id === ben && yapan.durum === "oynuyor";
        return (
          <Kart key={h.id} style={{ gap: 6 }}>
            <Metin tur="kucuk">
              {yapan ? oyuncuAdi(yapan) : "Oyuncu"} {h.tip === "soru" ? "sordu" : "tahmin etti"}
            </Metin>
            <Text style={{ fontFamily: yazi.yariKalin, fontSize: 16, color: renk.yazi }}>“{h.metin}”</Text>
            {h.tip === "soru" ? (
              <Cevaplar hamle={h} kisi={kisi} />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m, flexWrap: "wrap" }}>
                <Text style={{ fontFamily: yazi.kalin, fontSize: 13, color: h.dogru ? renk.zumrutKoyu : renk.gul }}>{h.dogru ? "Bildi!" : "Tutmadı"}</Text>
                {onaylayabilirim ? (
                  <Text
                    onPress={() => calistir("tahmini_onayla", { p_hamle: h.id })}
                    accessibilityRole="button"
                    style={{ fontFamily: yazi.yariKalin, fontSize: 13, color: renk.zumrutKoyu, textDecorationLine: "underline" }}
                  >
                    Yazım farkı mı? Doğru say
                  </Text>
                ) : null}
              </View>
            )}
          </Kart>
        );
      })}
    </View>
  );
}

function Cevaplar({ hamle, kisi }: { hamle: Hamle; kisi: (id: string) => Oyuncu | undefined }) {
  if (!hamle.cevaplar.length) return <Metin tur="kucuk">Henüz cevap yok.</Metin>;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {hamle.cevaplar.map((c) => {
        const o = kisi(c.user_id);
        return (
          <View key={c.user_id} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: c.cevap === "evet" ? renk.zumrutAcik : c.cevap === "hayir" ? renk.gulSoluk : renk.kum }}>
            <Text style={{ fontFamily: yazi.orta, fontSize: 13, color: renk.yazi }}>
              {o ? oyuncuAdi(o) : "Oyuncu"}: {CEVAP_ETIKET[c.cevap]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Bitis({ durum, bekliyor, calistir }: AsamaProps) {
  const { oda, oyuncular, ben } = durum;
  const sirali = oyuncular.slice().sort((a, b) => {
    if (a.derece !== null && b.derece !== null) return a.derece - b.derece;
    if (a.derece !== null) return -1;
    if (b.derece !== null) return 1;
    return a.sira_no - b.sira_no;
  });
  const kazanan = sirali.find((o) => o.derece === 1);
  return (
    <Kart style={{ gap: bosluk.m, alignItems: "center" }}>
      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" }}>
        <Trophy size={28} color={renk.altinKoyu} />
      </View>
      <Metin tur="baslik" style={{ fontSize: 28, lineHeight: 32, textAlign: "center" }}>
        {kazanan ? (kazanan.user_id === ben ? "Turu sen kazandın!" : `${oyuncuAdi(kazanan)} kazandı`) : "Tur bitti"}
      </Metin>
      <View style={{ alignSelf: "stretch", gap: bosluk.s }}>
        {sirali.map((o, i) => (
          <View key={o.user_id} style={{ flexDirection: "row", alignItems: "center", gap: bosluk.m }}>
            <Text style={{ width: 22, fontFamily: yazi.baslik, fontSize: 18, color: renk.yaziSoluk }}>{o.derece ?? "—"}</Text>
            <Avatar ad={oyuncuAdi(o)} url={o.avatar_url} boyut={34} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: yazi.yariKalin, fontSize: 15, color: renk.yazi }}>{oyuncuAdi(o)}</Text>
              <Metin tur="kucuk">
                {o.karakter}
                {o.eser ? ` (${o.eser})` : ""} · {o.soru_sayisi} soru, {o.tahmin_sayisi} tahmin{o.durum === "pes" ? " · pes" : ""}
              </Metin>
            </View>
            {i === 0 && o.derece === 1 ? <Crown size={16} color={renk.altinKoyu} /> : null}
          </View>
        ))}
      </View>
      {oda.kurucu_id === ben ? (
        <Dugme bekliyor={bekliyor} onPress={() => calistir("lobiye_don", { p_kod: oda.kod })} style={{ alignSelf: "stretch" }}>
          Yeni tur
        </Dugme>
      ) : (
        <Metin tur="kucuk">Kurucu yeni turu başlatabilir.</Metin>
      )}
    </Kart>
  );
}
