"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    shipping_methods?: unknown[] | null
  }
  /**
   * Delivery price to show before a delivery method is chosen (the cart
   * page). Added to the total so shoppers see what they'll actually pay.
   */
  estimatedShipping?: number | null
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, estimatedShipping }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  const format = (amount: number) => convertToLocale({ amount, currency_code })
  const hasMethod = (totals.shipping_methods?.length ?? 0) > 0
  const isEstimate = typeof estimatedShipping === "number" && !hasMethod
  const shipping = isEstimate ? estimatedShipping : shipping_subtotal ?? 0
  const grandTotal = (total ?? 0) + (isEstimate ? estimatedShipping : 0)
  const shippingLabel =
    !isEstimate && !hasMethod
      ? "Calculated at the next step"
      : shipping === 0
      ? "Free"
      : format(shipping)

  return (
    <dl className="flex flex-col gap-y-3 text-sm">
      <div className="flex items-center justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums text-ink" data-testid="cart-subtotal" data-value={item_subtotal || 0}>
          {format(item_subtotal ?? 0)}
        </dd>
      </div>
      {!!discount_subtotal && (
        <div className="flex items-center justify-between">
          <dt className="text-muted">Discount</dt>
          <dd
            className="tabular-nums text-accent-ink"
            data-testid="cart-discount"
            data-value={discount_subtotal || 0}
          >
            − {format(discount_subtotal)}
          </dd>
        </div>
      )}
      <div className="flex items-center justify-between">
        <dt className="text-muted">Delivery</dt>
        <dd className="tabular-nums text-ink" data-testid="cart-shipping" data-value={shipping || 0}>
          {shippingLabel}
        </dd>
      </div>
      {!!tax_total && (
        <div className="flex justify-between">
          <dt className="text-muted">Taxes</dt>
          <dd className="tabular-nums text-ink" data-testid="cart-taxes" data-value={tax_total}>
            {format(tax_total)}
          </dd>
        </div>
      )}
      <div className="mt-1 flex items-center justify-between border-t border-line pt-4">
        <dt className="font-medium text-ink">Total</dt>
        <dd
          className="font-display text-xl font-semibold tabular-nums text-ink"
          data-testid="cart-total"
          data-value={grandTotal}
        >
          {format(grandTotal)}
        </dd>
      </div>
    </dl>
  )
}

export default CartTotals
