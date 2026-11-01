import { MetadataRoute } from "next"

import { sdk } from "@lib/config"
import { getBaseURL } from "@lib/util/env"
import { SPACES } from "@modules/spaces/registry"
import { HttpTypes } from "@medusajs/types"

// Built per request (the backend isn't reachable while the image builds); the
// catalogue reads below are cached for an hour.
export const dynamic = "force-dynamic"

const COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "lk"
const next = { revalidate: 3600 }

const fetchList = async <T>(path: string, key: string, fields: string) => {
  try {
    const res = await sdk.client.fetch<Record<string, T[]>>(path, {
      query: { limit: 1000, fields },
      next,
    })
    return res[key] ?? []
  } catch {
    // A sitemap without the catalogue beats an error page
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `${getBaseURL()}/${COUNTRY}`

  const [products, categories, collections] = await Promise.all([
    fetchList<HttpTypes.StoreProduct>("/store/products", "products", "handle,updated_at"),
    fetchList<HttpTypes.StoreProductCategory>(
      "/store/product-categories",
      "product_categories",
      "handle,updated_at"
    ),
    fetchList<HttpTypes.StoreCollection>("/store/collections", "collections", "handle,updated_at"),
  ])

  const page = (path: string, updated?: string | Date | null) => ({
    url: `${base}${path}`,
    ...(updated ? { lastModified: new Date(updated) } : {}),
  })

  return [
    page(""),
    page("/store"),
    page("/spaces"),
    ...SPACES.map((space) => page(`/spaces/${space.slug}`)),
    ...categories.map((c) => page(`/categories/${c.handle}`, c.updated_at)),
    ...collections.map((c) => page(`/collections/${c.handle}`, c.updated_at)),
    ...products.map((p) => page(`/products/${p.handle}`, p.updated_at)),
  ]
}
