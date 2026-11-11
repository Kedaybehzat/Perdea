import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

export type Profil = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type Deger = {
  yukleniyor: boolean;
  oturum: Session | null;
  profil: Profil | null;
  profiliYenile: () => Promise<void>;
};

const Baglam = createContext<Deger>({
  yukleniyor: true,
  oturum: null,
  profil: null,
  profiliYenile: async () => {},
});

export function OturumSaglayici({ children }: { children: ReactNode }) {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oturum, setOturum] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setOturum(data.session);
      setYukleniyor(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_olay, yeni) => setOturum(yeni));
    return () => data.subscription.unsubscribe();
  }, []);

  const kullaniciId = oturum?.user.id;

  async function profiliYenile() {
    if (!kullaniciId) {
      setProfil(null);
      return;
    }
    const { data } = await supabase
      .from("users")
      .select("id, username, display_name, bio, avatar_url")
      .eq("id", kullaniciId)
      .maybeSingle();
    setProfil((data as Profil | null) ?? null);
  }

  useEffect(() => {
    void profiliYenile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullaniciId]);

  return (
    <Baglam.Provider value={{ yukleniyor, oturum, profil, profiliYenile }}>{children}</Baglam.Provider>
  );
}

export function useOturum() {
  return useContext(Baglam);
}
