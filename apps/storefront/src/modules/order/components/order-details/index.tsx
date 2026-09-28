import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const formatStatus = (str: string) => {
  const formatted = str.split("_").join(" ")
  return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <dl className="grid grid-cols-2 gap-4 text-sm small:grid-cols-4">
      <div>
        <dt className="text-muted">Order number</dt>
        <dd
          className="font-medium tabular-nums text-ink"
          data-testid="order-id"
        >
          #{order.display_id}
        </dd>
      </div>
      <div>
        <dt className="text-muted">Date</dt>
        <dd className="text-ink" data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("en-LK", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </dd>
      </div>
      <div className="col-span-2">
        <dt className="text-muted">Email</dt>
        <dd className="truncate text-ink" data-testid="order-email">
          {order.email}
        </dd>
      </div>
      {showStatus && (
        <>
          <div>
            <dt className="text-muted">Order status</dt>
            <dd className="text-ink" data-testid="order-status">
              {formatStatus(order.fulfillment_status)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Payment status</dt>
            <dd className="text-ink" data-testid="order-payment-status">
              {formatStatus(order.payment_status)}
            </dd>
          </div>
        </>
      )}
    </dl>
  )
}

export default OrderDetails
