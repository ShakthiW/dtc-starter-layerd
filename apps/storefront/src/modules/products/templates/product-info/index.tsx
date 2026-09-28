import { ChevronRightMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

/** Breadcrumb, collection and title at the top of the product panel. */
const ProductInfo = ({ product }: ProductInfoProps) => {
  const category = product.categories?.[0]

  return (
    <div id="product-info" className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <li className="flex items-center gap-1">
            <LocalizedClientLink href="/store" className="hover:text-ink hover:underline underline-offset-4">
              Shop
            </LocalizedClientLink>
            <ChevronRightMini aria-hidden="true" />
          </li>
          {category && (
            <li className="flex items-center gap-1">
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="hover:text-ink hover:underline underline-offset-4"
              >
                {category.name}
              </LocalizedClientLink>
            </li>
          )}
        </ol>
      </nav>
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="eyebrow w-fit hover:text-ink"
        >
          {product.collection.title} collection
        </LocalizedClientLink>
      )}
      <h1
        className="font-display text-3xl font-semibold leading-tight tracking-tight text-balance small:text-4xl"
        data-testid="product-title"
      >
        {product.title}
      </h1>
    </div>
  )
}

export default ProductInfo
