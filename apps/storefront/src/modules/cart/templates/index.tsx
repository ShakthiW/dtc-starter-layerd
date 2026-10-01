import { HttpTypes } from "@medusajs/types"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import EmptyCartMessage from "../components/empty-cart-message"
import ItemsTemplate from "./items"
import Summary from "./summary"

const CartTemplate = ({
  cart,
  customer,
  shippingOptions,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  shippingOptions: HttpTypes.StoreCartShippingOption[]
}) => {
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  // The cheapest option the cart qualifies for, already priced by the
  // backend (Rs 450, or free over Rs 10,000)
  const estimatedShipping = shippingOptions.length
    ? Math.min(
        ...shippingOptions.map(
          (option) => option.calculated_price?.calculated_amount ?? option.amount ?? 0
        )
      )
    : null

  return (
    <div className="content-container py-8 small:py-12" data-testid="cart-container">
      {cart?.items?.length ? (
        <>
          <h1 className="mb-8 font-serif leading-[1.05] text-4xl">
            Your cart{" "}
            <span className="text-2xl font-normal tabular-nums text-muted">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          </h1>
          <div className="grid grid-cols-1 gap-10 small:grid-cols-[1fr_380px] small:gap-14">
            <div className="flex flex-col gap-6">
              <FreeShippingPriceNudge cart={cart} shippingOptions={shippingOptions} />
              <ItemsTemplate cart={cart} />
            </div>
            <div className="small:sticky small:top-32 small:self-start">
              <Summary
                cart={cart}
                estimatedShipping={estimatedShipping}
                isSignedIn={!!customer}
              />
            </div>
          </div>
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}

export default CartTemplate
