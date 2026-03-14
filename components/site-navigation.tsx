"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

type NavigationItem = {
  label: string;
  href: string;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

type SiteNavigationProps = {
  groups: NavigationGroup[];
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SiteNavigation({ groups }: SiteNavigationProps) {
  return (
    <>
      <nav aria-label="Principal" className="hidden md:flex md:justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            {groups.map((group) => (
              <NavigationMenuPrimitiveItem key={group.label} group={group} />
            ))}
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
      </nav>

      <nav aria-label="Principal móvil" className="md:hidden">
        <ul className="grid gap-2">
          {groups.map((group) => (
            <li key={group.label} className="border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)]">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-sans text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  {group.label}
                  <span className="text-base leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <ul className="grid gap-1 border-t border-[var(--line)] px-2 py-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-3 py-2 text-sm leading-none tracking-[-0.01em] text-[var(--foreground)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function NavigationMenuPrimitiveItem({ group }: { group: NavigationGroup }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{group.label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid min-w-[280px] gap-1 p-3">
          {group.items.map((item) => (
            <li key={item.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={joinClasses(
                    "block border border-transparent px-4 py-3 font-sans text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors hover:border-[var(--line)] hover:bg-white hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                  )}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
