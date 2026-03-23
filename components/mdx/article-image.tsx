import Image from "next/image";

type ArticleImageProps = {
  src: string;
  alt: string;
  caption: string;
};

export function ArticleImage({ src, alt, caption }: ArticleImageProps) {
  return (
    <figure className="mb-10 mt-10 overflow-hidden border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)] first:mt-0">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover"
        />
      </div>
      <figcaption className="px-2 pb-1 pt-4 text-sm leading-[1.45] tracking-normal text-[var(--muted)]">
        {caption}
      </figcaption>
    </figure>
  );
}
