import Link from "next/link";
import { Flame, MessagesSquare, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { basliklariListele, sonEntryler } from "@/lib/baslik";
import { goreceli } from "@/lib/zaman";
import PerdeBandi from "@/components/ui/PerdeBandi";
import BosDurum from "@/components/ui/BosDurum";
import KurulumNotu from "@/components/ui/KurulumNotu";
import Avatar from "@/components/ui/Avatar";
import { BaslikAcFormu } from "./Formlar";

export const metadata = {
  title: "Başlıklar — Perdea",
  description: "Bir yapım, bir başlık; altına herkes iki satır yazar.",
};

type Sira = "gundem" | "yeni" | "kalabalik";

export default async function BasliklarSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sirala?: string }>;
}) {
  const { q, sirala } = await searchParams;
  const sorgu = (q ?? "").trim().slice(0, 80);
  const sira: Sira = sirala === "yeni" || sirala === "kalabalik" ? sirala : "gundem";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ basliklar, kurulumEksik }, sonlar] = await Promise.all([
    basliklariListele({ q: sorgu, sirala: sira }),
    sorgu ? Promise.resolve([]) : sonEntryler(4),
  ]);

  const baglanti = (s: Sira) => {
    const p = new URLSearchParams();
    if (sorgu) p.set("q", sorgu);
    if (s !== "gundem") p.set("sirala", s);
    const t = p.toString();
    return t ? `/baslik?${t}` : "/baslik";
  };

  return (
    <main className="bg-stone-50 min-h-screen">
      <PerdeBandi
        ustEtiket="Başlıklar"
        baslik="Herkesin bir"
        vurgu="çift lafı var"
        aciklama="Bir film, bir sahne, bir karakter. Başlığı aç, altına iki satır yaz; gerisi gelir."
      >
        <form action="/baslik" method="get" role="search" className="flex gap-2 md:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              name="q"
              defaultValue={sorgu}
              placeholder="Başlık ara"
              aria-label="Başlık ara"
              className="alan pl-10! border-transparent!"
            />
          </div>
          <button type="submit" className="dugme bg-altin! text-perde-950! hover:brightness-105 shadow-none!">
            Ara
          </button>
        </form>
      </PerdeBandi>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 items-start">
        <div className="min-w-0">
          {kurulumEksik && <KurulumNotu dosya="docs/migrations/2026-11-11b_sohbet_baslik_akis.sql" />}

          <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
            <nav className="inline-flex p-1 bg-stone-200/70 rounded-xl" aria-label="Sıralama">
              {([
                ["gundem", "Gündem"],
                ["yeni", "Yeni açılan"],
                ["kalabalik", "En kalabalık"],
              ] as const).map(([s, etiket]) => (
                <Link
                  key={s}
                  href={baglanti(s)}
                  aria-current={sira === s ? "page" : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sira === s ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {etiket}
                </Link>
              ))}
            </nav>
            {sorgu && (
              <p className="text-sm text-stone-500">
                <strong className="text-stone-900">“{sorgu}”</strong> için {basliklar.length} başlık ·{" "}
                <Link href="/baslik" className="underline underline-offset-4 hover:text-stone-900">
                  temizle
                </Link>
              </p>
            )}
          </div>

          {basliklar.length === 0 ? (
            <BosDurum
              icon={MessagesSquare}
              baslik={sorgu ? "Bu başlık henüz açılmamış" : "İlk başlığı sen aç"}
              aciklama={
                sorgu
                  ? `“${sorgu}” diye bir başlık yok. Yandaki formdan açabilirsin.`
                  : "Son izlediğin şey hakkında iki satır yaz; başlık böyle başlar."
              }
            />
          ) : (
            <ol className="sirali bg-white border border-stone-200 rounded-3xl divide-y divide-stone-100 overflow-hidden">
              {basliklar.map((b, i) => (
                <li key={b.id}>
                  <Link
                    href={`/baslik/${b.slug}`}
                    className="group flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-display text-2xl font-bold text-stone-300 w-8 text-right tabular-nums group-hover:text-emerald-600 transition-colors">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors [overflow-wrap:anywhere]">
                        {b.baslik}
                      </span>
                      <span className="text-sm text-stone-500">
                        son entry {goreceli(b.son_entry_at)}
                      </span>
                    </span>
                    {b.bugun > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-altin-koyu bg-amber-50 border border-altin/40 px-2 py-1 rounded-full">
                        <Flame className="w-3.5 h-3.5" />
                        bugün {b.bugun}
                      </span>
                    )}
                    <span className="text-right shrink-0">
                      <span className="block font-display text-2xl font-bold text-stone-900 leading-none tabular-nums">
                        {b.entry_sayisi}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-stone-500">entry</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}

          {sonlar.length > 0 && (
            <section className="mt-12 goster">
              <h2 className="text-3xl font-bold text-stone-900 mb-5">Az önce yazılanlar</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sonlar.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/baslik/${e.slug}`}
                      className="kalkar block h-full bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-300"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 mb-2 line-clamp-1">
                        {e.baslik}
                      </p>
                      <p className="text-stone-800 leading-relaxed line-clamp-3 [overflow-wrap:anywhere]">{e.icerik}</p>
                      <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                        <Avatar ad={e.display_name || e.username || "Üye"} url={e.avatar_url} boyut="xs" />
                        {e.username ?? "üye"} · {goreceli(e.created_at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 bg-white border border-stone-200 rounded-3xl p-6" id="baslik-ac">
          <h2 className="text-2xl font-bold text-stone-900 mb-1">Başlık aç</h2>
          <p className="text-sm text-stone-600 mb-5">
            Aynı başlık zaten varsa yazdığın oraya eklenir.
          </p>
          {user ? (
            <BaslikAcFormu onBaslik={basliklar.length === 0 ? sorgu : ""} />
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/giris" className="dugme">Yazmak için giriş yap</Link>
              <Link href="/kayit" className="dugme-cizgi">Kayıt ol</Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
