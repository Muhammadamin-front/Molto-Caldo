"use client";

import { AnimatedFolder } from "@/components/ui/3d-folder";
import type { Product } from "@/lib/catalog";

/**
 * Har bir kategoriya — bitta papka. Bosilganda ichidagi modellar chiqadi.
 */
export function Collections({
  groups,
  countLabel,
  hoverLabel,
  viewLabel,
}: {
  groups: { title: string; gradient: string; products: Product[] }[];
  countLabel: string;
  hoverLabel: string;
  viewLabel: string;
}) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <AnimatedFolder
          key={g.title}
          title={g.title}
          gradient={g.gradient}
          className="w-full"
          countLabel={countLabel}
          hoverLabel={hoverLabel}
          viewLabel={viewLabel}
          projects={g.products.map((p) => ({
            id: String(p.id),
            image: p.images[0] ?? "",
            title: p.name,
            href: `/product/${p.slug}`,
          }))}
        />
      ))}
    </div>
  );
}
