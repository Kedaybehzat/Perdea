'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { emailDogrula, sifreDogrula} from "@/lib/validation"

export async function girisYap(formData: FormData) {
  const supabase = await createClient()

  // 1. formdan email ve password'ü çek (username YOK)
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 2. DOĞRULAMA: emailDogrula ?? sifreDogrula  (?? zinciriyle, kayıttaki gibi)
  //    hata varsa → redirect('/giris?hata=' + encodeURIComponent(hata))
  const hata =
  emailDogrula(email) ??
  sifreDogrula(password)

  if(hata){
    redirect('/giris?hata=' + encodeURIComponent(hata))
  }

  // 3. giriş yap
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/giris?hata=' + encodeURIComponent(error.message))
  }

  // 4. başarılıysa anasayfaya
  redirect('/')
}