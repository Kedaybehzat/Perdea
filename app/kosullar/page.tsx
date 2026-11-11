import Link from "next/link";
import YasalSayfa from "@/components/YasalSayfa";
import { yasal } from "@/lib/yasal";

export const metadata = {
  title: "Kullanım Koşulları — Perdea",
  description: "Perdea'yı kullanırken geçerli kurallar.",
};

export default function KosullarSayfasi() {
  return (
    <YasalSayfa baslik="Kullanım Koşulları">
      <section>
        <h2>1. Kimler kullanabilir?</h2>
        <p>
          {yasal.urunAdi}’yı kullanmak için 18 yaşını doldurmuş olman gerekir. Hesap açarak bunu ve
          bu koşulları kabul etmiş olursun.
        </p>
      </section>

      <section>
        <h2>2. Hesabın</h2>
        <ul>
          <li>Hesabın sana aittir; başkası adına hesap açma, hesabını devretme.</li>
          <li>Şifreni kimseyle paylaşma. Hesabınla yapılan işlemlerden sen sorumlusun.</li>
          <li>Bir kişi, bir hesap. Engellendikten sonra yeni hesapla dönmek yasak.</li>
        </ul>
      </section>

      <section>
        <h2>3. Yapmaman gerekenler</h2>
        <ul>
          <li>Taciz, tehdit, nefret söylemi, ısrarlı ve istenmeyen mesaj.</li>
          <li>Cinsel içerikli ya da şiddet içeren fotoğraf ve ses göndermek.</li>
          <li>Başkasının kişisel bilgilerini (adres, telefon, fotoğraf) izinsiz paylaşmak.</li>
          <li>Sahte profil, dolandırıcılık, para ya da hediye istemek.</li>
          <li>Reklam, spam ve otomatik araçlarla içerik üretmek.</li>
          <li>Telif hakkı sana ait olmayan içeriği kendi içeriğinmiş gibi paylaşmak.</li>
          <li>Entry ve gönderilerde uyarı koymadan önemli olay örgüsü (spoiler) vermek hoş karşılanmaz.</li>
        </ul>
      </section>

      <section>
        <h2>4. İçeriğin</h2>
        <p>
          Yazdığın ve gönderdiğin her şey senindir. Bunları {yasal.urunAdi} içinde gösterebilmemiz
          için bize sitede yayımlama izni vermiş olursun. İstediğin zaman silebilirsin.
        </p>
        <p>
          Kurallara aykırı içeriği kaldırabilir, tekrarlayan ihlallerde hesabı askıya alabilir ya da
          kapatabiliriz.
        </p>
      </section>

      <section>
        <h2>5. Buluşmalar ve güvenlik</h2>
        <p>
          Cosplay buluşmaları ve eşleşmeler üyeler arasındadır; {yasal.urunAdi} buluşmaları
          düzenlemez, katılımcıların kimliğini doğrulamaz ve buluşmalarda olanlardan sorumlu
          tutulamaz. Yüz yüze görüşeceksen kalabalık, halka açık bir yer seç ve birine haber ver.
        </p>
        <p>
          Seni rahatsız eden birini sohbetten engelleyebilir, her içeriğin altındaki “Bildir”
          bağlantısıyla bize iletebilirsin.
        </p>
      </section>

      <section>
        <h2>6. Hizmet</h2>
        <p>
          {yasal.urunAdi} erken aşamada ve ücretsizdir. Kesintisiz çalışacağını garanti edemeyiz;
          özellikler değişebilir ya da kaldırılabilir. Film ve dizi bilgileri TMDB’den gelir;
          doğruluğu TMDB’ye aittir.
        </p>
      </section>

      <section>
        <h2>7. Değişiklikler ve iletişim</h2>
        <p>
          Bu koşulları güncellersek sitede duyururuz. Kişisel verilerin için{" "}
          <Link href="/kvkk">Aydınlatma Metni</Link>’ne bak. Soruların için:{" "}
          <a href={`mailto:${yasal.eposta}`}>{yasal.eposta}</a>
        </p>
      </section>
    </YasalSayfa>
  );
}
