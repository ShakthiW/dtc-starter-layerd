import { HttpTypes } from "@medusajs/types"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <li className="flex gap-4 py-4" data-testid="product-row">
      <div className="w-16 shrink-0">
        <Thumbnail thumbnail={item.thumbnail} size="square" alt="" />
      </div>
      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-sm font-medium text-ink"
            data-testid="product-name"
          >
            {item.product_title}
          </p>
          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
          <p className="text-sm text-muted">
            Qty <span data-testid="product-quantity">{item.quantity}</span>
          </p>
        </div>
        <LineItemPrice item={item} currencyCode={currencyCode} />
      </div>
    </li>
  )
}

export default Item
