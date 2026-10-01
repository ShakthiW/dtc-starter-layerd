"use client"

import { ArrowLeftMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { getOrderStatusLabel } from "@lib/util/order-status"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <LocalizedClientLink
        href="/account/orders"
        className="flex w-fit min-h-[40px] items-center gap-1 text-sm text-muted hover:text-ink"
        data-testid="back-to-overview-button"
      >
        <ArrowLeftMini aria-hidden="true" />
        All orders
      </LocalizedClientLink>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif leading-[1.05] text-4xl">
          Order #{order.display_id}
        </h1>
        <span className="rounded-full bg-sage px-3 py-1 text-sm font-medium text-ink">
          {getOrderStatusLabel(order)}
        </span>
      </header>

      <div
        className="flex flex-col gap-8"
        data-testid="order-details-container"
      >
        <div className="rounded-large bg-surface p-5 small:p-8">
          <OrderDetails order={order} />
        </div>
        <div className="flex flex-col gap-8 rounded-large bg-surface p-5 small:p-8">
          <section aria-labelledby="items-heading">
            <h2
              id="items-heading"
              className="mb-2 font-display text-lg font-semibold"
            >
              Items
            </h2>
            <Items order={order} />
            <div className="mt-4 border-t border-line pt-4">
              <CartTotals totals={order} />
            </div>
          </section>
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
