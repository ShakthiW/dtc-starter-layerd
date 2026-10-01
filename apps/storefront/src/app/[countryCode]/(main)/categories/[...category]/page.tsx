import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { categoryFacetFilters, getListingNav } from "@lib/util/listing-nav"
import StoreTemplate from "@modules/store/templates"

// Rendered per request: prices are per region and the data layer reads
// cookies, which a prebuilt page can't do. Medusa responses stay cached by
// the fetch cache, so this stays fast.
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
}

const findCategory = async (handle: string[]) => {
  const categories = await listCategories()
  const current = categories.find((c) => c.handle === handle.join("/"))
  return { categories, current }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { current } = await findCategory(params.category)

  if (!current) {
    notFound()
  }

  return {
    title: `${current.name} | LAYERD`,
    description:
      current.description ||
      `${current.name}, designed and 3D printed in Sri Lanka by LAYERD.`,
    alternates: {
      canonical: `${params.category.join("/")}`,
    },
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params
  const [region, { categories, current }] = await Promise.all([
    getRegion(params.countryCode),
    findCategory(params.category),
  ])

  if (!region || !current) {
    notFound()
  }

  const { chips, subChips, breadcrumbs } = getListingNav(categories, current)

  return (
    <StoreTemplate
      // Remount per category so InstantSearch starts from this page's filters
      key={current.id}
      currencyCode={region.currency_code}
      title={current.name}
      description={current.description}
      breadcrumbs={breadcrumbs}
      chips={chips}
      subChips={subChips}
      facetFilters={categoryFacetFilters(current)}
    />
  )
}
