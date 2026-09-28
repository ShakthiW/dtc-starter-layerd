import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <aside
      aria-label="Order summary"
      className="small:sticky small:top-8 small:self-start"
    >
      <div className="flex flex-col gap-5 rounded-large bg-surface p-5 small:p-6">
        <h2 className="font-display text-xl font-semibold">
          Order summary{" "}
          <span className="text-base font-normal tabular-nums text-muted">
            ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
        </h2>
        <ItemsPreviewTemplate cart={cart} />
        <div className="border-t border-line pt-5">
          <CartTotals totals={cart} />
        </div>
        <DiscountCode cart={cart} />
      </div>
    </aside>
  )
}

export default CheckoutSummary
