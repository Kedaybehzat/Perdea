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
