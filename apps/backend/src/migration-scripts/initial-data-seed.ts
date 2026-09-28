import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  createStoresWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

import { setupLayerdStore } from "../scripts/seed-layerd"

/**
 * Runs once on a fresh database: creates the sales channel, publishable API
 * key and store, then sets LAYERD up (Sri Lanka region in LKR, cash on
 * delivery, island-wide delivery and the catalogue). Databases that already
 * ran the starter's Europe seed use `npx medusa exec ./src/scripts/seed-layerd.ts`
 * instead, which also removes the demo data.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Seeding store data...")
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "LAYERD online store",
        },
      ],
    },
  })

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  })

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "LAYERD",
          supported_currencies: [{ currency_code: "lkr", is_default: true }],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  })

  // The search module seeds its index on first boot, so no replay here
  await setupLayerdStore(container, { reindexSearch: false })
}
