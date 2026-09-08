"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { clsx } from "clsx";

export function PropertyGallery({
  images,
  title,
}: {
  images: { url: string; alt: string | null }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const total = images.length;

  function next() {
    setActive((a) => (a + 1) % total);
  }
  function prev() {
    setActive((a) => (a - 1 + total) % total);
  }

  if (total === 0) {
    return <div className="aspect-[16/10] w-full rounded-2xl bg-navy-950/5" />;
  }

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-950/5">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label="View fullscreen"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-950 hover:bg-white"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-950 hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-950 hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-xs font-medium text-cream-50">
              {active + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clsx(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2",
                i === active ? "border-gold-500" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img.url} alt={img.alt ?? title} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4">
          <button
            onClick={() => setFullscreen(false)}
            aria-label="Close fullscreen"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-50 hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-50 hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={images[active].url}
              alt={images[active].alt ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-50 hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
