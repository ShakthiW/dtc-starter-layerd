import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

type KnittedBandProps = {
  products: HttpTypes.StoreProduct[]
  total: number
  region: HttpTypes.StoreRegion
}

const KnittedBand = ({ products, total, region }: KnittedBandProps) => {
  if (!products.length) {
    return null
  }

  return (
    <section className="content-container py-8 small:py-12">
      <div className="grid gap-10 rounded-large bg-sage px-5 py-10 small:grid-cols-[1fr_2fr] small:items-center small:gap-12 small:p-12">
        <div className="flex flex-col items-start gap-5">
          <p className="eyebrow">Gifts under Rs 1,500</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight small:text-4xl">
            Meet the Knitted Friends
          </h2>
          <p className="leading-relaxed text-muted">
            Knit-textured animals printed in one piece. Keep one on your desk
            or clip it to your keys.
          </p>
          <LocalizedClientLink href="/categories/knitted-friends" className="btn-primary">
            Meet all {total}
          </LocalizedClientLink>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default KnittedBand
