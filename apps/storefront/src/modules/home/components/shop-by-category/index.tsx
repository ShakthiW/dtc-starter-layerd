import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export type CategoryTile = {
  handle: string
  name: string
  count: number
  image?: string | null
}

const ShopByCategory = ({ tiles }: { tiles: CategoryTile[] }) => {
  if (!tiles.length) {
    return null
  }

  return (
    <section className="content-container py-16 small:py-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Shop by use</p>
          <h2 className="mt-2 font-serif leading-[1.05] text-4xl">
            Find your piece
          </h2>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-4 small:grid-cols-4 small:gap-6">
        {tiles.map((tile) => (
          <li key={tile.handle}>
            <LocalizedClientLink
              href={`/categories/${tile.handle}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-rounded bg-surface">
                {tile.image && (
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="mt-3 flex flex-col gap-0.5 small:flex-row small:items-baseline small:justify-between small:gap-2">
                <h3 className="font-display text-lg font-medium group-hover:underline underline-offset-4">
                  {tile.name}
                </h3>
                <span className="text-sm tabular-nums text-muted">
                  {tile.count} {tile.count === 1 ? "piece" : "pieces"}
                </span>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ShopByCategory
