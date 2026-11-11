// Her sayfa geçişinde içerik yumuşakça gelir. (template, layout'un aksine
// her navigasyonda yeniden bağlanır; animasyon bu yüzden tekrar oynar.)
export default function Sablon({ children }: { children: React.ReactNode }) {
  return <div className="animate-sayfa">{children}</div>;
}
