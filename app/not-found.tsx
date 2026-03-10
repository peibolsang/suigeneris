import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pb-16 pt-16">
      <section className="panel p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-6xl leading-none tracking-[-0.06em]">
          Esa historia no está en el archivo.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Vuelve a portada para seguir explorando prendas, tejidos y genealogías
          del vestir masculino.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-[var(--line-strong)] bg-[rgba(255,248,240,0.84)] px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] transition-colors hover:bg-white"
        >
          Volver a portada
        </Link>
      </section>
    </main>
  );
}
