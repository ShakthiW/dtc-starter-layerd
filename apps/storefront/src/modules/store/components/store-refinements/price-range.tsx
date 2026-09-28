"use client"

import * as Slider from "@radix-ui/react-slider"
import { useEffect, useState } from "react"
import { useRange } from "react-instantsearch"

import { indexedCurrency, priceAttribute } from "@lib/search-client"
import { convertToLocale } from "@lib/util/money"

/**
 * Price filter over the region currency's `min_price_*` field, which is
 * declared `facetable({ types: ["stats"] })` — the stats facet is what
 * supplies the slider's bounds. Refines on release rather than per pixel.
 */
const PriceRange = ({ currencyCode }: { currencyCode: string }) => {
  const { start, range, canRefine, refine } = useRange({
    attribute: priceAttribute("min_price", currencyCode),
  })
  const format = (amount: number) =>
    convertToLocale({
      amount,
      currency_code: indexedCurrency(currencyCode),
      maximumFractionDigits: 0,
    })

  const min = Math.floor(range.min ?? 0)
  const max = Math.ceil(range.max ?? 0)

  // `start` holds ±Infinity for an unset bound, so fall back to the extremes.
  const from = Number.isFinite(start[0]) ? (start[0] as number) : min
  const to = Number.isFinite(start[1]) ? (start[1] as number) : max

  const [value, setValue] = useState<number[]>([from, to])

  // Follow the refinement when it changes elsewhere — clearing all filters, or
  // a bound arriving from the URL on load.
  useEffect(() => {
    setValue([from, to])
  }, [from, to])

  // No stats yet, or every product costs the same: nothing to slide between.
  if (!canRefine || min >= max) {
    return null
  }

  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="float-left mb-4 w-full text-sm font-medium text-ink">
        Price
      </legend>

      <div className="clear-both flex flex-col gap-y-3 px-2">
        <Slider.Root
          className="relative flex h-11 w-full touch-none select-none items-center"
          value={value}
          min={min}
          max={max}
          step={50}
          minStepsBetweenThumbs={0}
          onValueChange={setValue}
          // Only refine when the thumb is released, so dragging doesn't fire a
          // search per pixel.
          onValueCommit={(committed) => refine([committed[0], committed[1]])}
          aria-label="Price range"
          data-testid="price-range"
        >
          <Slider.Track className="relative h-0.5 w-full grow rounded-full bg-line">
            <Slider.Range className="absolute h-full rounded-full bg-ink" />
          </Slider.Track>
          {value.map((_, index) => (
            <Slider.Thumb
              key={index}
              className="block h-5 w-5 rounded-full border-2 border-ink bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              aria-label={index === 0 ? "Minimum price" : "Maximum price"}
            />
          ))}
        </Slider.Root>

        <div className="flex items-center justify-between text-sm tabular-nums text-muted">
          <span>{format(value[0])}</span>
          <span>{format(value[1])}</span>
        </div>
      </div>
    </fieldset>
  )
}

export default PriceRange
