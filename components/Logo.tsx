import Image from "next/image";
import Link from "next/link";

// Perdea wordmark: fil-kamera amblemi + afiş serifiyle isim.
export default function Logo({
  koyuZemin = false,
  boyut = "md",
}: {
  koyuZemin?: boolean;
  boyut?: "md" | "lg";
}) {
  const yazi = boyut === "lg" ? "text-4xl" : "text-[1.7rem]";
  const amblem = boyut === "lg" ? "w-11 h-11" : "w-9 h-9";
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Perdea ana sayfa">
      <Image
        src="/logo.png"
        alt=""
        width={44}
        height={44}
        className={`${amblem} rounded-lg ${koyuZemin ? "bg-stone-50 p-0.5" : ""}`}
        priority
      />
      <span
        className={`font-display font-bold leading-none tracking-tight ${yazi} ${
          koyuZemin ? "text-stone-50" : "text-emerald-700"
        }`}
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        Perdea
      </span>
    </Link>
  );
}
