"use client"

import { Cash, ShieldCheck } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  estimatedShipping?: number | null
  isSignedIn: boolean
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, estimatedShipping, isSignedIn }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-5 rounded-large bg-surface p-5 small:p-6">
      <h2 className="font-display text-xl font-semibold">Order summary</h2>
      <CartTotals totals={cart} estimatedShipping={estimatedShipping} />
      <DiscountCode cart={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        className="btn-primary h-12 w-full text-base"
        data-testid="checkout-button"
      >
        Checkout
      </LocalizedClientLink>
      <ul className="flex flex-col gap-2 text-sm text-muted">
        <li className="flex items-center gap-2">
          <Cash aria-hidden="true" className="text-accent-ink" />
          Pay with cash on delivery
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="text-accent-ink" />
          Defects replaced or refunded
        </li>
      </ul>
      {!isSignedIn && (
        <p className="border-t border-line pt-4 text-sm text-muted">
          Have an account?{" "}
          <LocalizedClientLink
            href="/account"
            className="font-medium text-ink underline underline-offset-4"
            data-testid="sign-in-button"
          >
            Sign in
          </LocalizedClientLink>{" "}
          to check out faster. Guest checkout works too.
        </p>
      )}
    </div>
  )
}

export default Summary
