'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  emailDogrula,
  sifreDogrula,
  sifreEslesmeDogrula,
  kullaniciAdiDogrula,
} from "@/lib/validation"

export async function kayitOl(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('passwordConfirm') as string
  const username = formData.get('username') as string

  // ADIM 0: DOĞRULAMA (Supabase'e gitmeden önce)
  const hata =
    emailDogrula(email) ??
    sifreDogrula(password) ??
    sifreEslesmeDogrula(password, passwordConfirm) ??
    kullaniciAdiDogrula(username)

  if (hata) {
    redirect('/kayit?hata=' + encodeURIComponent(hata))
  }

  // Yaş beyanı + koşullar + KVKK açık rızası olmadan hesap açılmaz.
  if (formData.get('onay') !== 'evet') {
    redirect('/kayit?hata=' + encodeURIComponent('Devam etmek için 18 yaş beyanını ve koşulları onaylamalısın.'))
  }

  // ADIM 1: auth kimliği oluştur
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/kayit?hata=' + encodeURIComponent(error.message))
  }

  // ADIM 2: users tablosuna profil satırı ekle
  let { error: profilHatasi } = await supabase.from('users').insert({
    id: data.user!.id,
    username: username,
    kvkk_onay_at: new Date().toISOString(),
  })
  // Onay sütunu henüz yoksa (son migration çalışmadıysa) kayıt yine de tamamlansın.
  if (profilHatasi && (profilHatasi.code === 'PGRST204' || profilHatasi.code === '42703')) {
    ;({ error: profilHatasi } = await supabase.from('users').insert({
      id: data.user!.id,
      username: username,
    }))
  }

  if (profilHatasi) {
    if (profilHatasi.code === '23505') {
      redirect('/kayit?hata=' + encodeURIComponent('Bu kullanıcı adı zaten alınmış.'))
    }
    redirect('/kayit?hata=' + encodeURIComponent(profilHatasi.message))
  }

  redirect('/')
}