import { reindexSearchIndexesWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Rebuilds the product search index (store listing, search, price filter and
 * sale badges) on a schedule. Price lists emit no events, and a price list
 * starting or ending changes prices silently, so the index's event updates
 * alone would leave sale prices stale (see the TODOs in src/search/product.ts).
 */
export default async function reindexProductSearchJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    await reindexSearchIndexesWorkflow(container).run({
      input: { index: "product" },
    })
  } catch (error) {
    // The next run tries again
    logger.error(
      `Product search reindex failed: ${(error as Error).message}`
    )
  }
}

export const config = {
  name: "reindex-product-search",
  schedule: "*/10 * * * *",
}
