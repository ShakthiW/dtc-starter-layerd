"use client"

import { useToggleRefinement } from "react-instantsearch"

import { priceAttribute } from "@lib/search-client"

/**
 * Narrows to products whose calculated price is below their original in the
 * region's currency. Hides itself when nothing is discounted.
 */
const OnSaleToggle = ({ currencyCode }: { currencyCode: string }) => {
  const { value, refine, canRefine } = useToggleRefinement({
    attribute: priceAttribute("on_sale", currencyCode),
    on: true,
  })

  if (!canRefine) {
    return null
  }

  return (
    <div className="border-t border-line pt-5">
      <label className="flex min-h-[40px] cursor-pointer items-center gap-x-3 text-sm">
        <input
          type="checkbox"
          checked={value.isRefined}
          onChange={() => refine(value)}
          className="h-4 w-4 shrink-0 accent-ink"
          data-testid="on-sale-toggle"
        />
        <span className="font-medium text-ink">On sale only</span>
        {typeof value.count === "number" && (
          <span className="ml-auto tabular-nums text-muted">{value.count}</span>
        )}
      </label>
    </div>
  )
}

export default OnSaleToggle
