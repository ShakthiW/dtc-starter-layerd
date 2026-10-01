import { readFile } from "node:fs/promises"
import path from "node:path"

import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { Space } from "../types"
import SpaceStage, { SpaceProduct } from "./space-stage"

/** The low-res placeholder generated next to a plate, if there is one. */
const placeholderFor = (src: string) =>
  readFile(path.join(process.cwd(), "public", src.replace(/\.jpg$/, "-placeholder.txt")), "utf8").catch(
    () => undefined
  )

/** Every product placed in a space, in the order they appear in it. */
export async function spaceProducts(space: Space, region: HttpTypes.StoreRegion) {
  const handles = space.objects.map((o) => o.handle)
  const { response } = await listProducts({
    regionId: region.id,
    queryParams: { handle: handles, limit: handles.length },
  })
  const order = new Map(handles.map((h, i) => [h, i]))
  return response.products.sort((a, b) => (order.get(a.handle!) ?? 0) - (order.get(b.handle!) ?? 0))
}

/**
 * A space's scroll tour. Live prices are fetched on the server; the client
 * stage only drives the camera and light from scroll.
 */
export default async function SpaceTour({
  space,
  region,
  back,
}: {
  space: Space
  region: HttpTypes.StoreRegion
  back?: { href: string; label: string }
}) {
  const [list, placeholder] = await Promise.all([
    spaceProducts(space, region),
    placeholderFor(space.plates[space.acts[0].scene].src),
  ])

  const products: Record<string, SpaceProduct> = {}
  for (const product of list) {
    const { cheapestPrice } = getProductPrice({ product })
    const variants = product.variants ?? []
    products[product.handle!] = {
      handle: product.handle!,
      title: product.title,
      price: cheapestPrice?.calculated_price
        ? `${variants.length > 1 ? "From " : ""}${cheapestPrice.calculated_price}`
        : null,
      variantId: variants.length === 1 ? variants[0].id : null,
    }
  }

  return <SpaceStage space={space} products={products} placeholder={placeholder} back={back} />
}
