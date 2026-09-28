import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

const LIMIT = 4

/** Other pieces from the same category, falling back to the same collection. */
export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const categoryIds = (product.categories ?? []).map((c) => c.id)
  const queryParams: HttpTypes.StoreProductListParams = {
    region_id: region.id,
    limit: LIMIT + 1,
    ...(categoryIds.length
      ? { category_id: categoryIds }
      : product.collection_id
      ? { collection_id: [product.collection_id] }
      : {}),
  }

  const products = await listProducts({ queryParams, countryCode }).then(
    ({ response }) =>
      response.products.filter((p) => p.id !== product.id).slice(0, LIMIT)
  )

  if (!products.length) {
    return null
  }

  return (
    <section aria-labelledby="related-heading">
      <p className="eyebrow">Keep browsing</p>
      <h2
        id="related-heading"
        className="mt-2 mb-8 font-display text-3xl font-semibold tracking-tight"
      >
        You may also like
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-4 small:gap-x-6">
        {products.map((related) => (
          <li key={related.id}>
            <Product region={region} product={related} />
          </li>
        ))}
      </ul>
    </section>
  )
}
