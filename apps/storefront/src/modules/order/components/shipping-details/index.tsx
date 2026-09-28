import { formatAddressLines } from "@lib/util/format-address"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const address = order.shipping_address
  const method = order.shipping_methods?.[0] as
    | { name?: string; total?: number }
    | undefined
  const shippingTotal = method?.total ?? 0

  return (
    <section aria-labelledby="delivery-heading">
      <h2
        id="delivery-heading"
        className="mb-4 font-display text-lg font-semibold"
      >
        Delivery
      </h2>
      <div className="grid gap-6 text-sm small:grid-cols-3">
        <div data-testid="shipping-address-summary">
          <p className="mb-1 font-medium text-ink">Address</p>
          {formatAddressLines(address).map((line) => (
            <p key={line} className="text-muted">
              {line}
            </p>
          ))}
        </div>
        <div data-testid="shipping-contact-summary">
          <p className="mb-1 font-medium text-ink">Contact</p>
          <p className="text-muted">{address?.phone}</p>
          <p className="truncate text-muted">{order.email}</p>
        </div>
        <div data-testid="shipping-method-summary">
          <p className="mb-1 font-medium text-ink">Method</p>
          <p className="text-muted">
            {method?.name}
            {" · "}
            {shippingTotal === 0
              ? "Free"
              : convertToLocale({
                  amount: shippingTotal,
                  currency_code: order.currency_code,
                })}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ShippingDetails
