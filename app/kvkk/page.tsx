import Link from "next/link";
import YasalSayfa from "@/components/YasalSayfa";
import { yasal } from "@/lib/yasal";

export const metadata = {
  title: "KVKK Aydınlatma Metni — Perdea",
  description: "Perdea'nın kişisel verilerini nasıl işlediği.",
};

export default function KvkkSayfasi() {
  const eksik = <em className="text-stone-500">(henüz eklenmedi)</em>;
  return (
    <YasalSayfa baslik="Kişisel Verilerin Korunması: Aydınlatma Metni">
      <section>
        <h2>1. Veri sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu:{" "}
          <strong>{yasal.veriSorumlusu || eksik}</strong>
          {" · "}Adres: {yasal.adres || eksik}
          {" · "}E-posta: <a href={`mailto:${yasal.eposta}`}>{yasal.eposta}</a>
        </p>
        <p>
          Bu metin, {yasal.urunAdi} hesabı açtığında ve siteyi kullandığında hangi verilerinin, hangi
          amaçla ve nasıl işlendiğini anlatır.
        </p>
      </section>

      <section>
        <h2>2. İşlediğimiz veriler</h2>
        <ul>
          <li><strong>Kimlik ve iletişim:</strong> e-posta adresin, kullanıcı adın, görünen adın.</li>
          <li><strong>Profil:</strong> hakkında yazdığın kısa metin ve profil görselin.</li>
          <li><strong>Zevk verileri:</strong> favorilerin ve yapımlara verdiğin puanlar.</li>
          <li><strong>Eşleşme:</strong> başka üyeler için verdiğin beğen/geç kararları ve engellediğin kişiler.</li>
          <li><strong>İçerik:</strong> yazdığın entry’ler, gönderiler, salon puanları ve yorumları, açtığın ya da katıldığın buluşmalar, oyun odalarındaki hamlelerin.</li>
          <li><strong>Mesajlar:</strong> birebir sohbetlerde gönderdiğin yazı, fotoğraf ve sesli mesajlar.</li>
          <li><strong>İşlem güvenliği:</strong> oturum çerezleri, giriş zamanı ve IP adresi gibi teknik kayıtlar.</li>
        </ul>
        <p>
          Senden kimlik numarası, konum, rehber ya da ödeme bilgisi istemiyoruz. Gönderdiğin
          fotoğrafların içindeki konum (EXIF) bilgisi yüklenmeden önce silinir.
        </p>
      </section>

      <section>
        <h2>3. Neden işliyoruz, hukuki dayanağımız ne?</h2>
        <ul>
          <li>
            Hesabını açmak ve hizmeti sunmak (eşleşme, sohbet, başlıklar, oyun, buluşmalar):
            sözleşmenin kurulması ve ifası (KVKK m.5/2-c).
          </li>
          <li>
            Güvenliği sağlamak, kötüye kullanımı ve şikâyetleri incelemek: meşru menfaat (m.5/2-f)
            ve hukuki yükümlülük (m.5/2-ç).
          </li>
          <li>
            Verilerinin yurt dışındaki altyapı sağlayıcılarında saklanması: kayıt sırasında verdiğin
            açık rıza (m.9).
          </li>
        </ul>
        <p>Verilerini reklam amacıyla satmıyor, üçüncü kişilerle pazarlama için paylaşmıyoruz.</p>
      </section>

      <section>
        <h2>4. Kimlerle paylaşılıyor?</h2>
        <ul>
          <li>
            <strong>Diğer üyeler:</strong> kullanıcı adın, profilin, favorilerin, puanların, entry ve
            gönderilerin herkese açıktır. Mesajların yalnızca yazıştığın kişiye görünür.
          </li>
          <li>
            <strong>Altyapı sağlayıcıları:</strong> veritabanı, kimlik doğrulama ve dosya saklama için
            Supabase; sitenin barındırılması için barındırma sağlayıcımız. Bu sağlayıcıların
            sunucuları yurt dışında olabilir.
          </li>
          <li>
            <strong>Film verisi:</strong> afiş ve yapım bilgileri TMDB’den alınır; TMDB’ye senin
            hakkında bilgi gönderilmez.
          </li>
          <li><strong>Yetkili kurumlar:</strong> yasal bir zorunluluk olduğunda.</li>
        </ul>
      </section>

      <section>
        <h2>5. Ne kadar saklıyoruz?</h2>
        <p>
          Verilerin hesabın açık olduğu sürece saklanır. Hesabını sildiğinde profilin, favorilerin,
          puanların, yazdıkların ve mesajların silinir. Yasal olarak saklamak zorunda olduğumuz
          kayıtlar, ilgili mevzuatın öngördüğü süre boyunca tutulur.
        </p>
      </section>

      <section>
        <h2>6. Hakların</h2>
        <p>KVKK’nın 11. maddesi uyarınca şunları isteyebilirsin:</p>
        <ul>
          <li>verilerinin işlenip işlenmediğini öğrenmek ve bilgi almak,</li>
          <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenmek,</li>
          <li>yurt içinde ya da yurt dışında aktarıldığı kişileri bilmek,</li>
          <li>eksik ya da yanlış işlenmişse düzeltilmesini istemek,</li>
          <li>silinmesini ya da yok edilmesini istemek,</li>
          <li>otomatik sistemlerle analiz sonucu aleyhine bir sonuç çıkmasına itiraz etmek,</li>
          <li>kanuna aykırı işleme nedeniyle zarara uğradıysan zararının giderilmesini talep etmek.</li>
        </ul>
        <p>
          Hesabını ve verilerini kendin de silebilirsin:{" "}
          <Link href="/profil/duzenle#hesabi-sil">Profili düzenle → Hesabı sil</Link>. Diğer
          talepler için <a href={`mailto:${yasal.eposta}`}>{yasal.eposta}</a> adresine yaz; en geç
          30 gün içinde yanıtlarız.
        </p>
      </section>

      <section>
        <h2>7. Çerezler</h2>
        <p>
          Yalnızca oturumunu açık tutmak için zorunlu çerezler kullanıyoruz. Reklam ya da izleme
          çerezi kullanmıyoruz.
        </p>
      </section>

      <section>
        <h2>8. Yaş sınırı</h2>
        <p>
          {yasal.urunAdi} yalnızca 18 yaşını doldurmuş kişiler içindir. 18 yaşından küçük birinin
          hesap açtığını fark edersek hesabı kapatırız.
        </p>
      </section>
    </YasalSayfa>
  );
}
