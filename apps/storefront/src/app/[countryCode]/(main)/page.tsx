import { Metadata } from "next"

import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import CustomCta from "@modules/home/components/custom-cta"
import KnittedBand from "@modules/home/components/knitted-band"
import Process from "@modules/home/components/process"
import ProductSection from "@modules/home/components/product-section"
import ShopByCategory, {
  CategoryTile,
} from "@modules/home/components/shop-by-category"
import TrustStrip from "@modules/home/components/trust-strip"
import SpaceTour, { spaceProducts } from "@modules/spaces/components/space-tour"
import { livingRoom } from "@modules/spaces/registry/living-room"

export const metadata: Metadata = {
  title: "LAYERD | 3D printed objects for considered spaces",
  description:
    "Lamps, vases, desk organisers and gifts, designed and 3D printed layer by layer in Sri Lanka. Cash on delivery island-wide.",
}

const CATEGORY_ORDER = ["lighting", "desk-workspace", "vases-planters", "gifts"]

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const products = (queryParams: Record<string, unknown>) =>
    listProducts({ regionId: region.id, queryParams }).then(
      ({ response }) => response
    )

  const categories = await listCategories()
  const byHandle = new Map(categories.map((c) => [c.handle, c]))
  const knitted = byHandle.get("knitted-friends")

  const [room, knittedFriends, tiles] = await Promise.all([
    spaceProducts(livingRoom, region),
    knitted ? products({ category_id: [knitted.id], limit: 4 }) : null,
    Promise.all(
      CATEGORY_ORDER.map(async (handle): Promise<CategoryTile | null> => {
        const category = byHandle.get(handle)
        if (!category) {
          return null
        }
        // A parent category (Gifts) holds its products in its children
        const ids = [
          category.id,
          ...(category.category_children ?? []).map((c) => c.id),
        ]
        const { products: first, count } = await products({
          category_id: ids,
          limit: 1,
        })
        return {
          handle,
          name: category.name,
          count,
          image: first[0]?.thumbnail,
        }
      })
    ),
  ])

  return (
    <>
      <SpaceTour space={livingRoom} region={region} />
      <ProductSection
        id="shop-the-room"
        eyebrow="Shop the room"
        title="Everything you just walked past"
        href="/store"
        linkLabel="Browse everything"
        products={room}
        region={region}
      />
      <TrustStrip />
      <ShopByCategory
        tiles={tiles.filter((t): t is CategoryTile => Boolean(t))}
      />
      <Process />
      <KnittedBand
        products={knittedFriends?.products ?? []}
        total={knittedFriends?.count ?? 0}
        region={region}
      />
      <CustomCta />
    </>
  )
}
