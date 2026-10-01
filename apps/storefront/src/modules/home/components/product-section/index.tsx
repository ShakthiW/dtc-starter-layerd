import { HttpTypes } from "@medusajs/types"
import { ArrowRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

type ProductSectionProps = {
  eyebrow: string
  title: string
  href: string
  linkLabel: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  id?: string
}

const ProductSection = ({
  eyebrow,
  title,
  href,
  linkLabel,
  products,
  region,
  id,
}: ProductSectionProps) => {
  if (!products.length) {
    return null
  }

  return (
    <section id={id} className="content-container scroll-mt-28 py-16 small:py-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight small:text-5xl">
            {title}
          </h2>
        </div>
        <LocalizedClientLink
          href={href}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-sm font-medium text-ink hover:underline underline-offset-4"
        >
          {linkLabel}
          <ArrowRight aria-hidden="true" />
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-4 small:gap-x-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ProductSection
