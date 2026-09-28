import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { getListingNav } from "@lib/util/listing-nav"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Shop all | LAYERD",
  description:
    "Every LAYERD piece: lamps, vases, planters, desk organisers and gifts, 3D printed in Sri Lanka.",
}

export default async function StorePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const [region, categories] = await Promise.all([
    getRegion(countryCode),
    listCategories(),
  ])

  if (!region) {
    notFound()
  }

  const { chips } = getListingNav(categories)

  return (
    <StoreTemplate
      currencyCode={region.currency_code}
      title="Shop all"
      description="Everything we make, printed to order in our Sri Lankan studio."
      chips={chips}
    />
  )
}
