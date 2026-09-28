import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

/** A line's total, with the pre-sale total struck through when discounted. */
const LineItemPrice = ({ item, currencyCode }: LineItemPriceProps) => {
  const originalPrice = item.original_total ?? 0
  const currentPrice = item.total ?? 0
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col items-end text-sm tabular-nums">
      <span
        className={clx(hasReducedPrice ? "font-medium text-accent-ink" : "text-ink")}
        data-testid="product-price"
      >
        {convertToLocale({ amount: currentPrice, currency_code: currencyCode })}
      </span>
      {hasReducedPrice && (
        <span
          className="text-muted line-through"
          data-testid="product-original-price"
        >
          <span className="sr-only">Was </span>
          {convertToLocale({ amount: originalPrice, currency_code: currencyCode })}
        </span>
      )}
    </div>
  )
}

export default LineItemPrice
