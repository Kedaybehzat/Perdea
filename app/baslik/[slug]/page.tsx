import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { baslikGetir, begendigimEntryler, entryleriGetir } from "@/lib/baslik";
import { goreceli, tarihUzun } from "@/lib/zaman";
import Avatar from "@/components/ui/Avatar";
import BegenDugmesi from "@/components/ui/BegenDugmesi";
import BildirFormu from "@/components/ui/BildirFormu";
import { EntryFormu } from "../Formlar";
import { entryBegenAction, entrySikayetAction, entrySilAction } from "../actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sirala?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const b = await baslikGetir(decodeURIComponent(slug));
  return {
    title: b ? `${b.baslik} — Perdea` : "Başlık bulunamadı — Perdea",
    description: b ? `“${b.baslik}” başlığında ${b.entry_sayisi} entry.` : undefined,
  };
}

export default async function BaslikSayfasi({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sirala } = await searchParams;
  const sira = sirala === "yeni" || sirala === "begeni" ? sirala : "eski";

  const baslik = await baslikGetir(decodeURIComponent(slug));
  if (!baslik) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const entryler = await entryleriGetir(baslik.id, sira);
  const begendiklerim = await begendigimEntryler(entryler.map((e) => e.id));

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/baslik" className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-5">
          <ArrowLeft className="w-4 h-4" />
          Başlıklar
        </Link>

        <header className="mb-6 animate-belir">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 leading-[1.05] [overflow-wrap:anywhere]">
            {baslik.baslik}
          </h1>
          <p className="mt-3 text-stone-500">
            {baslik.entry_sayisi} entry · {tarihUzun(baslik.created_at)} tarihinde açıldı
          </p>
        </header>

        <nav className="inline-flex p-1 bg-stone-200/70 rounded-xl mb-5" aria-label="Sıralama">
          {([
            ["eski", "Baştan"],
            ["yeni", "Sondan"],
            ["begeni", "En beğenilen"],
          ] as const).map(([s, etiket]) => (
            <Link
              key={s}
              href={s === "eski" ? `/baslik/${baslik.slug}` : `/baslik/${baslik.slug}?sirala=${s}`}
              aria-current={sira === s ? "page" : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                sira === s ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {etiket}
            </Link>
          ))}
        </nav>

        <ol className="sirali space-y-4">
          {entryler.map((e) => {
            const ad = e.display_name || e.username || "Perdea üyesi";
            return (
              <li key={e.id} id={`e-${e.id}`} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6">
                <p className="text-stone-900 text-lg leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {e.icerik}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar ad={ad} url={e.avatar_url} boyut="sm" />
                    <span className="text-sm text-stone-600 truncate">
                      {e.username ? (
                        <Link href={`/u/${e.username}`} className="font-semibold text-stone-900 hover:text-emerald-700">
                          {e.username}
                        </Link>
                      ) : (
                        <span className="font-semibold text-stone-900">{ad}</span>
                      )}{" "}
                      · {goreceli(e.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BegenDugmesi
                      begenildi={begendiklerim.has(e.id)}
                      sayi={e.begeni_sayisi}
                      girisli={Boolean(user)}
                      degistir={entryBegenAction.bind(null, e.id)}
                    />
                    {user?.id === e.user_id && (
                      <form action={entrySilAction.bind(null, e.id, baslik.slug)}>
                        <button
                          type="submit"
                          aria-label="Entry'yi sil"
                          title="Sil"
                          className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                {user && user.id !== e.user_id && (
                  <div className="mt-3">
                    <BildirFormu hedefId={e.id} action={entrySikayetAction} ozet="Bildir" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {entryler.length === 0 && (
          <p className="text-stone-500 bg-white border border-dashed border-stone-300 rounded-3xl px-6 py-10 text-center">
            Bu başlıkta entry kalmamış. İlkini sen yaz.
          </p>
        )}

        <section className="mt-8 bg-white border border-stone-200 rounded-3xl p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Sen ne dersin?</h2>
          {user ? (
            <EntryFormu baslikId={baslik.id} slug={baslik.slug} />
          ) : (
            <div className="flex gap-2 flex-wrap">
              <Link href="/giris" className="dugme">Yazmak için giriş yap</Link>
              <Link href="/kayit" className="dugme-cizgi">Kayıt ol</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
