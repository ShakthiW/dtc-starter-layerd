/**
 * Sets the store up for LAYERD: Sri Lanka only, prices in LKR, cash on
 * delivery, a flat Rs 450 delivery fee that drops to free over Rs 10,000, and
 * the 27-product catalogue from layerd.lk.
 *
 *   npx medusa exec ./src/scripts/seed-layerd.ts
 *
 * It also removes the starter's Europe demo data (region, tax regions,
 * warehouse, shipping options, demo products and categories). Re-running it is
 * safe: anything that already exists is kept and skipped.
 */
import {
  createCollectionsWorkflow,
  createPriceListsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
  deleteRegionsWorkflow,
  deleteShippingOptionsWorkflow,
  deleteStockLocationsWorkflow,
  deleteTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ContainerRegistrationKeys,
  Modules,
  PriceListStatus,
  ProductStatus,
} from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

import { catalogue } from "./data/layerd-catalogue"

const CURRENCY = "lkr"
const COUNTRY = "lk"
const DELIVERY_FEE = 450
const FREE_DELIVERY_FROM = 10000

const DEMO_PRODUCT_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"]
const DEMO_CATEGORY_NAMES = ["Shirts", "Sweatshirts", "Pants", "Merch"]
const DEMO_REGION_NAME = "Europe"
const DEMO_STOCK_LOCATION_NAME = "European Warehouse"

const CATEGORIES = [
  { handle: "lighting", name: "Lighting", description: "Table and desk lamps, printed layer by layer." },
  { handle: "desk-workspace", name: "Desk & Workspace", description: "Organisers, drawers and small tools for a calmer desk." },
  { handle: "vases-planters", name: "Vases & Planters", description: "Vessels for dried stems, fresh flowers and plants." },
  { handle: "gifts", name: "Gifts", description: "Small, playful pieces that are easy to give." },
]
const GIFT_CHILDREN = [
  { handle: "knitted-friends", name: "Knitted Friends", description: "Knit-textured animals, as figurines or key tags." },
  { handle: "gift-cards", name: "Gift cards", description: "Let them choose their own piece." },
]
const COLLECTIONS = [
  { handle: "home-decor", title: "Home Decor" },
  { handle: "workplace", title: "Workplace" },
  { handle: "knitted", title: "Knitted" },
  { handle: "nobody", title: "Nobody" },
]

export default async function seedLayerd({ container }: ExecArgs) {
  await setupLayerdStore(container)
}

/**
 * Shared by this script and the `initial-data-seed` migration script, which
 * runs it on a fresh database. There the search module seeds the index itself
 * on first boot, so replaying ingestion is skipped.
 */
