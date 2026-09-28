import { clx } from "@modules/common/components/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="h-8 w-32 animate-pulse rounded bg-line/50" />
  }

  const isOnSale = selectedPrice.price_type === "sale"

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span
        className={clx(
          "font-display text-2xl font-semibold tabular-nums",
          isOnSale ? "text-accent-ink" : "text-ink"
        )}
      >
        {!variant && <span className="text-base font-normal text-muted">From </span>}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {isOnSale && (
        <>
          <span
            className="text-base tabular-nums text-muted line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            <span className="sr-only">Was </span>
            {selectedPrice.original_price}
          </span>
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-white">
            Save {selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
