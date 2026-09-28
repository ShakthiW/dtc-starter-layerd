"use client"

import { ArrowRight, MagnifyingGlass, XMark } from "@medusajs/icons"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SearchClient } from "instantsearch.js"
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import useToggleState from "@lib/hooks/use-toggle-state"
import {
  PRODUCT_INDEX_NAME,
  SEARCH_PRICE_CURRENCIES,
  searchClient,
} from "@lib/search-client"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { NAV_ITEMS } from "@modules/layout/nav-items"
import SearchDrawer from "./drawer"
import SearchHit, { ProductHit } from "./hit"

const HITS_PER_PAGE = 8
const DEBOUNCE_MS = 250
const RECENT_KEY = "layerd:recent-searches"
const MAX_RECENT = 5
const POPULAR = ["Lamp", "Vase", "Desk organiser", "Knitted", "Planter"]
// The index holds LKR prices only; the store sells in LKR only.
const CURRENCY = SEARCH_PRICE_CURRENCIES[0]

// Recent searches are a per-browser convenience, so storage failures
// (private windows, blocked storage) just mean an empty list.
const readRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
  } catch {
    return []
  }
}

const saveRecent = (query: string) => {
  const trimmed = query.trim()
  if (!trimmed) {
    return
  }
  try {
    const next = [
      trimmed,
      ...readRecent().filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Ignore: recent searches are optional
  }
}

const chipClass =
  "flex min-h-[40px] items-center rounded-full border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-ink"

const SearchPanel = ({ onNavigate }: { onNavigate: () => void }) => {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const timer = useRef<number | undefined>(undefined)

  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => search(nextQuery), DEBOUNCE_MS)
    },
    []
  )

  const { query, refine } = useSearchBox({ queryHook })
  const { items } = useHits<ProductHit>()
  const { status, error, results } = useInstantSearch()
  const { isSettled } = useSearchSettled()

  const [inputValue, setInputValue] = useState(query)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    setRecent(readRecent())
    return () => window.clearTimeout(timer.current)
  }, [])

  const hasInput = Boolean(inputValue.trim())
  const isPending = inputValue.trim() !== query.trim()
  const hasResults = Boolean(query.trim()) && items.length > 0
  const total = results?.nbHits ?? items.length
  const seeAllHref = `/store?query=${encodeURIComponent(inputValue.trim())}`

  const setQuery = (value: string) => {
    setInputValue(value)
    refine(value)
  }

  const navigate = () => {
    saveRecent(inputValue)
    onNavigate()
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!hasInput) {
      return
    }
    navigate()
    router.push(`/${countryCode}${seeAllHref}`)
  }

  const clearRecent = () => {
    try {
      localStorage.removeItem(RECENT_KEY)
    } catch {
      // Ignore
    }
    setRecent([])
  }

  return (
    <>
      <form
        role="search"
        onSubmit={submit}
        className="flex items-center gap-x-3 border-b border-line px-4 py-2 small:px-6"
      >
        <MagnifyingGlass aria-hidden="true" className="shrink-0 text-muted" />
        <input
          type="search"
          value={inputValue}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lamps, vases, gifts..."
          aria-label="Search products"
          autoFocus
          className="h-12 w-full bg-transparent text-lg text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          data-testid="search-input"
        />
        {hasInput && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close search"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-ink/5"
          data-testid="close-search-drawer"
        >
          <XMark />
        </button>
      </form>

      <div
        className="flex-1 overflow-y-auto px-4 py-5 small:px-6"
        aria-live="polite"
      >
        {!hasInput ? (
          <div className="flex flex-col gap-6" data-testid="search-empty">
            {recent.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="eyebrow">Recent searches</h2>
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => setQuery(term)}
                        className={chipClass}
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="eyebrow mb-3">Popular searches</h2>
              <ul className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => setQuery(term)}
                      className={chipClass}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="eyebrow mb-3">Shop by category</h2>
              <ul className="grid grid-cols-2 gap-2 small:grid-cols-3">
                {NAV_ITEMS.filter((item) =>
                  item.href.startsWith("/categories")
                ).map((item) => (
                  <li key={item.href}>
                    <LocalizedClientLink
                      href={item.href}
                      onClick={onNavigate}
                      className="flex min-h-[48px] items-center justify-between rounded-rounded bg-surface px-4 text-sm text-ink transition-colors hover:ring-1 hover:ring-ink"
                    >
                      {item.label}
                      <ArrowRight aria-hidden="true" className="text-muted" />
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : status === "error" ? (
          <p
            role="alert"
            className="py-8 text-center text-sm text-muted"
            data-testid="search-error"
          >
            Search isn&apos;t working right now
            {error?.message ? ` (${error.message})` : ""}. Please try again.
          </p>
        ) : !isSettled || (isPending && !hasResults) ? (
          <p
            className="py-8 text-center text-sm text-muted"
            data-testid="search-loading"
          >
            Searching&hellip;
          </p>
        ) : hasResults ? (
          <div className="flex flex-col gap-3">
            <ul
              className="grid gap-1 small:grid-cols-2"
              data-testid="search-results"
            >
              {items.map((hit) => (
                <SearchHit
                  key={hit.objectID}
                  hit={hit}
                  currencyCode={CURRENCY}
                  onNavigate={navigate}
                />
              ))}
            </ul>
            <LocalizedClientLink
              href={seeAllHref}
              onClick={navigate}
              className="btn-secondary mt-2 w-full small:w-fit"
              data-testid="search-see-all"
            >
              See all {total} {total === 1 ? "result" : "results"} for &ldquo;
              {inputValue.trim()}&rdquo;
            </LocalizedClientLink>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3 py-8 text-center"
            data-testid="search-no-results"
          >
            <p className="font-medium text-ink">
              No pieces match &ldquo;{query}&rdquo;
            </p>
            <p className="max-w-sm text-sm text-muted">
              Try a simpler word like &ldquo;lamp&rdquo; or &ldquo;vase&rdquo;,
              or send us your own 3D model to print.
            </p>
            <LocalizedClientLink
              href="/#custom"
              onClick={onNavigate}
              className="btn-secondary"
            >
              Print your model
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </>
  )
}

const Search = () => {
  const { state: isOpen, open, close } = useToggleState()

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search products"
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-ink/5"
        data-testid="nav-search-button"
      >
        <MagnifyingGlass />
      </button>

      <SearchDrawer isOpen={isOpen} close={close}>
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure hitsPerPage={HITS_PER_PAGE} />
          <SearchPanel onNavigate={close} />
        </InstantSearch>
      </SearchDrawer>
    </>
  )
}

export default Search
