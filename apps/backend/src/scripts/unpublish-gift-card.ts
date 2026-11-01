import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Hides the LAYERD Gift Card from the store by making it a draft: Medusa has
 * no gift card redemption yet, so a bought card couldn't be spent. Publish it
 * again from the admin once gift cards are supported.
 *
 *   medusa exec ./src/scripts/unpublish-gift-card.ts
 */
export default async function unpublishGiftCard({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { result } = await updateProductsWorkflow(container).run({
    input: {
      selector: { handle: "layerd-gift-card" },
      update: { status: ProductStatus.DRAFT },
    },
  })

  logger.info(`Gift card products set to draft: ${result.length}`)
}
