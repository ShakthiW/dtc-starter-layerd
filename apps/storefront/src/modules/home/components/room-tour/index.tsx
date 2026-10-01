import { readFile } from "node:fs/promises"
import path from "node:path"

import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import RoomStage, { RoomProduct } from "./room-stage"
import { OBJECTS } from "./scene"

const placeholder = (name: string) =>
  readFile(path.join(process.cwd(), "public/room", `${name}-placeholder.txt`), "utf8").catch(() => "")

/**
 * The home page's room tour. Fetches live prices for every object in the room
 * on the server, then hands plain data to the client stage that drives the
 * camera from scroll.
 */
export default async function RoomTour({ region }: { region: HttpTypes.StoreRegion }) {
  const [{ response }, day, dusk] = await Promise.all([
    listProducts({
      regionId: region.id,
      queryParams: { handle: OBJECTS.map((o) => o.handle), limit: OBJECTS.length },
    }),
    placeholder("day"),
    placeholder("dusk"),
  ])

  const products: Record<string, RoomProduct> = {}
  for (const product of response.products) {
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

  return <RoomStage products={products} placeholders={{ day, dusk }} />
}

/** The room's products as a grid, the hand-off from the tour into the shop. */
export async function roomProducts(region: HttpTypes.StoreRegion) {
  const { response } = await listProducts({
    regionId: region.id,
    queryParams: { handle: OBJECTS.map((o) => o.handle), limit: OBJECTS.length },
  })
  const order = new Map(OBJECTS.map((o, i) => [o.handle, i]))
  return response.products.sort((a, b) => (order.get(a.handle!) ?? 0) - (order.get(b.handle!) ?? 0))
}
