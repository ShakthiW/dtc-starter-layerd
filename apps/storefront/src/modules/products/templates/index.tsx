import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import InTheRoom from "@modules/products/components/in-the-room"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container grid gap-8 pb-8 pt-4 small:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] small:gap-14 small:pt-10"
        data-testid="product-container"
      >
        <ImageGallery images={images} title={product.title} />

        {/* Spans both rows on desktop so it can stay in view beside the
            gallery and the details below it. */}
        <div className="flex flex-col gap-8 small:sticky small:top-32 small:col-start-2 small:row-span-2 small:row-start-1 small:self-start">
          <ProductInfo product={product} />
          <Suspense
            fallback={
              <ProductActions disabled={true} product={product} region={region} />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
        </div>

        <div className="small:col-start-1">
          <ProductTabs product={product} />
        </div>
      </div>

      <Suspense fallback={null}>
        <InTheRoom product={product} region={region} />
      </Suspense>

      <div className="content-container py-16 small:py-24" data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
