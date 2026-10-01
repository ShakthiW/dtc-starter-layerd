import Image from "next/image"

import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ACTS, OBJECTS, PLATE } from "@modules/home/components/room-tour/scene"
import ProductPreview from "@modules/products/components/product-preview"

const VIEW = 4 / 3 // crop window, width over height

/**
 * Carries the home page's room onto the product page: the product where it
 * lives in the scene, and the pieces that share its corner of the room, so
 * one product leads to the next.
 */
export default async function InTheRoom({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const object = OBJECTS.find((o) => o.handle === product.handle)
  const act = ACTS.find((a) => a.products.includes(product.handle!))
  if (!object || !act) return null

  const neighbours = act.products.filter((h) => h !== product.handle)
  const { response } = neighbours.length
    ? await listProducts({ regionId: region.id, queryParams: { handle: neighbours, limit: neighbours.length } })
    : { response: { products: [] as HttpTypes.StoreProduct[] } }

  // A crop around the product, a few times its own size, kept inside the plate
  const { box } = object
  const rw = Math.min(0.42, Math.max(box.w, (box.h * PLATE.height * VIEW) / PLATE.width) * 3.2)
  const rh = (rw * PLATE.width) / PLATE.height / VIEW
  const rx = Math.min(Math.max(box.x + box.w / 2 - rw / 2, 0), 1 - rw)
  const ry = Math.min(Math.max(box.y + box.h / 2 - rh / 2, 0), 1 - rh)
  const dot = { x: (box.x + box.w / 2 - rx) / rw, y: (box.y + box.h * 0.35 - ry) / rh }

  return (
    <section
      aria-labelledby="in-the-room-heading"
      className="content-container grid items-center gap-10 py-16 small:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] small:gap-14 small:py-24"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-large bg-surface">
        <div
          className="absolute"
          style={{ width: `${100 / rw}%`, height: `${100 / rh}%`, left: `${(-rx / rw) * 100}%`, top: `${(-ry / rh) * 100}%` }}
        >
          <Image
            src={act.night ? "/room/dusk.jpg" : "/room/day.jpg"}
            alt={`${product.title} in a furnished room`}
            fill
            quality={80}
            sizes="(max-width: 1024px) 260vw, 140vw"
            className="object-cover"
          />
        </div>
        <span
          aria-hidden
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_6px_rgb(0_0_0/0.35)] ring-4 ring-white/30"
          style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <p className="eyebrow">In the room</p>
        <h2 id="in-the-room-heading" className="font-serif text-4xl leading-[1.05] small:text-5xl">
          {act.title}
        </h2>
        <p className="max-w-md text-muted">{act.body}</p>
        {response.products.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3">
            {response.products.slice(0, 3).map((p) => (
              <li key={p.id}>
                <ProductPreview product={p} region={region} />
              </li>
            ))}
          </ul>
        )}
        <LocalizedClientLink href="/" className="mt-2 text-sm font-medium underline underline-offset-4">
          Walk through the whole room
        </LocalizedClientLink>
      </div>
    </section>
  )
}
