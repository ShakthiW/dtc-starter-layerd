"use client"

import { ArrowLeftMini, ArrowRightMini } from "@medusajs/icons"
import { usePagination } from "react-instantsearch"

import { clx } from "@modules/common/components/ui"

const SearchPagination = () => {
  const { pages, currentRefinement, nbPages, isFirstPage, isLastPage, refine } =
    usePagination({ padding: 2 })

  if (nbPages <= 1) {
    return null
  }

  const goTo = (page: number) => {
    refine(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const stepButton =
    "flex h-11 items-center gap-1 rounded-full px-4 text-sm text-ink transition-colors hover:bg-ink/5 disabled:pointer-events-none disabled:opacity-40"

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex items-center justify-center gap-1"
      data-testid="product-pagination"
    >
      <button
        type="button"
        onClick={() => goTo(currentRefinement - 1)}
        disabled={isFirstPage}
        className={stepButton}
      >
        <ArrowLeftMini aria-hidden="true" />
        <span className="hidden xsmall:inline">Previous</span>
      </button>
      {pages.map((page) => {
        const isCurrent = page === currentRefinement

        return (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={`Page ${page + 1}`}
            className={clx(
              "flex h-11 w-11 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
              isCurrent ? "bg-ink text-white" : "text-muted hover:bg-ink/5 hover:text-ink"
            )}
          >
            {page + 1}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => goTo(currentRefinement + 1)}
        disabled={isLastPage}
        className={stepButton}
      >
        <span className="hidden xsmall:inline">Next</span>
        <ArrowRightMini aria-hidden="true" />
      </button>
    </nav>
  )
}

export default SearchPagination
