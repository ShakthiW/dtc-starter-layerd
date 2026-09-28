"use client"

import { ChevronUpDown } from "@medusajs/icons"
import { useSortBy } from "react-instantsearch"

import { getSortOptions } from "../store-refinements/attributes"

const SortSelect = ({ currencyCode }: { currencyCode: string }) => {
  const items = getSortOptions(currencyCode)
  const { currentRefinement, refine } = useSortBy({ items })

  return (
    <label className="relative flex h-11 shrink-0 items-center">
      <span className="sr-only">Sort by</span>
      <select
        value={currentRefinement}
        onChange={(event) => refine(event.target.value)}
        className="h-11 appearance-none rounded-full border border-line-strong bg-surface pl-4 pr-10 text-sm text-ink outline-none focus-visible:border-ink"
        data-testid="sort-by-container"
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <ChevronUpDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 text-muted"
      />
    </label>
  )
}

export default SortSelect
