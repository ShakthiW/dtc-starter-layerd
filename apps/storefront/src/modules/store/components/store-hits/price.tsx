import { indexedCurrency, priceAttribute } from "@lib/search-client"
import { convertToLocale } from "@lib/util/money"

/** The per-currency price fields a hit may carry, e.g. `min_price_lkr`. */
export type HitPricing = Record<string, unknown>

const amount = (value: unknown) => (typeof value === "number" ? value : null)

/**
 * A hit's price fields as the product card displays them: the cheapest
 * variant's price, its pre-sale price, and whether other variants cost more.
 */
export function getHitPrice(hit: HitPricing, currencyCode: string) {
  const currency_code = indexedCurrency(currencyCode)
  const minPrice = amount(hit[priceAttribute("min_price", currencyCode)])
  const maxPrice = amount(hit[priceAttribute("max_price", currencyCode)])
  const originalPrice = amount(
    hit[priceAttribute("original_price", currencyCode)]
  )

  if (minPrice === null) {
    return {}
  }

  const format = (value: number) =>
    convertToLocale({ amount: value, currency_code })

  return {
    price: format(minPrice),
    originalPrice: originalPrice !== null ? format(originalPrice) : null,
    isOnSale: hit[priceAttribute("on_sale", currencyCode)] === true,
    isPriceRange: (maxPrice ?? minPrice) > minPrice,
  }
}
