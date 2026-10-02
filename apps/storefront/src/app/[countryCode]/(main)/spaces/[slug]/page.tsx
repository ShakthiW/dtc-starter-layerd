import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductSection from "@modules/home/components/product-section"
import SpaceTour, { spaceProducts } from "@modules/spaces/components/space-tour"
import { getSpace, neighbours } from "@modules/spaces/registry"
import { Space } from "@modules/spaces/types"

// Rendered per request: prices are per region and the data layer reads
// cookies, which a prebuilt page can't do. Medusa responses stay cached by
// the fetch cache, so this stays fast.
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const space = getSpace(slug)
  if (!space) notFound()
  return {
    title: `${space.name} | LAYERD Spaces`,
    description: space.summary,
    // A 1200x630 card per space; the full plates are too large for link previews
    openGraph: {
      siteName: "LAYERD",
      title: `${space.name} | LAYERD Spaces`,
      description: space.summary,
      images: [{ url: `/spaces/${space.slug}/og.jpg`, width: 1200, height: 630, alt: space.alt }],
    },
    twitter: { card: "summary_large_image", images: [`/spaces/${space.slug}/og.jpg`] },
  }
}

export default async function SpacePage(props: Props) {
  const { countryCode, slug } = await props.params
  const space = getSpace(slug)
  const region = await getRegion(countryCode)
  if (!space || !region) notFound()

  const products = await spaceProducts(space, region)
  const { previous, next } = neighbours(slug)

  return (
    <>
      <SpaceTour space={space} region={region} back={{ href: "/spaces", label: "All spaces" }} />

      <nav aria-label="Breadcrumb" className="content-container pt-12 text-sm text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <LocalizedClientLink href="/spaces" className="hover:text-ink hover:underline underline-offset-4">
              Spaces
            </LocalizedClientLink>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {space.name}
          </li>
        </ol>
      </nav>

      <ProductSection
        id="shop-the-room"
        eyebrow="Shop the room"
        title="Everything you just walked past"
        href="/store"
        linkLabel="Browse everything"
        products={products}
        region={region}
      />

      <nav aria-label="More spaces" className="content-container grid gap-6 pb-8 small:grid-cols-2">
        {previous && <NeighbourCard space={previous} label="Previous space" />}
        {next && <NeighbourCard space={next} label="Next space" align={previous ? "end" : "start"} />}
        <LocalizedClientLink
          href="/spaces"
          className="btn-secondary justify-self-start small:col-span-2"
        >
          All spaces
        </LocalizedClientLink>
      </nav>
    </>
  )
}

function NeighbourCard({ space, label, align = "start" }: { space: Space; label: string; align?: "start" | "end" }) {
  return (
    <LocalizedClientLink
      href={`/spaces/${space.slug}`}
      className={`group relative flex aspect-[16/7] items-end overflow-hidden rounded-large bg-surface p-6 ${
        align === "end" ? "small:col-start-2" : ""
      }`}
    >
      <Image
        src={space.plates[space.poster].src}
        alt=""
        fill
        quality={70}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
      <span className="relative flex flex-col text-white">
        <span className="text-xs uppercase tracking-[0.14em] text-white/80">{label}</span>
        <span className="font-serif text-3xl leading-tight">{space.name}</span>
      </span>
    </LocalizedClientLink>
  )
}
