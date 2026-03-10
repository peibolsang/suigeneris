import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 flex justify-center border-b border-[var(--line)] px-2 pb-4 pt-6">
      <Link
        href="/"
        aria-label="Sui géneris"
        className="inline-flex flex-col items-center gap-2 text-[var(--foreground)]"
      >
        <Image
          src="/logo.png"
          alt="Sui géneris"
          width={1030}
          height={601}
          priority
          className="h-auto w-[min(220px,48vw)] translate-x-[-0.6%]"
        />

        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-center text-[var(--muted)]">
          Textiles con biografía
        </p>
      </Link>
    </header>
  );
}
