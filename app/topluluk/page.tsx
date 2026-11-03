import Link from "next/link";
import { MessageCircle, Heart, Plus, Flame, Tag, Clock } from "lucide-react";

export const metadata = {
  title: "Topluluk — Perdea",
  description: "Sinefillerin konuştuğu yer. Film, dizi, anime — hepsi.",
};

type Post = {
  id: string;
  yazar: string;
  yazarBas: string;
  zaman: string;
  baslik: string;
  icerik: string;
  hakkinda: string;
  yorumSayisi: number;
  begeni: number;
  etiketler: string[];
};

const ornekPostlar: Post[] = [
  {
    id: "1",
    yazar: "selin t.",
    yazarBas: "S",
    zaman: "2 saat önce",
    baslik: "Korku Perde'nin Yeni Sezonu — Eski Mi, Taze Mi?",
    icerik:
      "İki bölümü izledim, ritmi eski sezonlardan farklı — daha sessiz, daha yavaş. Benim için işliyor, siz nasıl buldunuz?",
    hakkinda: "Korku Perdesi · S4",
    yorumSayisi: 24,
    begeni: 86,
    etiketler: ["korku", "yeni-sezon"],
  },
  {
    id: "2",
    yazar: "efe karaman",
    yazarBas: "E",
    zaman: "5 saat önce",
    baslik: "Gece Vardiyası finalini kimse konuşmuyor mu?",
    icerik:
      "Finaldeki o ikinci kat sahnesi tam olarak ne anlama geliyordu? Benim okumam var ama önce sizinkini duymak isterim.",
    hakkinda: "Gece Vardiyası · 2026",
    yorumSayisi: 41,
    begeni: 132,
    etiketler: ["spoiler", "analiz"],
  },
  {
    id: "3",
    yazar: "mert a.",
    yazarBas: "M",
    zaman: "yarın",
    baslik: "Rüzgarın Hatıraları — Ghibli'ye alternatif önerisi arayana",
    icerik:
      "Tempo, renk paleti, duygu akışı — eski Ghibli filmlerine en çok yaklaşan anime dedim. Katılan var mı?",
    hakkinda: "Rüzgarın Hatıraları",
    yorumSayisi: 18,
    begeni: 67,
    etiketler: ["anime", "ghibli"],
  },
  {
    id: "4",
    yazar: "zeynep d.",
    yazarBas: "Z",
    zaman: "2 gün önce",
    baslik: "Kıpkırmızı Zamanlar — Türk sinemasının en az konuşulan filmi mi?",
    icerik:
      "Eleştirmenlerin görmediği ama izleyenin hayatta unutmadığı o filmlerden. Önerilerinizi ekleyelim thread olsun.",
    hakkinda: "Kıpkırmızı Zamanlar · 2019",
    yorumSayisi: 53,
    begeni: 204,
    etiketler: ["türk-sinemasi", "liste"],
  },
];

const gundemde = [
  { ad: "Korku Perdesi S4", konu: 142 },
  { ad: "Gece Vardiyası finali", konu: 98 },
  { ad: "Ghibli vs Modern Anime", konu: 74 },
  { ad: "Türk Sineması 2010-2020", konu: 61 },
  { ad: "Yeni vizyon tartışması", konu: 47 },
];

const populerEtiketler = [
  "korku", "analiz", "anime", "türk-sinemasi", "ghibli", "spoiler",
  "yeni-sezon", "liste", "retro", "indie", "belgesel",
];

export default function ToplulukSayfasi() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">
              Topluluk
            </h1>
            <p className="text-stone-600">
              Sinefillerin konuştuğu yer. Film, dizi, anime — hepsi.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni gönderi
          </button>
        </div>

        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
          <strong>Önizleme:</strong> Topluluk altyapısı henüz bağlı değil —
          aşağıdaki gönderiler mockup. Posts tablosu + feed oluşturulduğunda
          gerçek içerikle dolacak.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {ornekPostlar.map((p) => (
              <PostKart key={p.id} post={p} />
            ))}
          </div>

          <aside className="space-y-6">
            <section className="bg-white border border-stone-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-600" />
                Gündemde
              </h3>
              <ul className="space-y-3">
                {gundemde.map((g, i) => (
                  <li key={g.ad} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {g.ad}
                      </p>
                      <p className="text-xs text-stone-500">{g.konu} konu</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-stone-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Popüler Etiketler
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {populerEtiketler.map((e) => (
                  <span
                    key={e}
                    className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    #{e}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-emerald-800 mb-2">
                Bu akşam ne izlesem?
              </h3>
              <p className="text-sm text-emerald-700 leading-relaxed mb-3">
                Keşfet'ten favorilerine eklediğin yapımlardan türetilmiş öneriler yakında burada.
              </p>
              <Link
                href="/kesfet"
                className="inline-block text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg"
              >
                Keşfet'e git
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PostKart({ post }: { post: Post }) {
  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
          {post.yazarBas}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900">{post.yazar}</p>
          <p className="text-xs text-stone-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.zaman} · {post.hakkinda}
          </p>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-emerald-700 mb-2 hover:text-emerald-800 cursor-pointer">
        {post.baslik}
      </h2>
      <p className="text-sm text-stone-700 leading-relaxed mb-4">{post.icerik}</p>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm text-stone-500">
          <span className="flex items-center gap-1.5 hover:text-rose-600 cursor-pointer">
            <Heart className="w-4 h-4" />
            {post.begeni}
          </span>
          <span className="flex items-center gap-1.5 hover:text-emerald-700 cursor-pointer">
            <MessageCircle className="w-4 h-4" />
            {post.yorumSayisi}
          </span>
        </div>
        <div className="flex gap-1">
          {post.etiketler.map((e) => (
            <span
              key={e}
              className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
            >
              #{e}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
