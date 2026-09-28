import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  showOptions: boolean
  canAdd: boolean
  buttonLabel: string
  handleAddToCart: () => void
  show: boolean
}

/**
 * A bar pinned to the bottom of small screens once the main Add to cart
 * button scrolls out of view, so buying never needs a scroll back up.
 */
const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  showOptions,
  canAdd,
  buttonLabel,
  handleAddToCart,
  show,
}) => {
  const { variantPrice, cheapestPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })
  const price = variantPrice || cheapestPrice
  const optionSummary = variant?.options?.map((o) => o.value).join(" / ")

  return (
    <div
      className={clx(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur transition-transform duration-200 small:hidden",
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      )}
      aria-hidden={!show}
      data-testid="mobile-actions"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" data-testid="mobile-title">
            {product.title}
          </p>
          <p className="truncate text-sm text-muted">
            {price && (
              <span className="tabular-nums text-ink">{price.calculated_price}</span>
            )}
            {showOptions && optionSummary && <span> · {optionSummary}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          tabIndex={show ? 0 : -1}
          className="btn-primary shrink-0 disabled:opacity-50"
          data-testid="mobile-cart-button"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

export default MobileActions
