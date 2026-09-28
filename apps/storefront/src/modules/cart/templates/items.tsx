import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const sortNewestFirst = (items: HttpTypes.StoreCartLineItem[]) =>
  [...items].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  return (
    <ul className="divide-y divide-line border-y border-line" data-testid="items-table">
      {sortNewestFirst(cart.items ?? []).map((item) => (
        <Item key={item.id} item={item} currencyCode={cart.currency_code} />
      ))}
    </ul>
  )
}

export { sortNewestFirst }
export default ItemsTemplate
