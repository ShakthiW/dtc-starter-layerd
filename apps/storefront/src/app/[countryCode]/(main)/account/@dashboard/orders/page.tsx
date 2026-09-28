import { Metadata } from "next"

import AccountPageHeader from "@modules/account/components/account-page-header"
import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Orders | LAYERD",
  description: "Your LAYERD orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <AccountPageHeader
        title="Orders"
        description="Every order you've placed, newest first. Open one to see its items, delivery details and status."
      />
      <OrderOverview orders={orders} />
      {/* TransferRequestForm (claim a guest order) is hidden until the
          backend can send the confirmation email it depends on. */}
    </div>
  )
}
