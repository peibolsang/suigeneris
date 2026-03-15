import Image from "next/image";
import Link from "next/link";
import {
  categories,
  getFeaturedArticleSlug,
  storyTypes,
} from "@/lib/content";
import { SiteNavigation } from "@/components/site-navigation";

export async function SiteHeader() {
  const featuredArticleSlug = await getFeaturedArticleSlug();
  const categoryLinks = categories.map((category) => ({
    label: category.label,
    href: `/categorias/${category.slug}`,
  }));
  const storyTypeLinks = storyTypes.map((storyType) => ({
    label: storyType.label,
    href: `/explorar/${storyType.slug}`,
  }));
  const navigationGroups = [
    {
      label: "Estilos",
      items: categoryLinks,
    },
    {
      label: "Explorar",
      items: storyTypeLinks,
    },
    {
      label: "Lecturas",
      items: [
        {
          label: "Todo",
          href: "/lecturas",
        },
        {
          label: "Destacada",
          href: featuredArticleSlug ? `/articulos/${featuredArticleSlug}` : "/",
        },
        {
          label: "Lo último",
          href: "/#ultimas-historias",
        },
        {
          label: "Lo + popular",
          href: "/populares",
        },
      ],
    },
  ];

  return (
    <header className="relative z-10 px-2 pb-4 pt-6">
      <div className="flex justify-center">
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

          <p className="text-center font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Menswear con Biografía
          </p>
        </Link>
      </div>
      <div className="mt-6">
        <SiteNavigation groups={navigationGroups} />
      </div>
      <div className="mt-5 border-b border-[var(--line)]" />
    </header>
  );
}
