import { MessageSquareText, Plus, TrendingUp, Clock } from "lucide-react";

type Entry = {
  yazar: string;
  yazarBas: string;
  zaman: string;
  metin: string;
};

type Baslik = {
  id: string;
  baslik: string;
  hakkinda: string;
  entrySayisi: number;
  takip: number;
  sonEntry: Entry;
};

const basliklar: Baslik[] = [
  {
    id: "1",
    baslik: "korku perdesi s4 finali",
    hakkinda: "dizi · Korku Perdesi",
    entrySayisi: 142,
    takip: 318,
    sonEntry: {
      yazar: "mert a.",
      yazarBas: "M",
      zaman: "3 dk önce",
      metin:
        "finaldeki son 7 dakika olmasa dizinin tamamını unuturdum. o 7 dakika uğruna 4 sezon beklemişiz gibi hissettirdi.",
    },
  },
  {
    id: "2",
    baslik: "gece vardiyası neden sevilmiyor",
    hakkinda: "film · Gece Vardiyası",
    entrySayisi: 68,
    takip: 97,
    sonEntry: {
      yazar: "deniz k.",
      yazarBas: "D",
      zaman: "12 dk önce",
      metin:
        "atmosferik korku türünün türkçe örneklerinden biri ama izleyici 'ne izledim ben' deyince puanı düşüyor. biraz sabır isteyen film.",
    },
  },
  {
    id: "3",
    baslik: "rüzgarın hatıraları — ghibli kopyası mı",
    hakkinda: "anime · Rüzgarın Hatıraları",
    entrySayisi: 204,
    takip: 511,
    sonEntry: {
      yazar: "selin t.",
      yazarBas: "S",
      zaman: "27 dk önce",
      metin:
        "kopya değil, aynı duyguyu arayan bir çalışma. ghibli'yi aramak ayıp değil, taklit etmek ayıp. bu film birincisini yapıyor.",
    },
  },
  {
    id: "4",
    baslik: "en az bilinen türk gerilim filmleri",
    hakkinda: "liste · türk sineması",
    entrySayisi: 91,
    takip: 162,
    sonEntry: {
      yazar: "efe k.",
      yazarBas: "E",
      zaman: "1 sa önce",
      metin:
        "+ sessiz çığlık (2008) + kıpkırmızı zamanlar (2019) + yedi uyuyanlar (2014). sırayla ve yüksek sesle izlenmeli.",
    },
  },
  {
    id: "5",
    baslik: "spoiler vermeden yılın en iyi 3 dizisi",
    hakkinda: "sohbet · 2026",
    entrySayisi: 338,
    takip: 802,
    sonEntry: {
      yazar: "zeynep d.",
      yazarBas: "Z",
      zaman: "2 sa önce",
      metin:
        "1-gece vardiyası (film olarak değil, dizi versiyonu) 2-korku perdesi s4 3-ilk 5 bölümünde karar verebildiğim bir tek: rüzgarın hatıraları.",
    },
  },
];

export default function BaslikSayfasi() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 flex items-center gap-2">
              Başlıklar
              <MessageSquareText className="w-7 h-7 text-emerald-600" />
            </h1>
            <p className="text-stone-600">
              Ekşi + Twitter karışımı. Bir yapım bir başlık, altına entry.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni başlık
          </button>
        </div>

        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
          <strong>Önizleme:</strong> Başlık altyapısı henüz bağlı değil — aşağısı
          mockup. Spec: <code>ai_docs/gorevler/baslik.md</code>.
        </div>

        <div className="flex items-center gap-4 mb-5 text-sm">
          <button className="flex items-center gap-1.5 text-emerald-700 font-medium border-b-2 border-emerald-700 pb-2">
            <TrendingUp className="w-4 h-4" />
            Gündem
          </button>
          <button className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 pb-2">
            <Clock className="w-4 h-4" />
            Son hareket
          </button>
        </div>

        <div className="space-y-3">
          {basliklar.map((b) => (
            <BaslikKart key={b.id} baslik={b} />
          ))}
        </div>
      </div>
    </main>
  );
}

function BaslikKart({ baslik }: { baslik: Baslik }) {
  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-emerald-700 hover:text-emerald-800 leading-snug">
            {baslik.baslik}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">{baslik.hakkinda}</p>
        </div>
        <div className="text-right text-xs text-stone-500 shrink-0">
          <p>
            <strong className="text-stone-900">{baslik.entrySayisi}</strong> entry
          </p>
          <p>{baslik.takip} takip</p>
        </div>
      </div>

      <div className="bg-stone-50 border-l-2 border-emerald-500 pl-3 pr-3 py-2.5 rounded">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
            {baslik.sonEntry.yazarBas}
          </div>
          <span className="text-xs text-stone-700 font-medium">{baslik.sonEntry.yazar}</span>
          <span className="text-xs text-stone-400">· {baslik.sonEntry.zaman}</span>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          {baslik.sonEntry.metin}
        </p>
      </div>
    </article>
  );
}
