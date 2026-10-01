import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCategories } from "@lib/data/categories"
import { getCollectionByHandle } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getListingNav } from "@lib/util/listing-nav"
import { COLLECTION_ATTRIBUTE } from "@modules/store/components/store-refinements/attributes"
import StoreTemplate from "@modules/store/templates"

// Rendered per request: prices are per region and the data layer reads
// cookies, which a prebuilt page can't do. Medusa responses stay cached by
// the fetch cache, so this stays fast.
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} collection | LAYERD`,
    description: `The ${collection.title} collection, designed and 3D printed in Sri Lanka by LAYERD.`,
  }
}

export default async function CollectionPage(props: Props) {
  const params = await props.params
  const [region, collection, categories] = await Promise.all([
    getRegion(params.countryCode),
    getCollectionByHandle(params.handle),
    listCategories(),
  ])

  if (!region || !collection) {
    notFound()
  }

  const { chips } = getListingNav(categories)

  return (
    <StoreTemplate
      key={collection.id}
      currencyCode={region.currency_code}
      title={collection.title}
      breadcrumbs={[{ label: "Shop", href: "/store" }]}
      chips={chips.map((chip) => ({ ...chip, isActive: false }))}
      facetFilters={[[`${COLLECTION_ATTRIBUTE}:${collection.title}`]]}
      showCollections={false}
    />
  )
}
