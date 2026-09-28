import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = ({ product }: { product?: HttpTypes.StoreProduct | null }) => {
  const image = product?.thumbnail || product?.images?.[0]?.url

  return (
    <section className="content-container grid items-center gap-10 py-10 small:grid-cols-2 small:gap-16 small:py-16">
      <div className="flex flex-col items-start gap-6">
        <p className="eyebrow">Designed and 3D printed in Sri Lanka</p>
        <h1 className="font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-balance small:text-6xl">
          Shape your space.
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-muted">
          Lamps, vases and desk objects with a tactile, layered finish. Built
          layer by layer, made to order.
        </p>
        <div className="flex flex-wrap gap-3">
          <LocalizedClientLink href="/categories/lighting" className="btn-primary">
            Shop lighting
          </LocalizedClientLink>
          <LocalizedClientLink href="/store" className="btn-secondary">
            Browse everything
          </LocalizedClientLink>
        </div>
      </div>

      {image && product && (
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="group relative block aspect-[4/5] overflow-hidden rounded-large bg-surface small:aspect-auto small:h-[min(620px,70vh)]"
        >
          <Image
            src={image}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-4 py-2 text-sm text-ink">
            {product.title}
          </span>
        </LocalizedClientLink>
      )}
    </section>
  )
}

export default Hero
