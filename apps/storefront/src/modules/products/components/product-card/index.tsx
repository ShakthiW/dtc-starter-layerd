import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"

export type ProductCardProps = {
  handle: string
  title: string
  thumbnail?: string | null
  /** Second photo, faded in on hover. */
  hoverImage?: string | null
  price?: string | null
  /** Pre-sale price, shown struck through when the product is on sale. */
  originalPrice?: string | null
  isOnSale?: boolean
  /** Prefix "From" when variants cost different amounts. */
  isPriceRange?: boolean
}

/**
 * The one product card every grid uses: home page sections, category pages
 * and search results. Stays presentational so server components and
 * InstantSearch hits can both render it.
 */
const ProductCard = ({
  handle,
  title,
  thumbnail,
  hoverImage,
  price,
  originalPrice,
  isOnSale,
  isPriceRange,
}: ProductCardProps) => {
  return (
    <LocalizedClientLink href={`/products/${handle}`} className="group block">
      <div data-testid="product-wrapper">
        <div className="relative">
          <Thumbnail
            thumbnail={thumbnail}
            images={hoverImage ? [{ url: hoverImage }] : null}
            size="full"
            showHoverImage={Boolean(hoverImage)}
            alt={title}
          />
          {isOnSale && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white">
              Sale
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-y-1">
          <h3
            className="text-sm font-medium leading-snug text-ink underline-offset-4 group-hover:underline"
            data-testid="product-title"
          >
            {title}
          </h3>
          {price && (
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span
                className={clx(
                  "tabular-nums",
                  isOnSale ? "font-medium text-accent-ink" : "text-ink"
                )}
                data-testid="price"
              >
                {isPriceRange && (
                  <span className="font-normal text-muted">From </span>
                )}
                {price}
              </span>
              {isOnSale && originalPrice && (
                <span
                  className="tabular-nums text-muted line-through"
                  data-testid="original-price"
                >
                  <span className="sr-only">Was </span>
                  {originalPrice}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default ProductCard
