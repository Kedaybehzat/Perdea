import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Gamepad2, Sparkles, Check, X, HelpCircle, Film, Trophy } from "lucide-react";

export const metadata = {
  title: "Karakter Oyunu — Perdea",
  description: "Ortak favori yapımdan karakter seç, diğeri 20 soruyla bulmaya çalışsın.",
};

type Soru = {
  no: number;
  soru: string;
  cevap: "evet" | "hayır" | "belki";
};

const sorular: Soru[] = [
  { no: 1, soru: "Erkek karakter misin?", cevap: "evet" },
  { no: 2, soru: "Filmin ana karakterlerinden biri misin?", cevap: "evet" },
  { no: 3, soru: "Filmin başında yaşıyor musun?", cevap: "evet" },
  { no: 4, soru: "Bir uçakta görünüyor musun?", cevap: "hayır" },
  { no: 5, soru: "Rüzgar seninle konuşuyor mu?", cevap: "belki" },
];

export default async function OyunSayfasi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 flex items-center gap-2">
            Karakter Oyunu
            <Gamepad2 className="w-7 h-7 text-emerald-600" />
          </h1>
          <p className="text-stone-600">
            İkiniz de favori listenize eklediğiniz bir yapımdan karakter seçin —
            diğeri 20 soruyla bulmaya çalışsın. "Ben kimim?" versiyonu.
          </p>
        </div>

        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
          <strong>Önizleme:</strong> Oyun altyapısı henüz bağlı değil — aşağısı
          canlı oyun mockup'ı. Spec:{" "}
          <code>ai_docs/gorevler/karakter-oyunu.md</code>.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Oyun alanı */}
          <section className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-br from-emerald-700 to-emerald-800 text-white">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  <span className="font-semibold">Rüzgarın Hatıraları</span>
                  <span className="text-emerald-200 text-sm">· ortak favori</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white/15 rounded-lg px-3 py-1">
                  <Sparkles className="w-4 h-4" />
                  Soru 5 / 20
                </div>
              </div>
              <div className="mt-4 bg-white/10 border border-white/20 rounded-lg p-4">
                <p className="text-xs text-emerald-100 uppercase tracking-wider mb-1">
                  Mert A. bir karakter seçti — sen bulmaya çalışıyorsun.
                </p>
                <p className="text-sm">
                  Karakter gizli. Evet/hayır sorularıyla daralt. Hak:{" "}
                  <strong>15 soru</strong>, <strong>3 tahmin</strong>.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {sorular.map((s) => (
                <SoruSatiri key={s.no} soru={s} />
              ))}
            </div>

            <div className="border-t border-stone-200 p-4 bg-stone-50">
              <form className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Bir evet/hayır sorusu sor..."
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white text-sm"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Sor
                </button>
              </form>
              <div className="mt-2 text-xs text-stone-500 text-center">
                Veya doğrudan tahmin et:{" "}
                <button className="text-emerald-700 underline font-medium">
                  karakter adı gir
                </button>
              </div>
            </div>
          </section>

          {/* Yanıtlayıcı paneli (diğer kullanıcının bakış açısı) */}
          <aside className="space-y-4">
            <section className="bg-white border border-stone-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
                Rakip
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  M
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Mert A.</p>
                  <p className="text-xs text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    %87 uyum
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-stone-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                Skor
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-stone-900">2</p>
                  <p className="text-xs text-stone-500 mt-0.5">Sen</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-stone-900">1</p>
                  <p className="text-xs text-stone-500 mt-0.5">Mert</p>
                </div>
              </div>
            </section>

            <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-emerald-900 mb-2">
                Oyun nasıl çalışır?
              </h3>
              <ol className="text-sm text-emerald-800 space-y-1.5 list-decimal list-inside">
                <li>Ortak bir favori yapımdan karakter seçilir.</li>
                <li>Diğer oyuncu 20 soru + 3 tahmin hakkıyla bulmaya çalışır.</li>
                <li>Bulursa puan, bulamazsa karakter sahibi puan.</li>
                <li>Rolünüzü değiştirip devam edersiniz.</li>
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SoruSatiri({ soru }: { soru: Soru }) {
  const renk =
    soru.cevap === "evet"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : soru.cevap === "hayır"
      ? "bg-rose-50 border-rose-200 text-rose-700"
      : "bg-amber-50 border-amber-200 text-amber-800";
  const icon =
    soru.cevap === "evet" ? <Check className="w-4 h-4" /> : soru.cevap === "hayır" ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />;
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center">
        {soru.no}
      </span>
      <div className="flex-1">
        <p className="text-sm text-stone-900">{soru.soru}</p>
      </div>
      <span
        className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${renk}`}
      >
        {icon}
        {soru.cevap}
      </span>
    </div>
  );
}
