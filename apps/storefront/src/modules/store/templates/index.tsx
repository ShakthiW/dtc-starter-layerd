"use client"

import { ChevronRightMini } from "@medusajs/icons"
import type { IndexUiState, SearchClient, UiState } from "instantsearch.js"
import { Configure, InstantSearch, useInstantSearch } from "react-instantsearch"

import { PRODUCT_INDEX_NAME, searchClient } from "@lib/search-client"
import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FilterSheet from "@modules/store/components/filter-sheet"
import SortSelect from "@modules/store/components/sort-select"
import StoreHits from "@modules/store/components/store-hits"
import StoreRefinements from "@modules/store/components/store-refinements"
import StoreSearchBox from "@modules/store/components/store-search-box"

const PRODUCT_LIMIT = 12

export type ListingLink = { label: string; href: string; isActive?: boolean }

type StoreTemplateProps = {
  currencyCode: string
  title: string
  description?: string | null
  breadcrumbs?: ListingLink[]
  /** Top-level category chips. */
  chips?: ListingLink[]
  /** Sub-category chips, shown under the main row (e.g. inside Gifts). */
  subChips?: ListingLink[]
  /**
   * Fixed filters for a category or collection page, in InstantSearch's
   * `facetFilters` form: values inside one array are OR-ed.
   */
  facetFilters?: string[][]
  showCollections?: boolean
}

/**
 * Keep URLs short and leave the page's fixed filters (`configure`) out of
 * them: a category page always applies its own, and a shared link should
 * carry only what the shopper chose.
 */
const routing = {
  stateMapping: {
    stateToRoute(uiState: UiState) {
      const { configure: _configure, ...route } =
        uiState[PRODUCT_INDEX_NAME] ?? {}
      return route
    },
    routeToState(route: IndexUiState) {
      return { [PRODUCT_INDEX_NAME]: route }
    },
  },
}

const ResultCount = () => {
  const { results } = useInstantSearch()
  const count = results?.nbHits

  if (typeof count !== "number") {
    return null
  }

  return (
    <p className="text-sm tabular-nums text-muted" aria-live="polite">
      {count} {count === 1 ? "piece" : "pieces"}
    </p>
  )
}

const ChipRow = ({ links, small }: { links: ListingLink[]; small?: boolean }) => (
  <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar small:mx-0 small:flex-wrap small:px-0">
    {links.map((link) => (
      <li key={link.href} className="shrink-0">
        <LocalizedClientLink
          href={link.href}
          aria-current={link.isActive ? "page" : undefined}
          className={clx(
            "flex items-center rounded-full border px-4 text-sm transition-colors duration-150",
            small ? "min-h-[36px]" : "min-h-[44px]",
            link.isActive
              ? "border-ink bg-ink text-white"
              : "border-line bg-surface text-ink hover:border-ink"
          )}
        >
          {link.label}
        </LocalizedClientLink>
      </li>
    ))}
  </ul>
)

const StoreTemplate = ({
  currencyCode,
  title,
  description,
  breadcrumbs,
  chips,
  subChips,
  facetFilters,
  showCollections = true,
}: StoreTemplateProps) => {
  return (
    <div className="content-container pb-8 pt-6 small:pt-10" data-testid="category-container">
      <header className="mb-8 flex flex-col gap-4">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              {breadcrumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  <LocalizedClientLink
                    href={crumb.href}
                    className="underline-offset-4 hover:text-ink hover:underline"
                  >
                    {crumb.label}
                  </LocalizedClientLink>
                  <ChevronRightMini aria-hidden="true" />
                </li>
              ))}
              <li aria-current="page" className="text-ink">
                {title}
              </li>
            </ol>
          </nav>
        )}
        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-4xl font-semibold tracking-tight small:text-5xl"
            data-testid="store-page-title"
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-xl leading-relaxed text-muted">{description}</p>
          )}
        </div>
        {chips && chips.length > 0 && <ChipRow links={chips} />}
        {subChips && subChips.length > 0 && <ChipRow links={subChips} small />}
      </header>

      <InstantSearch
        indexName={PRODUCT_INDEX_NAME}
        searchClient={searchClient as unknown as SearchClient}
        routing={routing}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Configure hitsPerPage={PRODUCT_LIMIT} facetFilters={facetFilters} />

        <div className="mb-6 flex flex-col gap-3 small:flex-row small:items-center small:justify-between">
          <div className="small:w-80">
            <StoreSearchBox placeholder={`Search ${title.toLowerCase()}`} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <ResultCount />
            <div className="flex items-center gap-2">
              <FilterSheet
                currencyCode={currencyCode}
                showCollections={showCollections}
              />
              <SortSelect currencyCode={currencyCode} />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-10">
          <aside
            aria-label="Filters"
            className="sticky top-32 hidden max-h-[calc(100vh-9rem)] w-60 shrink-0 overflow-y-auto pb-6 pr-1 small:block"
          >
            <StoreRefinements
              currencyCode={currencyCode}
              showCollections={showCollections}
            />
          </aside>
          <div className="min-w-0 flex-1">
            <StoreHits hitsPerPage={PRODUCT_LIMIT} currencyCode={currencyCode} />
          </div>
        </div>
      </InstantSearch>
    </div>
  )
}

export default StoreTemplate
