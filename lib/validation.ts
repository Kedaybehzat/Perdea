// Saf doğrulama fonksiyonları — Supabase/form bağımlılığı yok.
// Her biri: geçerliyse null, geçersizse hata mesajı (string) döndürür.

export function emailDogrula(email: string): string | null {
  if (!email) return 'E-posta boş olamaz.'
  // basit ama işe yarar format kontrolü: bir @ ve bir . içermeli
  const format = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!format.test(email)) return 'Geçerli bir e-posta adresi gir.'
  return null
}

export function sifreDogrula(sifre: string): string | null {
  if (!sifre) return 'Şifre boş olamaz.'
  if (sifre.length < 8) return 'Şifre en az 8 karakter olmalı.'
  return null
}

export function sifreEslesmeDogrula(sifre: string, sifreTekrar: string): string | null {
  if (sifre !== sifreTekrar) return 'Şifreler eşleşmiyor.'
  return null
}

export function kullaniciAdiDogrula(kullaniciAdi: string): string | null {
  if (!kullaniciAdi) return 'Kullanıcı adı boş olamaz.'
  if (kullaniciAdi.length < 3) return 'Kullanıcı adı en az 3 karakter olmalı.'
  if (kullaniciAdi.length > 20) return 'Kullanıcı adı en fazla 20 karakter olabilir.'
  // sadece harf, rakam, alt çizgi
  const format = /^[a-zA-Z0-9_]+$/
  if (!format.test(kullaniciAdi)) return 'Kullanıcı adı sadece harf, rakam ve _ içerebilir.'
  return null
}