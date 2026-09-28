"use client"

import type { Hit } from "instantsearch.js"
import { Fragment, useEffect, useRef } from "react"
import { useClearRefinements, useHits, useInstantSearch } from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCard from "@modules/products/components/product-card"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchPagination from "./pagination"
import { HitPricing, getHitPrice } from "./price"

type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
    hover_image?: string | null
  } & HitPricing
>

type StoreHitsProps = {
  hitsPerPage: number
  currencyCode: string
}

/** Where the "How it's made" tile sits in the first, unfiltered page. */
const STORY_TILE_POSITION = 5

const StoryTile = () => (
  <li>
    <LocalizedClientLink
      href="/#process"
      className="group flex aspect-[4/5] flex-col justify-between rounded-rounded bg-sage p-5"
    >
      <p className="eyebrow">How it&apos;s made</p>
      <div>
        <p className="font-display text-2xl font-semibold leading-tight">
          Built layer by layer
        </p>
        <p className="mt-2 text-sm text-muted">
          Designed and printed to order in our Sri Lankan studio.
        </p>
        <span className="mt-4 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
          See the process
        </span>
      </div>
    </LocalizedClientLink>
  </li>
)

const StoreHits = ({ hitsPerPage, currencyCode }: StoreHitsProps) => {
  const { items } = useHits<ProductHit>()
  const { status, error, indexUiState } = useInstantSearch()
  const { isSearching, hasNoResultsYet } = useSearchSettled()
  const { canRefine: canClear, refine: clearAll } = useClearRefinements()

  const { page, ...refinements } = indexUiState
  const currentPage = page ?? 1
  const refinementKey = JSON.stringify(refinements)

  const settled = useRef({ page: currentPage, refinementKey })

  useEffect(() => {
    if (!isSearching) {
      settled.current = { page: currentPage, refinementKey }
    }
  }, [isSearching, currentPage, refinementKey])

  const isPagingOnly =
    refinementKey === settled.current.refinementKey &&
    currentPage !== settled.current.page

  const showSkeleton = hasNoResultsYet || (isSearching && isPagingOnly)
  const isUnfiltered =
    currentPage === 1 &&
    !indexUiState.query &&
    !indexUiState.refinementList &&
    !indexUiState.range &&
    !indexUiState.toggle
  const showStoryTile = isUnfiltered && items.length > STORY_TILE_POSITION

  if (status === "error") {
    return (
      <p
        className="py-16 text-center text-muted"
        role="alert"
        data-testid="products-error"
      >
        Couldn&apos;t load products
        {error?.message ? `: ${error.message}` : "."} Please refresh the page.
      </p>
    )
  }

  return (
    <>
      {showSkeleton ? (
        <SkeletonProductGrid numberOfProducts={hitsPerPage} />
      ) : !items.length ? (
        <div
          className="flex flex-col items-center gap-4 rounded-rounded bg-surface px-6 py-16 text-center"
          data-testid="no-products"
        >
          <p className="font-display text-xl font-medium">
            Nothing matches those filters
          </p>
          <p className="max-w-sm text-sm text-muted">
            Try removing a filter or searching for something broader, like
            &quot;lamp&quot; or &quot;vase&quot;.
          </p>
          {canClear && (
            <button type="button" onClick={clearAll} className="btn-secondary">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <ul
          className="grid w-full grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-3 small:gap-x-6"
          data-testid="products-list"
        >
          {items.map((hit, index) =>
            hit.handle ? (
              <Fragment key={hit.objectID}>
                {showStoryTile && index === STORY_TILE_POSITION && <StoryTile />}
                <li>
                  <ProductCard
                    handle={hit.handle}
                    title={hit.title ?? ""}
                    thumbnail={hit.thumbnail}
                    hoverImage={hit.hover_image}
                    {...getHitPrice(hit, currencyCode)}
                  />
                </li>
              </Fragment>
            ) : null
          )}
        </ul>
      )}
      <SearchPagination />
    </>
  )
}

export default StoreHits
