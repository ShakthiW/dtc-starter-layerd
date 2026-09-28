import { ShoppingBag } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderCard from "../order-card"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-large bg-surface px-6 py-14 text-center"
      data-testid="no-orders-container"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">
        <ShoppingBag aria-hidden="true" />
      </span>
      <h2 className="font-display text-xl font-semibold">No orders yet</h2>
      <p className="max-w-sm text-sm text-muted">
        When you place an order, it shows up here so you can follow it from our
        studio to your door.
      </p>
      <LocalizedClientLink
        href="/store"
        className="btn-primary"
        data-testid="continue-shopping-button"
      >
        Start shopping
      </LocalizedClientLink>
    </div>
  )
}

export default OrderOverview
