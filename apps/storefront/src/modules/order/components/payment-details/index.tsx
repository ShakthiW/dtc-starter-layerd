import { isManual, isStripeLike, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  if (!payment) {
    return null
  }

  const amount = convertToLocale({
    amount: payment.amount,
    currency_code: order.currency_code,
  })

  // Cash on delivery is "authorized" at checkout but nothing has been paid,
  // so never say "paid" for it.
  const details = isManual(payment.provider_id)
    ? `${amount} to pay in cash when your order arrives`
    : isStripeLike(payment.provider_id) && payment.data?.card_last4
    ? `Card ending ${payment.data.card_last4}`
    : `${amount} paid`

  return (
    <section aria-labelledby="payment-heading">
      <h2
        id="payment-heading"
        className="mb-4 font-display text-lg font-semibold"
      >
        Payment
      </h2>
      <div className="flex items-center gap-3 text-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-accent-ink">
          {paymentInfoMap[payment.provider_id]?.icon}
        </span>
        <div>
          <p className="font-medium text-ink" data-testid="payment-method">
            {paymentInfoMap[payment.provider_id]?.title ?? payment.provider_id}
          </p>
          <p className="text-muted" data-testid="payment-amount">
            {details}
          </p>
        </div>
      </div>
    </section>
  )
}

export default PaymentDetails
