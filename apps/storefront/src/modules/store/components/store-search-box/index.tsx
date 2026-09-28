"use client"

import { MagnifyingGlass, XMarkMini } from "@medusajs/icons"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchBox } from "react-instantsearch"

const DEBOUNCE_MS = 250

/**
 * Free-text search over the listing, refining the same InstantSearch state the
 * filters do. The input is held locally so typing stays responsive while the
 * query itself is debounced.
 */
const StoreSearchBox = ({ placeholder = "Search products" }: { placeholder?: string }) => {
  const timer = useRef<number | undefined>(undefined)

  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => search(nextQuery), DEBOUNCE_MS)
    },
    []
  )

  const { query, refine } = useSearchBox({ queryHook })
  const [inputValue, setInputValue] = useState(query)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Follow the query when it changes elsewhere — cleared with the filters, or
  // arriving from the URL on load, which `routing` restores after mount.
  useEffect(() => {
    setInputValue(query)
  }, [query])

  const clear = () => {
    window.clearTimeout(timer.current)
    setInputValue("")
    refine("")
  }

  return (
    <div className="flex h-11 w-full items-center gap-x-2 rounded-full border border-line-strong bg-surface px-4 focus-within:border-ink">
      <MagnifyingGlass aria-hidden="true" className="shrink-0 text-muted" />
      <input
        type="search"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value)
          refine(event.target.value)
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted small:text-sm [&::-webkit-search-cancel-button]:hidden"
        data-testid="store-search-input"
      />
      {inputValue && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink"
          data-testid="store-search-clear"
        >
          <XMarkMini />
        </button>
      )}
    </div>
  )
}

export default StoreSearchBox
