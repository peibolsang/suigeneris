import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import { slugify } from "@/lib/slugify";

function getNodeText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getNodeText(child.props.children);
      }

      return "";
    })
    .join("")
    .trim();
}

type MdxHeadingProps = {
  children: ReactNode;
};

export function MdxHeading2({ children }: MdxHeadingProps) {
  const title = getNodeText(children);

  return (
    <h2 id={slugify(title)} className="article-anchor">
      {children}
    </h2>
  );
}

export function MdxHeading3({ children }: MdxHeadingProps) {
  const title = getNodeText(children);

  return (
    <h3 id={slugify(title)} className="article-anchor">
      {children}
    </h3>
  );
}
