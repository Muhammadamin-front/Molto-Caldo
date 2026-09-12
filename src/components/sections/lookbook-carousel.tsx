"use client";

import { useRouter } from "@/i18n/navigation";
import { CoverFlowCarousel, type CarouselItem } from "@/components/ui/3-d-coverflow-carousel";

export function LookbookCarousel({
  items,
  sectionLabel,
}: {
  items: CarouselItem[];
  sectionLabel: string;
}) {
  const router = useRouter();

  return (
    <CoverFlowCarousel
      items={items}
      sectionLabel={sectionLabel}
      autoplay
      autoplayDelay={5200}
      onCtaClick={(item) => {
        if (item.ctaUrl) router.push(item.ctaUrl);
      }}
    />
  );
}
