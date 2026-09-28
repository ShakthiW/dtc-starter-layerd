import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes, StoreCart, StoreCartShippingOption } from "@medusajs/types"

type FreeDeliveryTarget = {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

/**
 * How far the cart is from the free-delivery threshold, read from the
 * shipping option's `item_total` price rule (free from Rs 10,000).
 */
const computeTarget = (
  cart: HttpTypes.StoreCart,
  price: HttpTypes.StorePrice
): FreeDeliveryTarget | null => {
  const priceRule = (price.price_rules || []).find(
    (pr) => pr.attribute === "item_total"
  )

  if (!priceRule) {
    return null
  }

  const current = cart.item_total
  const target = parseFloat(priceRule.value)
  const reached = priceRule.operator === "gt" ? current > target : current >= target

  return {
    target_reached: reached,
    target_remaining: reached ? 0 : target - current,
    remaining_percentage: Math.min((current / target) * 100, 100),
  }
}

/**
 * A progress bar towards free delivery, for the cart. Renders nothing when no
 * shipping option has a free-over-a-threshold price.
 */
export default function FreeShippingPriceNudge({
  cart,
  shippingOptions,
}: {
  cart: StoreCart
  shippingOptions: StoreCartShippingOption[]
}) {
  if (!cart || !shippingOptions?.length) {
    return null
  }

  const target = shippingOptions
    .flatMap((option) =>
      option.prices.filter(
        (price) =>
          price.currency_code === cart.currency_code &&
          price.amount === 0 &&
          (price.price_rules || []).some((rule) => rule.attribute === "item_total")
      )
    )
    .map((price) => computeTarget(cart, price))
    .find(Boolean)

  if (!target) {
    return null
  }

  return (
    <div className="rounded-rounded bg-surface p-4" data-testid="free-delivery-nudge">
      <p className="text-sm text-ink" aria-live="polite">
        {target.target_reached ? (
          <span className="flex items-center gap-2">
            <CheckCircleSolid aria-hidden="true" className="text-accent-ink" />
            You&apos;ve unlocked free delivery.
          </span>
        ) : (
          <>
            Add{" "}
            <span className="font-medium tabular-nums">
              {convertToLocale({
                amount: target.target_remaining,
                currency_code: cart.currency_code,
              })}
            </span>{" "}
            more for free delivery.
          </>
        )}
      </p>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(target.remaining_percentage)}
      >
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-500"
          style={{ width: `${target.remaining_percentage}%` }}
        />
      </div>
    </div>
  )
}
