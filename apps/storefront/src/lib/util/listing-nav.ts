import { HttpTypes } from "@medusajs/types"

import { CATEGORY_ATTRIBUTE } from "@modules/store/components/store-refinements/attributes"
import type { ListingLink } from "@modules/store/templates"

const byRank = (a: HttpTypes.StoreProductCategory, b: HttpTypes.StoreProductCategory) =>
  (a.rank ?? 0) - (b.rank ?? 0)

/**
 * The navigation around a listing page: top-level category chips, the
 * current top-level category's sub-category chips, and breadcrumbs.
 * `current` is the category being shown, or nothing on "Shop all".
 */
export function getListingNav(
  categories: HttpTypes.StoreProductCategory[],
  current?: HttpTypes.StoreProductCategory
) {
  const topLevel = categories.filter((c) => !c.parent_category).sort(byRank)
  const root = current?.parent_category
    ? categories.find((c) => c.id === current.parent_category!.id)
    : current

  const chips: ListingLink[] = [
    { label: "Shop all", href: "/store", isActive: !current },
    ...topLevel.map((c) => ({
      label: c.name,
      href: `/categories/${c.handle}`,
      isActive: c.id === root?.id,
    })),
  ]

  const children = [...(root?.category_children ?? [])].sort(byRank)
  const subChips: ListingLink[] = children.length
    ? [
        { label: `All ${root!.name.toLowerCase()}`, href: `/categories/${root!.handle}`, isActive: current?.id === root?.id },
        ...children.map((c) => ({
          label: c.name,
          href: `/categories/${c.handle}`,
          isActive: c.id === current?.id,
        })),
      ]
    : []

  const breadcrumbs: ListingLink[] = [{ label: "Shop", href: "/store" }]
  if (current?.parent_category) {
    breadcrumbs.push({
      label: current.parent_category.name,
      href: `/categories/${current.parent_category.handle}`,
    })
  }

  return { chips, subChips, breadcrumbs }
}

/**
 * The fixed filter for a category page: the category and its sub-categories,
 * OR-ed, since the index stores each product's category names.
 */
export function categoryFacetFilters(
  category: HttpTypes.StoreProductCategory
): string[][] {
  const names = [
    category.name,
    ...(category.category_children ?? []).map((c) => c.name),
  ]

  return [names.map((name) => `${CATEGORY_ATTRIBUTE}:${name}`)]
}