export async function setupLayerdStore(
  container: ExecArgs["container"],
  { reindexSearch = true }: { reindexSearch?: boolean } = {}
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  // ---- Remove the starter's Europe demo data -------------------------------

  const { data: demoProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: DEMO_PRODUCT_HANDLES },
  })
  if (demoProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: demoProducts.map((p) => p.id) },
    })
    logger.info(`Removed ${demoProducts.length} demo product(s).`)
  }

  const { data: demoCategories } = await query.graph({
    entity: "product_category",
    fields: ["id"],
    filters: { name: DEMO_CATEGORY_NAMES },
  })
  if (demoCategories.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: demoCategories.map((c) => c.id),
    })
    logger.info(`Removed ${demoCategories.length} demo categor(ies).`)
  }

  const { data: demoLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.service_zones.shipping_options.id"],
    filters: { name: DEMO_STOCK_LOCATION_NAME },
  })
  const demoShippingOptionIds = demoLocations.flatMap((location) =>
    (location.fulfillment_sets ?? []).flatMap((set) =>
      (set?.service_zones ?? []).flatMap((zone) =>
        (zone?.shipping_options ?? []).map((option) => option!.id)
      )
    )
  )
  if (demoShippingOptionIds.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: demoShippingOptionIds },
    })
  }
  if (demoLocations.length) {
    await deleteStockLocationsWorkflow(container).run({
      input: { ids: demoLocations.map((l) => l.id) },
    })
    logger.info("Removed the demo warehouse and its shipping options.")
  }

  const { data: demoRegions } = await query.graph({
    entity: "region",
    fields: ["id", "countries.iso_2"],
    filters: { name: DEMO_REGION_NAME },
  })
  if (demoRegions.length) {
    const demoCountries = demoRegions.flatMap((r) =>
      (r.countries ?? []).map((c) => c!.iso_2)
    )
    await deleteRegionsWorkflow(container).run({
      input: { ids: demoRegions.map((r) => r.id) },
    })
    const { data: demoTaxRegions } = await query.graph({
      entity: "tax_region",
      fields: ["id"],
      filters: { country_code: demoCountries },
    })
    if (demoTaxRegions.length) {
      await deleteTaxRegionsWorkflow(container).run({
        input: { ids: demoTaxRegions.map((t) => t.id) },
      })
    }
    logger.info("Removed the Europe region and its tax regions.")
  }

  // ---- Store, region and tax -----------------------------------------------

  const { data: stores } = await query.graph({ entity: "store", fields: ["id"] })
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: stores[0].id },
      update: {
        name: "LAYERD",
        supported_currencies: [{ currency_code: CURRENCY, is_default: true }],
      },
    },
  })

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id"],
    filters: { currency_code: CURRENCY },
  })
  let region: { id: string } = regions[0]
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Sri Lanka",
            currency_code: CURRENCY,
            countries: [COUNTRY],
            // Cash on delivery until payments.lk and Koko are onboarded.
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    region = result[0]
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: COUNTRY, provider_id: "tp_system" }],
    })
    logger.info("Created the Sri Lanka region (LKR).")
  }

  // ---- Stock location and delivery -----------------------------------------

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const salesChannel = salesChannels[0]
  const shippingProfile = shippingProfiles[0]

  const { data: existingLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    filters: { name: "LAYERD Studio" },
  })
  if (!existingLocations.length) {
    const { result: locations } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "LAYERD Studio",
            address: { city: "Colombo", country_code: "LK", address_1: "" },
          },
        ],
      },
    })
    const location = locations[0]

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })

    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "LAYERD island-wide delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Sri Lanka",
          geo_zones: [{ country_code: COUNTRY, type: "country" }],
        },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Island-wide delivery",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: `Rs ${DELIVERY_FEE} on every order, free over Rs 10,000.`,
            code: "standard",
          },
          prices: [
            { currency_code: CURRENCY, amount: DELIVERY_FEE },
            { region_id: region.id, amount: DELIVERY_FEE },
            {
              currency_code: CURRENCY,
              amount: 0,
              rules: [
                { attribute: "item_total", operator: "gte", value: FREE_DELIVERY_FROM },
              ],
            },
            {
              region_id: region.id,
              amount: 0,
              rules: [
                { attribute: "item_total", operator: "gte", value: FREE_DELIVERY_FROM },
              ],
            },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    })

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [salesChannel.id] },
    })
    logger.info("Created the studio location and island-wide delivery.")
  }

  // ---- Categories and collections ------------------------------------------

  const categoryIds = await ensureCategories(container, CATEGORIES)
  const giftChildIds = await ensureCategories(
    container,
    GIFT_CHILDREN.map((c) => ({ ...c, parent_category_id: categoryIds.gifts }))
  )
  Object.assign(categoryIds, giftChildIds)

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  const collectionIds: Record<string, string> = Object.fromEntries(
    existingCollections.map((c) => [c.handle, c.id])
  )
  const missingCollections = COLLECTIONS.filter((c) => !collectionIds[c.handle])
  if (missingCollections.length) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: missingCollections },
    })
    result.forEach((c) => (collectionIds[c.handle] = c.id))
  }

  // ---- Products ------------------------------------------------------------

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { handle: catalogue.map((p) => p.handle) },
  })
  const existingHandles = new Set(existingProducts.map((p) => p.handle))
  const toCreate = catalogue.filter((p) => !existingHandles.has(p.handle))

  if (toCreate.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: toCreate.map((product) => ({
          title: product.title,
          handle: product.handle,
          description: product.description,
          status: ProductStatus.PUBLISHED,
          weight: product.weight ?? undefined,
          material: "PLA",
          origin_country: "lk",
          shipping_profile_id: shippingProfile.id,
          category_ids: product.categories.map((handle) => categoryIds[handle]),
          collection_id: product.collection
            ? collectionIds[product.collection]
            : undefined,
          thumbnail: product.images[0],
          images: product.images.map((url) => ({ url })),
          sales_channels: [{ id: salesChannel.id }],
          options: product.options.length
            ? product.options.map((o) => ({ ...o, is_exclusive: true }))
            : [{ title: "Default", values: ["Default"], is_exclusive: true }],
          variants: product.variants.map((variant) => ({
            title: variant.title,
            sku: variant.sku,
            // Printed to order, so stock never runs out.
            manage_inventory: false,
            options: product.options.length
              ? variant.options
              : { Default: "Default" },
            // The pre-sale price is the base price; the sale price lives in
            // the price list below so the storefront can show both.
            prices: [
              {
                currency_code: CURRENCY,
                amount: variant.compare_at ?? variant.price,
              },
            ],
          })),
        })),
      },
    })
    logger.info(`Created ${toCreate.length} product(s).`)

    const { data: created } = await query.graph({
      entity: "product",
      fields: ["handle", "variants.id", "variants.sku"],
      filters: { handle: toCreate.map((p) => p.handle) },
    })
    const variantIdBySku = new Map(
      created.flatMap((p) =>
        (p.variants ?? []).map((v) => [v!.sku as string, v!.id] as const)
      )
    )
    const salePrices = toCreate.flatMap((product) =>
      product.variants
        .filter((variant) => variant.compare_at)
        .map((variant) => ({
          amount: variant.price,
          currency_code: CURRENCY,
          variant_id: variantIdBySku.get(variant.sku)!,
        }))
    )
    if (salePrices.length) {
      await createPriceListsWorkflow(container).run({
        input: {
          price_lists_data: [
            {
              title: "Launch prices",
              description: "Introductory prices carried over from layerd.lk.",
              status: PriceListStatus.ACTIVE,
              prices: salePrices,
            },
          ],
        },
      })
      logger.info(`Added ${salePrices.length} sale price(s).`)
    }
  }

  // ---- Search index ----------------------------------------------------------

  // `medusa exec` can exit before async product events are indexed, so replay
  // the ingestion here. `consume` upserts, so this is safe to repeat.
  if (reindexSearch) {
    const search = container.resolve(Modules.SEARCH)
    const { data: allProducts } = await query.graph({
      entity: "product",
      fields: ["id"],
    })
    for (let start = 0; start < allProducts.length; start += 25) {
      await search.ingest({
        name: "product.created",
        data: allProducts.slice(start, start + 25).map((p) => ({ id: p.id })),
      } as never)
    }
  }

  logger.info("LAYERD store is ready.")
}

async function ensureCategories(
  container: ExecArgs["container"],
  categories: {
    handle: string
    name: string
    description: string
    parent_category_id?: string
  }[]
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: categories.map((c) => c.handle) },
  })
  const ids: Record<string, string> = Object.fromEntries(
    existing.map((c) => [c.handle, c.id])
  )
  const missing = categories.filter((c) => !ids[c.handle])
  if (missing.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((c) => ({ ...c, is_active: true })),
      },
    })
    result.forEach((c) => (ids[c.handle] = c.id))
  }
  return ids
}
