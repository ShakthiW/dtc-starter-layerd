"use client"

import Image from "next/image"
import type { Hit as HitType } from "instantsearch.js"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import {
  HitPricing,
  getHitPrice,
} from "@modules/store/components/store-hits/price"

export type ProductHit = HitType<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
  } & HitPricing
>

type SearchHitProps = {
  hit: ProductHit
  currencyCode: string
  onNavigate?: () => void
}

const SearchHit = ({ hit, currencyCode, onNavigate }: SearchHitProps) => {
  if (!hit.handle) {
    return null
  }

  const { price, originalPrice, isOnSale, isPriceRange } = getHitPrice(
    hit,
    currencyCode
  )

  return (
    <li>
      <LocalizedClientLink
        href={`/products/${hit.handle}`}
        onClick={onNavigate}
        className="flex items-center gap-x-4 rounded-rounded p-2 transition-colors hover:bg-surface focus-visible:bg-surface"
        data-testid="search-hit-link"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-rounded bg-surface">
          {hit.thumbnail ? (
            <Image
              src={hit.thumbnail}
              alt=""
              fill
              sizes="64px"
              className="object-cover object-center"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <PlaceholderImage size={20} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium text-ink">
            {hit.title}
          </p>
          {price && (
            <p className="mt-0.5 flex items-baseline gap-2 text-sm tabular-nums">
              <span className={isOnSale ? "text-accent-ink" : "text-muted"}>
                {isPriceRange && "From "}
                {price}
              </span>
              {isOnSale && originalPrice && (
                <span className="text-muted line-through">
                  <span className="sr-only">Was </span>
                  {originalPrice}
                </span>
              )}
            </p>
          )}
        </div>
      </LocalizedClientLink>
    </li>
  )
}

export default SearchHit
