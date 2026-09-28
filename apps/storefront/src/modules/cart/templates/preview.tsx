"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import { sortNewestFirst } from "./items"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

/** The compact item list in the checkout summary. */
const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = sortNewestFirst(cart.items ?? [])

  return (
    <ul
      className={clx("divide-y divide-line", {
        "max-h-[360px] overflow-y-auto pr-1": items.length > 4,
      })}
      data-testid="items-table"
    >
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          type="preview"
          currencyCode={cart.currency_code}
        />
      ))}
    </ul>
  )
}

export default ItemsPreviewTemplate
