import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sohbetler — Perdea",
  description: "Eşleştiğin kişilerle birebir sohbet.",
};
import {
  MessageCircle,
  Send,
  Smile,
  Film,
  Sparkles,
  Gamepad2,
  Phone,
  Video,
  MoreHorizontal,
} from "lucide-react";

type Sohbet = {
  id: string;
  ad: string;
  bas: string;
  sonMesaj: string;
  zaman: string;
  okunmamis: number;
  aktif?: boolean;
};

type Mesaj = {
  id: string;
  gonderen: "ben" | "o";
  metin: string;
  zaman: string;
};

const sohbetler: Sohbet[] = [
  { id: "1", ad: "Mert A.", bas: "M", sonMesaj: "ghibli'yi bir daha izleyelim derim", zaman: "şimdi", okunmamis: 2, aktif: true },
  { id: "2", ad: "Selin T.", bas: "S", sonMesaj: "korku perdesi finalini konuşmak ister misin", zaman: "5 dk", okunmamis: 0 },
  { id: "3", ad: "Deniz K.", bas: "D", sonMesaj: "aynı filmi izlemişiz 👀", zaman: "1 sa", okunmamis: 0 },
  { id: "4", ad: "Efe K.", bas: "E", sonMesaj: "sen de türk sinemasına takılı mısın", zaman: "dün", okunmamis: 0 },
  { id: "5", ad: "Zeynep D.", bas: "Z", sonMesaj: "oyun oynayalım mı — ben kimim?", zaman: "2 g", okunmamis: 0 },
];

const mesajlar: Mesaj[] = [
  { id: "1", gonderen: "o", metin: "selam, perdea'da favori listende rüzgarın hatıraları varmış, benim de 🫶", zaman: "19:12" },
  { id: "2", gonderen: "ben", metin: "evet! ghibli estetiği olan en son iyi anime bence", zaman: "19:14" },
  { id: "3", gonderen: "o", metin: "aynen. tempo farklı ama ruh aynı. ikinci kez izleyen buluyor zaten güzelliğini", zaman: "19:15" },
  { id: "4", gonderen: "ben", metin: "ikinci izleyişte fark ettiğim bir şey var — ışık renk paleti, mevsime göre değişiyor", zaman: "19:16" },
  { id: "5", gonderen: "o", metin: "ghibli'yi bir daha izleyelim derim, sonra oyun oynayalım 👾", zaman: "19:18" },
];

export default async function SohbetSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const aktifSohbet = sohbetler.find((s) => s.aktif) ?? sohbetler[0];

  return (
    <main className="bg-stone-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            Sohbetler
            <MessageCircle className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-sm text-stone-500">
            Eşleştiğin kişilerle birebir. Supabase bağlanınca kalıcı olur.
          </p>
        </div>

        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
          <strong>Önizleme:</strong> Mesajlaşma altyapısı henüz bağlı değil — mockup.
          Spec: <code>ai_docs/gorevler/ozel-chat.md</code>.
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] h-[70vh]">
          {/* Sohbet listesi */}
          <aside className="border-r border-stone-200 flex flex-col">
            <div className="p-3 border-b border-stone-200">
              <input
                type="search"
                placeholder="Sohbet ara..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>
            <ul className="flex-1 overflow-y-auto">
              {sohbetler.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`w-full text-left p-3 flex items-start gap-3 hover:bg-stone-50 border-l-2 ${
                      s.aktif ? "bg-emerald-50 border-emerald-600" : "border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      {s.bas}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-stone-900 truncate">
                          {s.ad}
                        </p>
                        <span className="text-xs text-stone-500 shrink-0">{s.zaman}</span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {s.sonMesaj}
                      </p>
                    </div>
                    {s.okunmamis > 0 && (
                      <span className="shrink-0 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {s.okunmamis}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Aktif sohbet */}
          <section className="flex flex-col min-h-0">
            <header className="p-3 border-b border-stone-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {aktifSohbet.bas}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900 truncate">
                    {aktifSohbet.ad}
                  </p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    %87 uyum
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/oyun"
                  className="inline-flex items-center gap-1.5 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                  title="Karakter oyunu başlat"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Oyun</span>
                </Link>
                <button className="p-2 text-stone-500 hover:text-stone-900 hidden sm:block" aria-label="Sesli ara">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-stone-500 hover:text-stone-900 hidden sm:block" aria-label="Görüntülü ara">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-stone-500 hover:text-stone-900" aria-label="Daha fazla">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full">
                  <Film className="w-3 h-3" />
                  Ortak favori: Rüzgarın Hatıraları
                </span>
              </div>
              {mesajlar.map((m) => (
                <MesajBalonu key={m.id} mesaj={m} />
              ))}
            </div>

            <form className="p-3 border-t border-stone-200 flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-stone-500 hover:text-emerald-700"
                aria-label="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Bir mesaj yaz..."
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gönder</span>
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function MesajBalonu({ mesaj }: { mesaj: Mesaj }) {
  const ben = mesaj.gonderen === "ben";
  return (
    <div className={`flex ${ben ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
          ben
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-stone-100 text-stone-900 rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed">{mesaj.metin}</p>
        <p
          className={`text-[10px] mt-1 ${
            ben ? "text-emerald-100" : "text-stone-500"
          }`}
        >
          {mesaj.zaman}
        </p>
      </div>
    </div>
  );
}
