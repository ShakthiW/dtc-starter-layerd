import { isManual } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const firstName = order.shipping_address?.first_name
  const phone = order.shipping_address?.phone
  const isCashOnDelivery = isManual(
    order.payment_collections?.[0]?.payments?.[0]?.provider_id
  )
  const total = convertToLocale({
    amount: order.total,
    currency_code: order.currency_code,
  })

  const nextSteps = [
    "We print and finish your pieces in our studio.",
    phone
      ? `Our courier calls ${phone} before delivering.`
      : "Our courier calls before delivering.",
    isCashOnDelivery
      ? `You pay ${total} in cash when your parcel arrives.`
      : "Your parcel arrives at your door.",
  ]

  return (
    <div className="content-container max-w-3xl py-10 small:py-16">
      <div
        className="flex flex-col gap-8"
        data-testid="order-complete-container"
      >
        <header className="flex flex-col items-start gap-4">
          <CheckCircleSolid
            aria-hidden="true"
            className="h-8 w-8 text-accent-ink"
          />
          <h1 className="font-serif leading-[1.05] text-4xl">
            Thank you{firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-lg text-muted">
            Your order #{order.display_id} is confirmed.
          </p>
        </header>

        <div className="rounded-large bg-surface p-5 small:p-8">
          <OrderDetails order={order} />
        </div>

        <section
          aria-labelledby="next-heading"
          className="rounded-large bg-sage p-5 small:p-8"
        >
          <h2
            id="next-heading"
            className="mb-4 font-display text-lg font-semibold"
          >
            What happens next
          </h2>
          <ol className="flex flex-col gap-3 text-sm">
            {nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-display tabular-nums text-muted">
                  0{index + 1}
                </span>
                <span className="text-ink">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-8 rounded-large bg-surface p-5 small:p-8">
          <section aria-labelledby="summary-heading">
            <h2
              id="summary-heading"
              className="mb-2 font-display text-lg font-semibold"
            >
              Summary
            </h2>
            <Items order={order} />
            <div className="mt-4 border-t border-line pt-4">
              <CartTotals totals={order} />
            </div>
          </section>
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
        </div>

        <Help />

        <LocalizedClientLink href="/store" className="btn-secondary w-fit">
          Continue shopping
        </LocalizedClientLink>
      </div>
    </div>
  )
}
