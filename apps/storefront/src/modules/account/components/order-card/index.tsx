import { ChevronRightMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

import { convertToLocale } from "@lib/util/money"
import { getOrderStatusLabel } from "@lib/util/order-status"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const MAX_THUMBNAILS = 4

const OrderCard = ({ order }: OrderCardProps) => {
  const itemCount =
    order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  const items = order.items ?? []
  const hiddenCount = items.length - MAX_THUMBNAILS

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      className="group block rounded-large bg-surface p-5 transition-colors hover:ring-1 hover:ring-ink small:p-6"
      data-testid="order-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">
            Order #
            <span data-testid="order-display-id">{order.display_id}</span>
          </p>
          <p className="text-sm text-muted">
            <span data-testid="order-created-at">
              {new Date(order.created_at).toLocaleDateString("en-LK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {" · "}
            {itemCount} {itemCount === 1 ? "item" : "items"}
            {" · "}
            <span className="tabular-nums text-ink" data-testid="order-amount">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </span>
          </p>
        </div>
        <span className="rounded-full bg-sage px-3 py-1 text-xs font-medium text-ink">
          {getOrderStatusLabel(order)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <ul className="flex gap-2">
          {items.slice(0, MAX_THUMBNAILS).map((item) => (
            <li key={item.id} className="w-14" data-testid="order-item">
              <Thumbnail
                thumbnail={item.thumbnail}
                size="square"
                alt={item.title}
              />
            </li>
          ))}
          {hiddenCount > 0 && (
            <li className="flex w-14 items-center justify-center rounded-rounded bg-paper text-sm text-muted">
              +{hiddenCount}
            </li>
          )}
        </ul>
        <span
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink group-hover:underline underline-offset-4"
          data-testid="order-details-link"
        >
          View order
          <ChevronRightMini aria-hidden="true" />
        </span>
      </div>
    </LocalizedClientLink>
  )
}

export default OrderCard
