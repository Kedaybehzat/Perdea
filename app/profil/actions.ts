'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function profilGuncelle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const displayNameRaw = (formData.get("display_name") as string) ?? "";
  const bioRaw = (formData.get("bio") as string) ?? "";
  const avatarUrlRaw = (formData.get("avatar_url") as string) ?? "";

  const display_name = displayNameRaw.trim().slice(0, 50) || null;
  const bio = bioRaw.trim().slice(0, 240) || null;
  const avatar_url = avatarUrlRaw.trim() || null;

  if (avatar_url && !/^https?:\/\//i.test(avatar_url)) {
    redirect(
      "/profil/duzenle?hata=" +
        encodeURIComponent("Avatar bağlantısı http(s):// ile başlamalı.")
    );
  }

  const { error } = await supabase
    .from("users")
    .update({ display_name, bio, avatar_url })
    .eq("id", user.id);

  if (error) {
    redirect("/profil/duzenle?hata=" + encodeURIComponent(error.message));
  }

  redirect("/profil");
}


// Hesabı ve hesaba bağlı her şeyi kalıcı olarak siler (KVKK silme hakkı).
export async function hesabiSil(_onceki: { hata?: string }, formData: FormData): Promise<{ hata?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  if (String(formData.get("onay") ?? "").trim().toLocaleUpperCase("tr-TR") !== "SİL") {
    return { hata: "Onaylamak için kutuya SİL yaz." };
  }

  const { error } = await supabase.rpc("hesabimi_sil");
  if (error) {
    return { hata: "Hesap silinemedi. Biraz sonra yeniden dene ya da bize yaz." };
  }
  await supabase.auth.signOut();
  redirect("/?hesap=silindi");
}
