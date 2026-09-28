"use client"

import { updateLineItem } from "@lib/data/cart"
import { Minus, Plus } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

// Printed to order, so there's no stock ceiling; this just keeps a single
// line to a sensible quantity.
const MAX_QUANTITY = 10

const stepButton =
  "flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:pointer-events-none disabled:opacity-30"

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFull = type === "full"

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({ lineId: item.id, quantity })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  return (
    <li
      className={clx("flex gap-4", isFull ? "py-6" : "py-3")}
      data-testid="product-row"
    >
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className={clx("shrink-0", isFull ? "w-24 small:w-28" : "w-16")}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
        />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              className="text-sm font-medium text-ink underline-offset-4 hover:underline"
              data-testid="product-title"
            >
              {item.product_title}
            </LocalizedClientLink>
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
            {!isFull && (
              <p className="text-sm text-muted">Qty {item.quantity}</p>
            )}
          </div>
          <LineItemPrice item={item} currencyCode={currencyCode} />
        </div>

        {isFull && (
          <div className="mt-auto flex items-center justify-between gap-4 pt-3">
            <div
              className="flex items-center rounded-full border border-line-strong/40 bg-surface"
              role="group"
              aria-label={`Quantity of ${item.product_title}`}
            >
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                aria-label="Decrease quantity"
                className={stepButton}
              >
                <Minus />
              </button>
              <span
                className={clx("w-8 text-center text-sm tabular-nums", {
                  "opacity-50": updating,
                })}
                aria-live="polite"
                data-testid="product-select-button"
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={updating || item.quantity >= MAX_QUANTITY}
                aria-label="Increase quantity"
                className={stepButton}
              >
                <Plus />
              </button>
            </div>
            <DeleteButton id={item.id} data-testid="product-delete-button">
              Remove
            </DeleteButton>
          </div>
        )}
        <ErrorMessage error={error} data-testid="product-error-message" />
      </div>
    </li>
  )
}

export default Item
