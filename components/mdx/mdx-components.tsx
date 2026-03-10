import type { MDXComponents } from "mdx/types";
import { ArticleImage } from "@/components/mdx/article-image";
import { MdxHeading2, MdxHeading3 } from "@/components/mdx/heading";
import { PullQuote } from "@/components/mdx/pull-quote";

export const mdxComponents: MDXComponents = {
  ArticleImage,
  PullQuote,
  h2: MdxHeading2,
  h3: MdxHeading3,
};
