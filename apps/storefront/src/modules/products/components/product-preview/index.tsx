import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import ProductCard from "../product-card"

export default async function ProductPreview({
  product,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const variantAmounts = new Set(
    product.variants?.map((v) => v.calculated_price?.calculated_amount)
  )
  const hoverImage = product.images?.find(
    (image) => image.url && image.url !== product.thumbnail
  )?.url

  return (
    <ProductCard
      handle={product.handle!}
      title={product.title}
      thumbnail={product.thumbnail || product.images?.[0]?.url}
      hoverImage={hoverImage}
      price={cheapestPrice?.calculated_price}
      originalPrice={cheapestPrice?.original_price}
      isOnSale={cheapestPrice?.price_type === "sale"}
      isPriceRange={variantAmounts.size > 1}
    />
  )
}
