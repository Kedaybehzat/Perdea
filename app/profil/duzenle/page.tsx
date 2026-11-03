import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DuzenleFormu from "./DuzenleFormu";

type Props = {
  searchParams: Promise<{ hata?: string }>;
};

export default async function ProfilDuzenlePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: profil } = await supabase
    .from("users")
    .select("username, display_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  const { hata } = await searchParams;

  return (
    <main className="bg-stone-50 min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Profili Düzenle
        </h1>
        <p className="text-stone-600 mb-6">
          Kullanıcı adın (<span className="font-medium">@{profil?.username}</span>)
          sabit — görünen isim, bio ve avatarını güncelleyebilirsin.
        </p>
        <DuzenleFormu
          baslangic={{
            display_name: profil?.display_name ?? "",
            bio: profil?.bio ?? "",
            avatar_url: profil?.avatar_url ?? "",
          }}
          hata={hata}
        />
      </div>
    </main>
  );
}
