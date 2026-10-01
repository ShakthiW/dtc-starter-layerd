import { Metadata } from "next"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SPACES } from "@modules/spaces/registry"

export const metadata: Metadata = {
  title: "Spaces | LAYERD",
  description:
    "Walk through a living room, a work desk, a bedside and more, furnished with LAYERD objects designed and 3D printed in Sri Lanka.",
}

/** The spaces index: one card per room, each opening its scroll tour. */
export default function SpacesPage() {
  return (
    <div className="content-container py-12 small:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Spaces</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.02] small:text-7xl">Rooms to walk through.</h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
          Each space is furnished with pieces from the shop. Pick one, then scroll to move through it.
        </p>
      </header>

      <ul className="mt-12 grid gap-x-6 gap-y-14 small:mt-16 small:grid-cols-2">
        {SPACES.map((space, index) => (
          <li key={space.slug}>
            <LocalizedClientLink href={`/spaces/${space.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-large bg-surface">
                <Image
                  src={space.plates[space.poster].src}
                  alt={space.alt}
                  fill
                  priority={index < 2}
                  quality={78}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-3xl leading-tight">{space.name}</h2>
                <span className="shrink-0 text-sm tabular-nums text-muted">{space.objects.length} pieces</span>
              </div>
              <p className="mt-1 max-w-md text-muted">{space.summary}</p>
              <span className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium underline-offset-4 group-hover:underline">
                Explore <span aria-hidden>→</span>
              </span>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
