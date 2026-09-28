"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { Adjustments, XMark } from "@medusajs/icons"
import { useState } from "react"
import {
  useClearRefinements,
  useCurrentRefinements,
  useInstantSearch,
} from "react-instantsearch"

import StoreRefinements from "../store-refinements"

type FilterSheetProps = {
  currencyCode: string
  showCollections?: boolean
}

/**
 * Mobile filters: a full-screen sheet over the grid, with the result count on
 * the button that closes it, so shoppers see what their filters leave.
 */
const FilterSheet = ({ currencyCode, showCollections }: FilterSheetProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { results } = useInstantSearch()
  const { items } = useCurrentRefinements()
  const { canRefine: canClear, refine: clearAll } = useClearRefinements()

  const activeCount = items.flatMap((item) => item.refinements).length
  const resultCount = results?.nbHits ?? 0

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm text-ink small:hidden"
        data-testid="open-filters"
      >
        <Adjustments aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1 text-xs tabular-nums text-white">
            {activeCount}
          </span>
        )}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-[60] small:hidden"
      >
        <DialogPanel className="fixed inset-0 flex flex-col bg-paper">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <DialogTitle className="font-display text-lg font-medium">
              Filters
            </DialogTitle>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close filters"
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
            >
              <XMark />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <StoreRefinements
              currencyCode={currencyCode}
              showCollections={showCollections}
            />
          </div>

          <div className="flex gap-3 border-t border-line bg-paper px-4 py-3">
            <button
              type="button"
              onClick={clearAll}
              disabled={!canClear}
              className="btn-secondary flex-1 disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary flex-[2]"
              data-testid="show-results"
            >
              Show {resultCount} {resultCount === 1 ? "result" : "results"}
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  )
}

export default FilterSheet
